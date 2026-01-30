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

  try {
    // Call the backend API endpoint instead of calling Gemini directly
    const response = await fetch('/api/generate-infographic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new InfographicError(
        errorData.error || `Server error: ${response.status}`,
        errorData.code
      );
    }

    const data = await response.json();

    // Basic structural validation
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      throw new InfographicError("Could not identify distinct process steps in your text.");
    }

    return data as InfographicData;
  } catch (error: any) {
    console.error("API Parsing Error:", error);

    if (error instanceof InfographicError) throw error;

    if (error.message?.includes('Failed to fetch')) {
      throw new InfographicError("Unable to connect to the server. Please check your internet connection.");
    }

    throw new InfographicError(
      "Our AI engine encountered an issue processing your request. Please try again or rephrase your input.",
      "PARSING_FAILED"
    );
  }
}