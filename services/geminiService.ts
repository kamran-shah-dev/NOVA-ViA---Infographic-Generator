import { InfographicData } from "../types";

export class InfographicError extends Error {
  constructor(public message: string, public code?: string) {
    super(message);
    this.name = 'InfographicError';
  }
}

export async function parseInfographicText(text: string): Promise<InfographicData> {
  if (!text || text.trim().length < 5) {
    throw new InfographicError(
      "Input text is too short to generate an infographic. Please provide more detail."
    );
  }

  try {
    // Call YOUR backend API instead of Gemini directly
    const response = await fetch('/api/generate-infographic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new InfographicError(
        data.error || "Something went wrong. Please try again.",
        response.status.toString()
      );
    }

    return data as InfographicData;

  } catch (error: any) {
    console.error("API Error:", error);

    if (error instanceof InfographicError) {
      throw error;
    }

    throw new InfographicError(
      "Failed to connect to the server. Please check your internet connection and try again.",
      "NETWORK_ERROR"
    );
  }
}