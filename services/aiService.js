import axios from "axios";
import Meeting from "../models/Meeting.js";
import { getEmbedding } from "./embeddingService.js";
import cosineSimilarity from "cosine-similarity";

export async function analyzeMeeting(transcript) {
  try {
    const queryEmbedding = await getEmbedding(transcript);

    const pastMeetings = await Meeting.find();

    const scored = pastMeetings.map(m => {
      try {
        if (!m.embedding) return { meeting: m, score: 0 };
        return {
          meeting: m,
          score: cosineSimilarity(queryEmbedding, m.embedding)
        };
      } catch {
        return { meeting: m, score: 0 };
      }
    });

    scored.sort((a, b) => b.score - a.score);

    const context = scored.slice(0, 3)
      .map(s => s.meeting.summary)
      .join("\n");

    const prompt = `
Use this context:
${context}

Analyze meeting:
${transcript}

Return JSON:
{
  "summary": "",
  "action_items": [],
  "decisions": [],
  "follow_ups": []
}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );

    let text = response.data.choices[0].message.content;

    let parsed;

    try {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match[0]);
    } catch {
      parsed = {
        summary: text,
        action_items: [],
        decisions: [],
        follow_ups: []
      };
    }

    // Normalize arrays
    ["action_items", "decisions", "follow_ups"].forEach(key => {
      parsed[key] = (parsed[key] || []).map(i =>
        typeof i === "string" ? i : JSON.stringify(i)
      );
    });

    const meeting = new Meeting({
      transcript,
      ...parsed,
      embedding: queryEmbedding
    });

    await meeting.save();

    return parsed;

  } catch (err) {
    console.error("AI ERROR:", err.message);
    throw new Error("AI processing failed");
  }
}