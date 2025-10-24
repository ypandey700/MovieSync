import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
  passwordHash: { type: String, required: true },
  preferences: {
    genres: [String],
    platforms: [String],
    mood_history: [String],
  },
  viewing_history: [
    {
      contentId: String,
      title: String,
      platform: String,
      watchTime: Number,
      rating: Number,
      timestamp: String,
      thumbnailUrl: String,
      lastWatchPosition: Number,
      totalDuration: Number,
    }
  ],
  created_at: { type: String },
  updated_at: { type: String },
  vibeCircleIds: [String],
  friends: [String], // userIds of friends
  friendRequests: [String], // userIds of pending requests
});

e
