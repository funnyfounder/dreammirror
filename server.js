
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Allow requests from frontend

const HF_API_URL = "https://api-inference.huggingface.co/models/openai-community/gpt2";

// Endpoint for dream interpretation
app.post("/interpret", async (req, res) => {
  try {
    const { dream, perspectives } = req.body;

    if (!dream) {
      return res.status(400).json({ error: "Dream text is required." });
    }

    // Build prompt
    const prompt = `
You are a Dream Interpretation Assistant.
Interpret this dream under the following perspectives: ${perspectives.join(", ")}.
Dream: ${dream}

Return structured sections with headings for each perspective. Avoid repetition.
    `;

    // Call Hugging Face API
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    const output = data[0]?.generated_text || "No interpretation generated.";

    res.json({ interpretation: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
