import { GoogleGenAI } from "@google/genai";

export async function geminiDirectQuery(query: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyA7x4GdafR8u16AxlTdCxSnd4QKP2Gb9a4" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
    });
    return response?.text || response?.candidates?.[0]?.content?.[0]?.text || JSON.stringify(response);
  } catch (err: any) {
    return `Gemini error: ${err?.message || err}`;
  }
}
