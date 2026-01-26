import { GoogleGenAI, Type } from "@google/genai";
import { InfographicData } from "../types";

export class InfographicError extends Error {
  constructor(public message: string, public code?: string) {
    super(message);
    this.name = 'InfographicError';
  }
}

export async function parseInfographicText(text: string): Promise<InfographicData> {
  if (!text || text.trim().length < 5) {
    throw new InfographicError("Input text is too short to generate an infographic. Please provide more detail.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Parse the following text into a structured infographic format with a title and a sequence of steps. If no title is found, provide a suitable professional one based on the context. Assign a logical icon name (using Lucide icons, e.g., 'Activity', 'Check', 'Target', 'Layers', 'Users', 'Settings', 'Zap', 'Shield') to each step. 
      
      Input Text:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Main title of the infographic' },
            subtitle: { type: Type.STRING, description: 'Optional subtitle or context' },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  number: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  iconName: { type: Type.STRING, description: 'A Lucide icon name' }
                },
                required: ['id', 'number', 'title', 'description']
              }
            }
          },
          required: ['title', 'steps']
        }
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new InfographicError("The AI model returned an empty response. Please try with different text.");
    }

    const data = JSON.parse(jsonText);
    
    // Basic structural validation
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      throw new InfographicError("Could not identify distinct process steps in your text.");
    }

    return data as InfographicData;
  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);
    
    if (error instanceof InfographicError) throw error;
    
    if (error.message?.includes('API_KEY')) {
      throw new InfographicError("Invalid API key configured. Please check your environment settings.");
    }
    
    throw new InfographicError(
      "Our AI engine encountered an issue processing your request. Please try again or rephrase your input.",
      "PARSING_FAILED"
    );
  }
}