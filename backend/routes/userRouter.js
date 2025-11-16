import express from 'express';
import bcrypt from 'bcryptjs';
import  User  from "../models/User.js";
import pendingUser from '../models/pendingUser.js';
import jwt from 'jsonwebtoken';
import { generateOtp } from '../lib/otp-generator.js';
import twilio from "twilio";



const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('Register endpoint hit', req.body);
  console.log("request body : ",req.body)
  try {
  const { name, email, password , phoneNumber} = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pending= await pendingUser.findOne({email}); 
    if(pending) return res.status(401).json({message: "Verify Phone Number First "}); 

    const existing = await User.findOne({ email });
    console.log("Existing User : ", existing)
    if(!existing.otpVerified) return res.status(400).json({message: "OTP not verified"})
    console.log("user registered: ", name)
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
    
    if (!email || !name || !password || !phoneNumber ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already registered" });
    
    const otp = generateOtp(); 
    const passwordHash = await bcrypt.hash(password, 10);

   const pending_user  = await pendingUser.findOneAndUpdate(
      {email},
      
      {name, 
      email,
      phoneNumber, 
      passwordHash, 
      otp, 
      otpVerified:false 
      },
     {upsert: true, new:true}
  )
   const account_sid = process.env.TWILIO_ACCOUNT_SID
   const auth_token = process.env.TWILIO_AUTH_TOKEN
   const twilio_phone_number = process.env.TWILIO_PHONE_NUMBER
   
   // Validate Twilio credentials
   if (!account_sid || !auth_token || !twilio_phone_number) {
     console.error('Twilio credentials missing:', {
       hasAccountSid: !!account_sid,
       hasAuthToken: !!auth_token,
       hasPhoneNumber: !!twilio_phone_number
     });
     return res.status(500).json({ 
       error: 'SMS service configuration error. Please contact support.' 
     });
   }

   console.log('Twilio phone number:', twilio_phone_number);
   const client = new twilio(account_sid, auth_token); 

   try {
     await client.messages.create({
       body: `Your MovieSync OTP is ${otp}`,
       from: twilio_phone_number,
       to: phoneNumber,
     });
     console.log(`OTP: ${otp} Send to :   ${phoneNumber}`);
     res.status(200).json({message: `OTP Send to  ${phoneNumber}`}); 
   } catch (twilioError) {
     // Handle Twilio-specific errors
     const errorCode = twilioError?.code;
     const errorMessage = twilioError?.message || '';
     
     // Check if it's an unverified number error (common in trial accounts)
     if (errorCode === 21211 || errorMessage.toLowerCase().includes('unverified')) {
       console.error('Twilio unverified number error:', twilioError);
       console.log(`\n⚠️  DEVELOPMENT MODE: OTP for ${phoneNumber} is ${otp}`);
       console.log('⚠️  This number needs to be verified in Twilio trial account\n');
       
       // In development, we can still return success but log the OTP
       // In production, you'd want to handle this differently
       if (process.env.NODE_ENV === 'development') {
         console.log(`\n🔑 OTP for ${email} (${phoneNumber}): ${otp}\n`);
         return res.status(200).json({
           message: `OTP generated. Check console for OTP (Trial account limitation)`,
           otp: otp // Only in development
         });
       }
       
       return res.status(400).json({
         error: 'Phone number not verified. Please verify your number in Twilio or use a verified number for testing.',
         message: 'Trial account limitation: Unverified numbers cannot receive SMS'
       });
     }
     
     // Re-throw to be caught by outer catch
     throw twilioError;
   }
   } catch (error) {
    console.error('Send OTP error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to send OTP. Please try again later.';
    
    if (error.code === 21211 || error.message?.toLowerCase().includes('unverified')) {
      userMessage = 'Phone number not verified. Please verify your number in Twilio or contact support.';
    } else if (error.code === 21608) {
      userMessage = 'Invalid phone number format. Please check your phone number.';
    } else if (error.code === 20003) {
      userMessage = 'Invalid Twilio credentials. Please contact support.';
    }
    
    res.status(500).json({
      error: userMessage,
      message: error.message || 'Internal Server Error'
    });  
  }

} )

router.post("/verfiyOtp", async(req,res)=>{

  try {
    

  const {email, otp } = req.body; 
  
  const pending_user = await pendingUser.findOne({email}); 

  if(!pending_user) return res.status(404).json({message: "Email not registered"})

  if(pending_user.otp != otp) return res.status(400).json({message: "Invalid OTP"}); 

      const user = new User({
      name: pending_user.name,
      email: pending_user.email,
      passwordHash: pending_user.passwordHash,
      phoneNumber: pending_user.phoneNumber,
      otp: otp, 
      otpVerified: true,
      preferences: { genres: [], platforms: [], mood_history: [] },
      viewing_history: [],
      friends: [],
      friendRequests: [],
    });

    await user.save(); 
    await pending_user.deleteOne({email}); 
    res.status(201).json({ message: 'OTP  Verified successfully' });
  } catch (error) {
      console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message });
  }
})

export default router; 