
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "Reply: Gemini API is working!",
    });

    return Response.json({
      success: true,
      reply: response.text,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
