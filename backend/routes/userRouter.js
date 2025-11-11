import express from 'express';
import User from '../models/User.js';
import PendingUser from '../models/User.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOtp } from '../lib/otp-generator.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('Register endpoint hit', req.body);
  console.log("request body : ",req.body)
  try {
  const { name, email, password , phoneNumber} = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if(!existing.otpVerified) return res.status(400).json({message: "OTP not verified"})
    if (existing) return res.status(201).json({ message: 'User registered' });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  console.log('Login endpoint hit', req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Password dosen't match" });
    
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie("token",token, {
      httpOnly:true,
      secure:process.env.NODE_ENV=="production"
    }).status(200).json({
      user: {
        userId: user._id,
        email: user.email, 
        name: user.name,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences || { genres: [], platforms: [], mood_history: [] },
        viewing_history: user.viewing_history || [],
        created_at: user.created_at,
        updated_at: user.updated_at,
        friends: user.friends || [],
        friendRequests: user.friendRequests || [],
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', async (req, res)=> {
    res.cookie("token","",{
      httpOnly: true ,
      secure: process.env.NODE_ENV=="production", 
      expires: new Date(0)
    })

    res.status(200).json({message: "User logged out "})
})

router.post("/sendOtp",async (req,res)=>{
   const { name, email, password , phoneNumber} = req.body;
  try {
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already registered" });
    
    const otp = generateOtp(); 
    const passwordHash = await bcrypt.hash(password, 10);

   const pendingUser  = await PendingUser.findOneAndUpdate(
      {email},
      
      {name, 
      email,
      phoneNumber, 
      passwordHash, 
      otp, 
      },
     {upsert: true, new:true}
  )
   res.status(200).json({message: "OTP generated",otp}); 
   } catch (error) {
    res.status(500).json({message:"Internal Server Error "}); 
    console.log(error);  
  }

} )

router.post("/verfiy-otp", async(req,res)=>{

  try {
    

  const {email, otp } = req.body; 
  
  const pendingUser = await PendingUser.findOne({email}); 

  if(!pendingUser) return res.status(404).json("Email not registered")

  if(pendingUser.otp != otp) return res.status(400).json({message: "Invalid OTP"}); 

      const user = new User({
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      phoneNumber: pending.phoneNumber,
      otp: otp, 
      otpVerified: true,
      preferences: { genres: [], platforms: [], mood_history: [] },
      viewing_history: [],
      created_at: now,
      updated_at: now,
      friends: [],
      friendRequests: [],
    });

    await user.save(); 
    await pendingUser.deleteOne({email}); 
    res.status(201).json({ message: 'OTP  Verified successfully' });
  } catch (error) {
      console.error('Verify OTP error:', err);
    res.status(500).json({ message: err.message });
  }
})

export default router; 