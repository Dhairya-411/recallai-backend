import express from "express";
import axios from "axios";
import Meeting from "../models/Meeting.js";
import { getEmbedding } from "../services/embeddingService.js";
import cosineSimilarity from "cosine-similarity";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    // 1) Embed query
    const queryEmbedding = await getEmbedding(question);

    // 2) Fetch meetings
    const meetings = await Meeting.find();

    // 3) Rank by similarity
    const scored = meetings.map(m => ({
      meeting: m,
      score: m.embedding
        ? cosineSimilarity(queryEmbedding, m.embedding)
        : 0
    }));

    scored.sort((a, b) => b.score - a.score);

    // 4) Build context
    const context = scored
      .slice(0, 3)
      .map(s => s.meeting.summary)
      .join("\n");

    // 5) Ask LLM
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "user",
            content: `Answer using context:\n${context}\n\nQuestion: ${question}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );

    const answer = response.data.choices[0].message.content;

    res.json({ answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;