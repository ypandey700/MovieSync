import mongoose, { mongo } from 'mongoose';


const pendingUserSchema = new mongoose.Schema({
  name: {type: String, required: true}, 
  email: {type:String, required: true}, 
  phoneNumber: {type:Number, required: true}, 
  passwordHash: { type: String, required: true },
  otp: {type:Number, required: true}, 
  otpVerified: {type:Number, default: false}, 
  created_at: {type: Date, default: Date.now()}, 
})

export default  mongoose.model("PendingUser", pendingUserSchema);
