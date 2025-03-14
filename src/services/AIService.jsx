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

/**
 * 根據 prompt 從 preloadedTextures 中找出適合的材質並應用到房間
 * @param {string} prompt 用戶提示詞
 * @param {string} targetType 目標類型 ('floor', 'wall', 'ceiling', 'all')
 * @returns {Promise<Object>} 應用結果
 */
export const findAndApplyTextures = async (prompt, targetType = 'all') => {
  try {
    // 獲取 store 實例
    const store = useSelectionStore.getState();

    
    // 檢查是否有預加載的紋理
    if (!store.preloadedTextures || Object.keys(store.preloadedTextures).length === 0) {
      return {
        success: false,
        message: "沒有可用的材質"
      };
    }
    
    // 檢查是否有房間數據
    if (!store.roomData) {
      return {
        success: false,
        message: "沒有房間數據"
      };
    }
    
    // 準備材質列表供 AI 選擇
    const availableTextures = Object.entries(store.preloadedTextures).map(([name, data]) => ({
      name,
      description: data.description || null,
      tags: data.tags || null,
      price: data.price || 0,
      properties: {
        roughness: data.textures?.roughness || 0.5,
        metalness: data.textures?.metalness || 0,
        color: data.textures?.color || "default"
      }
    }));
    
    // Create AI prompt
    const textureSelectionPrompt = `
You are a professional interior design AI assistant. Please select the most suitable materials based on the user's requirements from the following available materials:

Available materials list:
${JSON.stringify(availableTextures, null, 2)}

User requirement: ${prompt}

Please select the most suitable materials for ${targetType === 'all' ? 'floor, walls, and ceiling' : targetType} according to the user's requirements.
The response must be in valid JSON format as follows:
{
  ${targetType === 'all' || targetType === 'floor' ? '"floor": "material name",' : ''}
  ${targetType === 'all' || targetType === 'wall' ? '"wall": "material name",' : ''}
  ${targetType === 'all' || targetType === 'ceiling' ? '"ceiling": "material name",' : ''}
  "explanation": "explanation of selection reasons"
}

Only return JSON format, no other text.
`;
    
    // Call AI to get material suggestions
    const model = getGeminiModel();
    const result = await model.generateContent(textureSelectionPrompt);
    const response = result.response;
    const responseText = response.text();
    
    // Parse the JSON response
    console.log("AI material selection response:", responseText);
    
    try {
      // Extract JSON from response text (in case there's any non-JSON text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      
      const selectedTextures = JSON.parse(jsonText);
      console.log("Parsed material selection:", selectedTextures);
      
      // Get store instance
      const store = useSelectionStore.getState();
      
      // Find and apply the selected textures
      let appliedChanges = [];
      
      // First select floor
      if (selectedTextures.floor && (targetType === 'all' || targetType === 'floor')) {
        const floorTextureName = selectedTextures.floor;
        
        // Find the texture by name
        const floorTexture = Object.entries(store.preloadedTextures)
          .find(([id, texture]) => texture.name.toLowerCase() === floorTextureName.toLowerCase());
        
        if (floorTexture && store.roomData?.floor) {
          const [textureId, textureData] = floorTexture;
          console.log(`Applying floor material: ${floorTextureName}`, floorTexture);
          
          // Copy roomData to avoid mutation
          const newRoomData = { ...store.roomData };
          
          // Then apply material
          store.setMaterialTexture('floor', textureId);
          appliedChanges.push(`Floor to ${floorTextureName}`);
        } else {
          console.warn(`Cannot find floor material: ${floorTextureName} or floor data doesn't exist`);
        }
      }
      
      // Apply wall material
      if (selectedTextures.wall && (targetType === 'all' || targetType === 'wall')) {
        const wallTextureName = selectedTextures.wall;
        
        // Find the texture by name
        const wallTexture = Object.entries(store.preloadedTextures)
          .find(([id, texture]) => texture.name.toLowerCase() === wallTextureName.toLowerCase());
        
        if (wallTexture) {
          const [textureId, textureData] = wallTexture;
          console.log(`Applying wall material: ${wallTextureName}`, wallTexture);
          
          // Apply to each wall
          const wallKeys = Object.keys(store.roomData || {}).filter(key => key.includes('wall'));
          
          if (wallKeys.length > 0) {
            // Apply material
            wallKeys.forEach(wallKey => {
              store.setMaterialTexture(wallKey, textureId);
            });
            
            appliedChanges.push(`Walls to ${wallTextureName}`);
          }
        } else {
          console.warn(`Cannot find wall material: ${wallTextureName}`);
        }
      }
      
      // Apply ceiling material
      if (selectedTextures.ceiling && (targetType === 'all' || targetType === 'ceiling')) {
        const ceilingTextureName = selectedTextures.ceiling;
        
        // Find the texture by name
        const ceilingTexture = Object.entries(store.preloadedTextures)
          .find(([id, texture]) => texture.name.toLowerCase() === ceilingTextureName.toLowerCase());
        
        if (ceilingTexture && store.roomData?.ceiling) {
          const [textureId, textureData] = ceilingTexture;
          console.log(`Applying ceiling material: ${ceilingTextureName}`, ceilingTexture);
          
          // Apply material
          store.setMaterialTexture('ceiling', textureId);
          appliedChanges.push(`Ceiling to ${ceilingTextureName}`);
        } else {
          console.warn(`Cannot find ceiling material: ${ceilingTextureName} or ceiling data doesn't exist`);
        }
      }
      
      // Ensure all material changes are saved to roomData
      // Get latest roomData
      const updatedRoomData = store.roomData;
      
      // Clear selection
      store.clearSelectedObject();
      
      // Manually update roomData to ensure all changes are saved
      store.setRoomData(updatedRoomData);
      
      if (appliedChanges.length > 0) {
        return {
          success: true,
          message: `Applied AI selected materials: ${appliedChanges.join(', ')}`,
          selectedTextures,
          explanation: selectedTextures.explanation || "AI selected these materials based on your requirements"
        };
      } else {
        return {
          success: false,
          message: "No material changes applied",
          selectedTextures
        };
      }
    } catch (error) {
      console.error("Error finding and applying materials:", error);
      return {
        success: false,
        message: `Error finding and applying materials: ${error.message}`
      };
    }
  } catch (error) {
    console.error("查找和應用材質時出錯:", error);
    return {
      success: false,
      message: `查找和應用材質時出錯: ${error.message}`
    };
  }
};