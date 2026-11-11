// components/Model.jsx
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateContent = async (prompt) => {
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  console.log(text);
  return text;
};
