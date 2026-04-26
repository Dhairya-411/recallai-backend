import express from "express";
import { analyzeMeeting } from "../services/aiService.js";
import Meeting from "../models/Meeting.js";

const router = express.Router();

// Analyze
router.post("/analyze", async (req, res) => {
  try {
    const result = await analyzeMeeting(req.body.transcript);

    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });

  } catch (err) {
    console.error("FULL ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get all meetings
router.get("/meetings", async (req, res) => {
  const meetings = await Meeting.find()
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(meetings);
});

// Get single meeting
router.get("/meetings/:id", async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  res.json(meeting);
});

// Delete meeting
router.delete("/meetings/:id", async (req, res) => {
  await Meeting.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

export default router;