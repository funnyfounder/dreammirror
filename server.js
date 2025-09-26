import express from "express";
import bodyParser from "body-parser";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Instantiate your Hugging Face Inference client with the token from your environment
const hf = new HfInference(process.env.HF_API_KEY);
const model = "google/flan-t5-small";

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

    const result = await hf.textGeneration({
      model: model,
      inputs: prompt,
      max_new_tokens: 200,
      temperature: 0.7,
    });

    let output = result.generated_text || "No interpretation generated.";

    // Optional: Clean up the output by trimming repeated prompt text
    output = output.replace(prompt, "").trim();

    res.json({ interpretation: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error

