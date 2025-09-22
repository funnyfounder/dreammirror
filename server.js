import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const HF_API_URL = "https://api-inference.huggingface.co/models/openai-community/gpt2";

app.post("/interpret", async (req, res) => {
  try {
    const { dream, perspectives } = req.body;

    if (!dream) {
      return res.status(400).json({ error: "Dream text is required." });
    }

    const prompt = `
You are a Dream Interpretation Assistant.
Interpret this dream under the following perspectives: ${perspectives.join(", ")}.
Dream: ${dream}

Return structured sections with headings for each perspective in the format:
[Perspective Name]:
Interpretation text here.
    `;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();
    let output = data[0]?.generated_text || "No interpretation generated.";

    // Optional: Clean up the output by trimming repeated prompt text
    output = output.replace(prompt, "").trim();

    res.json({ interpretation: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

