import mongoose, { mongo } from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email :{type: String, required: true}, 
  phoneNumber : {type: Number , required: true}, 
  otp: {type: Number, required: true}, 
  otpVerified: {type: Boolean , default: false}, 
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
  friends: [String], 
  friendRequests: [String], 
});

const pendingUserSchema = new mongoose.Schema({
  name: {type: String, required: true}, 
  email: {type:String, required: true}, 
  phoneNumber: {type:Number, required: true}, 
  passwordHash: { type: String, required: true },
  otp: {type:Number, required: true}, 
  otpVerified: {type:Number, default: false}, 
  created_at: {type: Date, default: Date.now()}, 
})


export default  {
  User: userSchema, 
  PendingUser : pendingUserSchema
}
