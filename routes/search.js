import express from "express";
import Meeting from "../models/Meeting.js";
import { getEmbedding } from "../services/embeddingService.js";
import cosineSimilarity from "cosine-similarity";

const router = express.Router();

router.post("/search", async (req, res) => {
  const { query } = req.body;

  const queryEmbedding = await getEmbedding(query);
  const meetings = await Meeting.find();

  const results = meetings.map(m => ({
    meeting: m,
    score: m.embedding
      ? cosineSimilarity(queryEmbedding, m.embedding)
      : 0
  }));

  results.sort((a, b) => b.score - a.score);

  res.json(results.slice(0, 5));
});

export default router;