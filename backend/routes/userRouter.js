import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('Register endpoint hit', req.body);
  try {
    const { displayName, email, password } = req.body;
    if (!email || !displayName || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const user = new User({
      displayName,
      passwordHash,
      preferences: { genres: [], platforms: [], mood_history: [] },
      viewing_history: [],
      created_at: now,
      updated_at: now,
      friends: [],
      friendRequests: [],
    });
    await user.save();
    res.status(201).json({ message: 'User registered' });
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
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie("token",token, {
      httpOnly:true,
      secure:process.env.NODE_ENV=="production"
    }).status(300).json({
      user: {
        userId: user.userId,
        displayName: user.displayName,
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

export default router; 
