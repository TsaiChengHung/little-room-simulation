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
      description: data.name || name,
      price: data.price || 0,
      properties: {
        roughness: data.textures?.roughness || 0.5,
        metalness: data.textures?.metalness || 0,
        color: data.textures?.color || "default"
      }
    }));
    
    // 創建 AI 提示詞
    const textureSelectionPrompt = `
你是一位專業的室內設計 AI 助手。請根據用戶的需求，從以下可用的材質中選擇最適合的材質：

可用材質列表:
${JSON.stringify(availableTextures, null, 2)}

用戶需求: ${prompt}

請根據用戶需求，為${targetType === 'all' ? '地板、牆壁和天花板' : targetType}選擇最適合的材質。
回答格式必須是有效的 JSON，格式如下:
{
  ${targetType === 'all' || targetType === 'floor' ? '"floor": "材質名稱",' : ''}
  ${targetType === 'all' || targetType === 'wall' ? '"wall": "材質名稱",' : ''}
  ${targetType === 'all' || targetType === 'ceiling' ? '"ceiling": "材質名稱",' : ''}
  "explanation": "選擇理由說明"
}

只返回 JSON 格式，不要有其他文字。
`;
    
    // 調用 AI 獲取材質建議
    const model = getGeminiModel();
    const result = await model.generateContent(textureSelectionPrompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log("AI 回應:", responseText);
    
    // 解析 AI 回應
    let selectedTextures;
    try {
      // 提取 JSON 部分（如果有其他文本）
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        selectedTextures = JSON.parse(jsonMatch[0]);
        console.log("解析後的材質選擇:", selectedTextures);
      } else {
        return {
          success: false,
          message: "無法解析 AI 回應為 JSON 格式",
          rawResponse: responseText
        };
      }
    } catch (error) {
      console.error("解析 JSON 時出錯:", error);
      return {
        success: false,
        message: "解析 JSON 時出錯: " + error.message,
        rawResponse: responseText
      };
    }
    
    // 記錄應用的變更
    const appliedChanges = [];
    
    // 應用地板材質
    if (selectedTextures.floor && (targetType === 'all' || targetType === 'floor')) {
      const floorTextureName = selectedTextures.floor;
      const floorTexture = store.preloadedTextures[floorTextureName];
      
      if (floorTexture && store.roomData.floor) {
        console.log(`應用地板材質: ${floorTextureName}`, floorTexture);
        
        // 首先選擇地板
        store.setSelectedObject({
          type: "room",
          name: "floor",
          object: "floor"
        });
        
        // 然後應用材質
        store.setMaterialTexture({
          name: floorTextureName,
          price: floorTexture.price || 0,
          textures: floorTexture.textures
        });
        
        appliedChanges.push(`地板: ${floorTextureName}`);
      } else {
        console.warn(`找不到地板材質: ${floorTextureName} 或地板數據不存在`);
      }
    }
    
    // 應用牆壁材質
    if (selectedTextures.wall && (targetType === 'all' || targetType === 'wall')) {
      const wallTextureName = selectedTextures.wall;
      const wallTexture = store.preloadedTextures[wallTextureName];
      
      if (wallTexture) {
        console.log(`應用牆壁材質: ${wallTextureName}`, wallTexture);
        
        // 找出所有牆壁
        const wallKeys = Object.keys(store.roomData).filter(key => key.startsWith('wall-'));
        
        // 應用到每個牆壁
        let wallsApplied = 0;
        for (const wallKey of wallKeys) {
          // 選擇牆壁
          store.setSelectedObject({
            type: "room",
            name: wallKey,
            object: wallKey
          });
          
          // 應用材質
          store.setMaterialTexture({
            name: wallTextureName,
            price: wallTexture.price || 0,
            textures: wallTexture.textures
          });
          
          wallsApplied++;
        }
        
        if (wallsApplied > 0) {
          appliedChanges.push(`牆壁 (${wallsApplied}個): ${wallTextureName}`);
        }
      } else {
        console.warn(`找不到牆壁材質: ${wallTextureName}`);
      }
    }
    
    // 應用天花板材質
    if (selectedTextures.ceiling && (targetType === 'all' || targetType === 'ceiling')) {
      const ceilingTextureName = selectedTextures.ceiling;
      const ceilingTexture = store.preloadedTextures[ceilingTextureName];
      
      if (ceilingTexture && store.roomData.ceiling) {
        console.log(`應用天花板材質: ${ceilingTextureName}`, ceilingTexture);
        
        // 選擇天花板
        store.setSelectedObject({
          type: "room",
          name: "ceiling",
          object: "ceiling"
        });
        
        // 應用材質
        store.setMaterialTexture({
          name: ceilingTextureName,
          price: ceilingTexture.price || 0,
          textures: ceilingTexture.textures
        });
        
        appliedChanges.push(`天花板: ${ceilingTextureName}`);
      } else {
        console.warn(`找不到天花板材質: ${ceilingTextureName} 或天花板數據不存在`);
      }
    }
    
    // 確保所有材質更改都已經被保存到roomData中
    // 獲取最新的roomData
    const updatedRoomData = { ...store.roomData };
    
    // 清除選擇
    store.clearSelectedObject();
    
    // 手動更新roomData以確保所有更改都被保存
    store.setRoomData(updatedRoomData);
    
    // 返回結果
    if (appliedChanges.length > 0) {
      return {
        success: true,
        message: `已應用 AI 選擇的材質: ${appliedChanges.join(', ')}`,
        selectedTextures,
        explanation: selectedTextures.explanation || "AI 根據您的需求選擇了這些材質"
      };
    } else {
      return {
        success: false,
        message: "沒有應用任何材質變更",
        selectedTextures
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