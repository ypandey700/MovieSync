import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  contentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  genre: [String],
  platform: { type: String },
  rating: { type: Number },
  duration: { type: Number },
  thumbnailUrl: { type: String },
  bannerUrl: { type: String },
  deepLink: { type: String },
  description: { type: String },
  mood_tags: [String],
  cast: [String],
  director: { type: String },
  year: { type: Number },
  timestamp: { type: String },
  videoUrl: { type: String },
  peakWatchData: [
    {
      timestampPercent: Number,
      intensity: Number,
      label: String,
    }
  ],
  imdbID: { type: String },
});

export default mongoose.model('Content', contentSchema); 
