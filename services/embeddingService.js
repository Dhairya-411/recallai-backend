export async function getEmbedding(text) {
  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    const data = await res.json();

    if (!Array.isArray(data)) {
      return Array(384).fill(0);
    }

    return data;

  } catch {
    return Array(384).fill(0);
  }
}