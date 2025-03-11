import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  analyzeRoom, 
  simplifyRoomDataForAI, 
  generateRoomDescription,
  generateAIPrompt
} from "../utils/RoomUtils";

// 從環境變數獲取 API Key
const API_KEY = "AIzaSyDw1Otmq3vhW7rFaa6GCHAmr6BY_A69gkY";
console.log("API Key loaded:", API_KEY ? "Yes (key is defined)" : "No (key is undefined)");

const genAI = new GoogleGenerativeAI(API_KEY);

// 獲取 Gemini 模型
const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
};

// 與 Gemini 進行對話，包含房間數據
export const chatWithGeminiAboutRoom = async (prompt) => {
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

// 生成材質建議
export const generateMaterialSuggestions = async (prompt) => {
  try {
    const enhancedPrompt = generateAIPrompt(prompt, 'material');
    
    const model = getGeminiModel();
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const responseText = response.text();
    
    // 嘗試解析 JSON 回應
    try {
      // 提取 JSON 部分（如果有其他文本）
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return {
          success: true,
          suggestions: JSON.parse(jsonStr),
          rawResponse: responseText
        };
      } else {
        return {
          success: false,
          message: "無法解析 AI 回應為 JSON 格式",
          rawResponse: responseText
        };
      }
    } catch (parseError) {
      return {
        success: false,
        message: "解析 JSON 時出錯: " + parseError.message,
        rawResponse: responseText
      };
    }
  } catch (error) {
    console.error("Error generating material suggestions:", error);
    throw error;
  }
};

// 生成家具擺放建議
export const generateFurnitureSuggestions = async (prompt) => {
  try {
    const enhancedPrompt = generateAIPrompt(prompt, 'furniture');
    
    const model = getGeminiModel();
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const responseText = response.text();
    
    // 嘗試解析 JSON 回應
    try {
      // 提取 JSON 部分（如果有其他文本）
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return {
          success: true,
          suggestions: JSON.parse(jsonStr),
          rawResponse: responseText
        };
      } else {
        return {
          success: false,
          message: "無法解析 AI 回應為 JSON 格式",
          rawResponse: responseText
        };
      }
    } catch (parseError) {
      return {
        success: false,
        message: "解析 JSON 時出錯: " + parseError.message,
        rawResponse: responseText
      };
    }
  } catch (error) {
    console.error("Error generating furniture suggestions:", error);
    throw error;
  }
};

// 原有的聊天函數
export const chatWithGemini = async (prompt) => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};

// 測試 Gemini 連接
export const testGeminiConnection = async () => {
  try {
    const response = await chatWithGemini("Hello, can you hear me?");
    return {
      success: true,
      message: response
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};