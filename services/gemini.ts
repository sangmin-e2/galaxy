
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getMissionBriefing(stage: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, intense sci-fi mission briefing for Stage ${stage} of a retro space shooter named 'Sangmin Galaxy'. 
      Keep it under 150 characters. Use urgent tone.`,
      config: {
        temperature: 0.8,
      },
    });
    return response.text?.trim() || "The galaxy depends on your skills, Pilot. Engage and survive.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Intelligence reports high activity in this sector. Proceed with caution.";
  }
}

export async function getPilotTip(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Give me a single one-sentence tactical tip for a space fighter pilot. Keep it short and cool.",
      config: {
        temperature: 0.7,
      },
    });
    return response.text?.trim() || "Never stop moving; a stationary target is a dead one.";
  } catch (error) {
    return "Watch the patterns. Every enemy has a weakness.";
  }
}
