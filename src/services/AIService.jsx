import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  analyzeRoom, 
  simplifyRoomDataForAI, 
  generateRoomDescription,
  generateAIPrompt
} from "../utils/RoomUtils";
import useSelectionStore from "../components/Store/Store";

// 從環境變數獲取 API Key
const API_KEY = "AIzaSyDw1Otmq3vhW7rFaa6GCHAmr6BY_A69gkY";
console.log("API Key loaded:", API_KEY ? "Yes (key is defined)" : "No (key is undefined)");

const genAI = new GoogleGenerativeAI(API_KEY);

// 獲取 Gemini 模型
const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
};

// 測試與 Gemini 的連接
export const testGeminiConnection = async () => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    return { success: true, message: "連接成功" };
  } catch (error) {
    console.error("Error testing Gemini connection:", error);
    return { success: false, message: error.message };
  }
};

// 與 Gemini 進行對話，包含房間數據
export const chatWithGemini = async (prompt) => {
  try {
    const enhancedPrompt = generateAIPrompt(prompt, 'general');
    
    const model = getGeminiModel();
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error communicating with Gemini about room:", error);
    throw error;
  }
};