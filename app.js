require('dotenv').config();
const express = require('express');
const { HfInference } = require('@huggingface/inference');
const app = express();

const hf = new HfInference(process.env.HF_API_TOKEN);
const PORT = 3000;

app.use(express.json());

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  try {
    const result = await hf.textGeneration({
      model: process.env.HF_MODEL,
      inputs: prompt,
      max_new_tokens: 100
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app; // Exporting the app for external usage
