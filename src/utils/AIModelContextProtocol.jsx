import useSelectionStore from "../components/Store/Store";

/**
 * AI指令解析器 - 將AI的文本指令轉換為app操作
 * @param {string} aiPrompt - AI的文本指令
 * @returns {Object} - 操作結果
 */
export const executeAITextureCommand = async (aiPrompt) => {
  try {
    // 獲取store的當前狀態
    const store = useSelectionStore.getState();
    
    // 1. 檢查是否有預加載的紋理
    if (!store.preloadedTextures || Object.keys(store.preloadedTextures).length === 0) {
      return {
        success: false,
        message: "沒有可用的材質"
      };
    }
    
    // 2. 解析AI指令
    const parsedCommand = parseAITextureCommand(aiPrompt, store.preloadedTextures);
    
    // 3. 執行指令
    if (parsedCommand.success) {
      const results = [];
      
      // 應用每個指定的材質
      for (const action of parsedCommand.actions) {
        const { target, textureId } = action;
        
        // 確認目標和材質都有效
        if (target && textureId && store.preloadedTextures[textureId]) {
          // 應用材質
          store.setMaterialTexture(target, textureId);
          
          results.push({
            target,
            textureId,
            textureName: store.preloadedTextures[textureId].name || textureId,
            success: true
          });
        } else {
          results.push({
            target,
            textureId,
            success: false,
            reason: !target ? "無效目標" : "無效材質ID"
          });
        }
      }
      
      return {
        success: true,
        message: `已成功執行${results.filter(r => r.success).length}個材質操作`,
        details: results
      };
    } else {
      return parsedCommand; // 返回解析錯誤
    }
  } catch (error) {
    console.error("執行AI指令時出錯:", error);
    return {
      success: false,
      message: `執行指令時出錯: ${error.message}`
    };
  }
};

/**
 * 解析AI的文本指令
 * @param {string} aiPrompt - AI的文本指令
 * @param {Object} availableTextures - 可用的材質
 * @returns {Object} - 解析結果
 */
function parseAITextureCommand(aiPrompt, availableTextures) {
  try {
    // 初始化結果
    const result = {
      success: false,
      actions: []
    };
    
    // 縮寫映射表
    const targetMapping = {
      '地板': 'floor',
      '地面': 'floor',
      '牆壁': 'wall', // 這裡可能需要特別處理來指定哪面牆
      '牆': 'wall',
      '天花板': 'ceiling',
      '頂棚': 'ceiling',
      '天頂': 'ceiling'
    };
    
    // 創建一個材質名稱到ID的映射
    const textureNameToId = {};
    for (const [id, texture] of Object.entries(availableTextures)) {
      textureNameToId[texture.name?.toLowerCase() || id.toLowerCase()] = id;
    }
    
    // 提取指令中提到的目標和材質
    // 例如: "將地板改為木地板，牆壁改為白色磚塊"
    
    // 尋找地板相關指令
    const floorMatches = aiPrompt.match(/(?:地板|地面)(?:.*?)(?:改為|改成|設為|設成|用|使用|換成|換為|應用)(?:.*?)([^\s,，.。!！?？]+)/i);
    if (floorMatches && floorMatches[1]) {
      const textureName = floorMatches[1].toLowerCase();
      
      // 尋找匹配的材質ID
      let textureId = null;
      for (const [id, texture] of Object.entries(availableTextures)) {
        if (texture.name?.toLowerCase().includes(textureName) || id.toLowerCase().includes(textureName)) {
          textureId = id;
          break;
        }
      }
      
      if (textureId) {
        result.actions.push({
          target: 'floor',
          textureId: textureId
        });
      }
    }
    
    // 尋找牆壁相關指令
    const wallMatches = aiPrompt.match(/(?:牆壁|牆)(?:.*?)(?:改為|改成|設為|設成|用|使用|換成|換為|應用)(?:.*?)([^\s,，.。!！?？]+)/i);
    if (wallMatches && wallMatches[1]) {
      const textureName = wallMatches[1].toLowerCase();
      
      // 尋找匹配的材質ID
      let textureId = null;
      for (const [id, texture] of Object.entries(availableTextures)) {
        if (texture.name?.toLowerCase().includes(textureName) || id.toLowerCase().includes(textureName)) {
          textureId = id;
          break;
        }
      }
      
      // 由於牆壁可能有多個，我們需要獲取roomData中所有的牆壁
      if (textureId) {
        const store = useSelectionStore.getState();
        if (store.roomData) {
          const wallKeys = Object.keys(store.roomData).filter(key => key.startsWith('wall-'));
          for (const wallKey of wallKeys) {
            result.actions.push({
              target: wallKey,
              textureId: textureId
            });
          }
        }
      }
    }
    
    // 尋找天花板相關指令
    const ceilingMatches = aiPrompt.match(/(?:天花板|頂棚|天頂)(?:.*?)(?:改為|改成|設為|設成|用|使用|換成|換為|應用)(?:.*?)([^\s,，.。!！?？]+)/i);
    if (ceilingMatches && ceilingMatches[1]) {
      const textureName = ceilingMatches[1].toLowerCase();
      
      // 尋找匹配的材質ID
      let textureId = null;
      for (const [id, texture] of Object.entries(availableTextures)) {
        if (texture.name?.toLowerCase().includes(textureName) || id.toLowerCase().includes(textureName)) {
          textureId = id;
          break;
        }
      }
      
      if (textureId) {
        result.actions.push({
          target: 'ceiling',
          textureId: textureId
        });
      }
    }
    
    // 檢查是否找到任何操作
    if (result.actions.length > 0) {
      result.success = true;
    } else {
      result.message = "無法從指令中識別出有效的材質變更";
    }
    
    return result;
  } catch (error) {
    console.error("解析AI指令時出錯:", error);
    return {
      success: false,
      message: `解析指令時出錯: ${error.message}`
    };
  }
}

/**
 * 獲取所有可用材質的信息
 * @returns {Array} - 材質信息列表
 */
export const getAvailableTextures = () => {
  const store = useSelectionStore.getState();
  const textures = store.preloadedTextures || {};
  
  return Object.entries(textures).map(([id, texture]) => ({
    id,
    name: texture.name || id,
    description: texture.description || '',
    tags: texture.tags || [],
    price: texture.price || 0
  }));
}; 