import { GoogleGenAI } from "@google/genai";

// The client will read the API key from process.env.GEMINI_API_KEY
// so we can initialize with an empty config object (library handles env).
const ai = new GoogleGenAI({});

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