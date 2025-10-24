import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  id: String,
  userId: String,
  userName: String,
  userAvatar: String,
  message: String,
  timestamp: String,
}, { _id: false });

const participantSchema = new mongoose.Schema({
  userId: String,
  displayName: String,
  avatarUrl: String,
}, { _id: false });

const watchPartySchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  hostId: { type: String, required: true },
  participants: [participantSchema],
  contentId: { type: String },
  content: { type: Object },
  currentTime: { type: Number },
  status: { type: String },
  chat_messages: [chatMessageSchema],
  joinCode: { type: String },
});

export default mongoose.model('WatchParty', watchPartySchema); 
