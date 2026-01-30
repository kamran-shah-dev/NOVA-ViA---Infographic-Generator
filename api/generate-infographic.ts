import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length < 5) {
    return res.status(400).json({
      error: "Input text is too short to generate an infographic. Please provide more detail.",
    });
  }

  // Initialize Gemini AI with server-side API key
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following text into a structured infographic format with a title and a sequence of steps. If no title is found, provide a suitable professional one based on the context. Assign a logical icon name (using Lucide icons, e.g., 'Activity', 'Check', 'Target', 'Layers', 'Users', 'Settings', 'Zap', 'Shield') to each step.

      Input Text:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Main title of the infographic" },
            subtitle: { type: Type.STRING, description: "Optional subtitle or context" },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  number: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  iconName: { type: Type.STRING, description: "A Lucide icon name" },
                },
                required: ["id", "number", "title", "description"],
              },
            },
          },
          required: ["title", "steps"],
        },
      },
    });

    const jsonText = response.text?.trim();

    if (!jsonText) {
      return res.status(500).json({
        error: "The AI model returned an empty response. Please try with different text.",
      });
    }

    const data = JSON.parse(jsonText);

    // Basic structural validation
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      return res.status(400).json({
        error: "Could not identify distinct process steps in your text.",
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);

    if (error.message?.includes("API_KEY") || error.message?.includes("API key")) {
      return res.status(500).json({
        error: "Invalid API key configured. Please check your environment settings.",
      });
    }

    return res.status(500).json({
      error: "Our AI engine encountered an issue processing your request. Please try again or rephrase your input.",
      code: "PARSING_FAILED",
    });
  }
}
