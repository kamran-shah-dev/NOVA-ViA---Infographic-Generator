import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

app.post("/api/infographic", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const result = await ai.models.generateContent({
      model: "gemini-3-flash",
      contents: text,
    });

    res.json(result);
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({
      error: "Gemini API failed or is overloaded",
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

