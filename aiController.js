const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
  generateTrip: async (req, res) => {
    try {
      const prompt = "Where is Taj Mahal";
      const result = await model.generateContent(prompt);
      console.log(result.response.text);
      res.status(200).send(result.response.text);  
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }
};
