import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// Hugging Face API URL for the model
const HF_API_URL = "https://api-inference.huggingface.co/models/openai-community/gpt2";

// Endpoint for dream interpretation
app.post("/interpret", async (req, res) => {
  try {
    const { dream, perspectives } = req.body;

    // Build prompt for GPT-2
    const prompt = `
You are a Dream Interpretation Assistant.
Interpret this dream under the following perspectives: ${perspectives.join(", ")}.
Dream: ${dream}

Return structured sections with headings for each perspective. Avoid repetition.
    `;

    // Call Hugging Face Inference API
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150, // control response length
          temperature: 0.7,    // creativity
        }
      })
    });

    const data = await response.json();

    // GPT-2 API returns an array of generated_text objects
    const output = data[0]?.generated_text || "No interpretation generated.";

    res.json({ interpretation: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
