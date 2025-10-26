import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userAvatar: String,
  message: String,
  timestamp: String,
}, { _id: false });

const participantSchema = new mongoose.Schema({
  userId: String,
  name: String,
  avatarUrl: String,
}, { _id: false });

const watchPartySchema = new mongoose.Schema({
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
