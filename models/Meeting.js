import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  transcript: String,
  summary: String,
  action_items: [String],
  decisions: [String],
  follow_ups: [String],
  embedding: [Number],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Meeting", meetingSchema);