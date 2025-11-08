

import { GoogleGenAI } from "@google/genai";

// Pass the API key directly here
const ai = new GoogleGenAI({ apiKey: "AIzaSyA7x4GdafR8u16AxlTdCxSnd4QKP2Gb9a4" });

async function main() {
  const query = process.env.GEMINI_QUERY || "Hello! How can I help you?";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
    });

    // Print text if available otherwise stringify whole response
    const text = response?.text || response?.candidates?.[0]?.content?.[0]?.text || JSON.stringify(response);
    console.log(text);
  } catch (error) {
    console.error('Error generating content:', error?.message || error);
    process.exit(1);
  }
}

main();