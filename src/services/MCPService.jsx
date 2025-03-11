import { 
  analyzeRoom, 
  simplifyRoomDataForAI, 
  generateRoomDescription,
  calculatePolygonArea,
  calculatePolygonPerimeter,
  determineRoomShape
} from "../utils/RoomUtils";

import useSelectionStore from "../components/Store/Store";

/**
 * MCP (Model Control Protocol) 服務
 * 提供標準化的接口，讓 LLM 能夠與專案交互
 */

// 命令類型常量
const COMMAND_TYPES = {
  QUERY: 'query',         // 查詢命令
  ANALYZE: 'analyze',     // 分析命令
  SUGGEST: 'suggest',     // 建議命令
  EXECUTE: 'execute'      // 執行命令
};

// 目標類型常量
const TARGET_TYPES = {
  ROOM: 'room',           // 整個房間
  FLOOR: 'floor',         // 地板
  WALL: 'wall',           // 牆壁
  CEILING: 'ceiling',     // 天花板
  FURNITURE: 'furniture', // 家具
  MATERIAL: 'material',   // 材質
  MODEL: 'model',         // 3D 模型
  TEXTURE: 'texture',     // 貼圖
  RESOURCE: 'resource'    // 通用資源
};

/**
 * 處理 MCP 命令
 * @param {Object} command MCP 命令對象
 * @returns {Object} 命令執行結果
 */
export const processMCPCommand = async (command) => {
  try {
    // 驗證命令格式
    if (!command || !command.type || !command.target) {
      return {
        success: false,
        error: "無效的命令格式",
        requiredFormat: {
          type: Object.values(COMMAND_TYPES).join('|'),
          target: Object.values(TARGET_TYPES).join('|'),
          params: "可選參數對象"
        }
      };
    }

    // 根據命令類型分發處理
    switch (command.type) {
      case COMMAND_TYPES.QUERY:
        return handleQueryCommand(command);
      case COMMAND_TYPES.ANALYZE:
        return handleAnalyzeCommand(command);
      case COMMAND_TYPES.SUGGEST:
        return await handleSuggestCommand(command);
      case COMMAND_TYPES.EXECUTE:
        return await handleExecuteCommand(command);
      default:
        return {
          success: false,
          error: `未知的命令類型: ${command.type}`,
          supportedTypes: Object.values(COMMAND_TYPES)
        };
    }
  } catch (error) {
    console.error("MCP 命令處理錯誤:", error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

/**
 * 處理查詢命令
 * @param {Object} command 查詢命令
 * @returns {Object} 查詢結果
 */
const handleQueryCommand = (command) => {
  const { target, params } = command;
  const store = useSelectionStore.getState();
  
  switch (target) {
    case TARGET_TYPES.ROOM:
      return {
        success: true,
        data: {
          roomData: store.roomData,
          currentFloorPoints: store.currentFloorPoints,
          objects: store.objects
        }
      };
      
    case TARGET_TYPES.FLOOR:
      if (!store.roomData || !store.roomData.floor) {
        return { success: false, error: "找不到地板數據" };
      }
      return {
        success: true,
        data: {
          floor: store.roomData.floor,
          floorPoints: store.currentFloorPoints
        }
      };
      
    case TARGET_TYPES.WALL:
      const wallId = params?.wallId;
      if (wallId) {
        if (!store.roomData || !store.roomData[wallId]) {
          return { success: false, error: `找不到牆壁數據: ${wallId}` };
        }
        return {
          success: true,
          data: { wall: store.roomData[wallId] }
        };
      } else {
        // 返回所有牆壁
        const walls = {};
        if (store.roomData) {
          Object.keys(store.roomData).forEach(key => {
            if (key.startsWith('wall-')) {
              walls[key] = store.roomData[key];
            }
          });
        }
        return {
          success: true,
          data: { walls }
        };
      }
      
    case TARGET_TYPES.CEILING:
      if (!store.roomData || !store.roomData.ceiling) {
        return { success: false, error: "找不到天花板數據" };
      }
      return {
        success: true,
        data: { ceiling: store.roomData.ceiling }
      };
      
    case TARGET_TYPES.FURNITURE:
      const furnitureCategory = params?.category;
      if (furnitureCategory) {
        if (!store.objects || !store.objects[furnitureCategory]) {
          return { success: false, error: `找不到家具類別: ${furnitureCategory}` };
        }
        return {
          success: true,
          data: { furniture: store.objects[furnitureCategory] }
        };
      } else {
        return {
          success: true,
          data: { furniture: store.objects }
        };
      }
      
    case TARGET_TYPES.MATERIAL:
      const materialTarget = params?.materialTarget;
      if (!materialTarget) {
        return { success: false, error: "未指定材質目標 (floor, wall-0, ceiling 等)" };
      }
      
      if (!store.roomData || !store.roomData[materialTarget]) {
        return { success: false, error: `找不到材質目標: ${materialTarget}` };
      }
      
      return {
        success: true,
        data: {
          material: store.roomData[materialTarget].textures,
          materialName: store.roomData[materialTarget].materialName
        }
      };
      
    case TARGET_TYPES.MODEL:
      const modelId = params?.modelId;
      if (modelId) {
        // 查詢特定模型
        const model = store.getModel(modelId);
        if (!model) {
          return { success: false, error: `找不到模型: ${modelId}` };
        }
        return {
          success: true,
          data: { model }
        };
      } else {
        // 查詢所有可用模型
        return {
          success: true,
          data: {
            models: Object.keys(store.preloadedModels),
            count: Object.keys(store.preloadedModels).length,
            isLoaded: store.isResourcesLoaded
          }
        };
      }
      
    case TARGET_TYPES.TEXTURE:
      const textureId = params?.textureId;
      if (textureId) {
        // 查詢特定貼圖
        const texture = store.getTexture(textureId);
        if (!texture) {
          return { success: false, error: `找不到貼圖: ${textureId}` };
        }
        return {
          success: true,
          data: { texture }
        };
      } else {
        // 查詢所有可用貼圖
        return {
          success: true,
          data: {
            textures: Object.keys(store.preloadedTextures),
            count: Object.keys(store.preloadedTextures).length,
            isLoaded: store.isResourcesLoaded
          }
        };
      }
      
    case TARGET_TYPES.RESOURCE:
      // 查詢資源加載狀態
      return {
        success: true,
        data: {
          isLoaded: store.isResourcesLoaded,
          modelCount: Object.keys(store.preloadedModels).length,
          textureCount: Object.keys(store.preloadedTextures).length
        }
      };
      
    default:
      return {
        success: false,
        error: `未知的查詢目標: ${target}`,
        supportedTargets: Object.values(TARGET_TYPES)
      };
  }
};

/**
 * 處理分析命令
 * @param {Object} command 分析命令
 * @returns {Object} 分析結果
 */
const handleAnalyzeCommand = (command) => {
  const { target, params } = command;
  
  switch (target) {
    case TARGET_TYPES.ROOM:
      const roomAnalysis = analyzeRoom();
      if (!roomAnalysis.success) {
        return { success: false, error: roomAnalysis.message };
      }
      
      // 根據參數決定返回完整分析還是簡化版本
      if (params?.simplified) {
        const simplifiedData = simplifyRoomDataForAI(roomAnalysis);
        return {
          success: true,
          data: simplifiedData
        };
      } else {
        return {
          success: true,
          data: roomAnalysis.roomInfo
        };
      }
      
    case TARGET_TYPES.FLOOR:
      const floorAnalysis = analyzeFloor();
      return {
        success: true,
        data: floorAnalysis
      };
      
    case TARGET_TYPES.WALL:
      const wallAnalysis = analyzeWalls(params?.wallId);
      return {
        success: true,
        data: wallAnalysis
      };
      
    case TARGET_TYPES.FURNITURE:
      const furnitureAnalysis = analyzeFurniture(params?.category);
      return {
        success: true,
        data: furnitureAnalysis
      };
      
    default:
      return {
        success: false,
        error: `未知的分析目標: ${target}`,
        supportedTargets: Object.values(TARGET_TYPES)
      };
  }
};

/**
 * 處理建議命令
 * @param {Object} command 建議命令
 * @returns {Object} 建議結果
 */
const handleSuggestCommand = async (command) => {
  const { target, params } = command;
  
  // 檢查是否有提示詞
  if (!params || !params.prompt) {
    return {
      success: false,
      error: "建議命令需要提供 prompt 參數"
    };
  }
  
  // 從 AIService 導入相關函數
  const { 
    generateMaterialSuggestions, 
    generateFurnitureSuggestions 
  } = await import('./AIService');
  
  switch (target) {
    case TARGET_TYPES.MATERIAL:
      try {
        const materialSuggestions = await generateMaterialSuggestions(params.prompt);
        return {
          success: materialSuggestions.success,
          data: materialSuggestions.success ? materialSuggestions.suggestions : null,
          error: !materialSuggestions.success ? materialSuggestions.message : null,
          rawResponse: materialSuggestions.rawResponse
        };
      } catch (error) {
        return {
          success: false,
          error: `生成材質建議時出錯: ${error.message}`
        };
      }
      
    case TARGET_TYPES.FURNITURE:
      try {
        const furnitureSuggestions = await generateFurnitureSuggestions(params.prompt);
        return {
          success: furnitureSuggestions.success,
          data: furnitureSuggestions.success ? furnitureSuggestions.suggestions : null,
          error: !furnitureSuggestions.success ? furnitureSuggestions.message : null,
          rawResponse: furnitureSuggestions.rawResponse
        };
      } catch (error) {
        return {
          success: false,
          error: `生成家具建議時出錯: ${error.message}`
        };
      }
      
    case TARGET_TYPES.ROOM:
      // 綜合建議 (材質 + 家具)
      try {
        const materialSuggestions = await generateMaterialSuggestions(params.prompt);
        const furnitureSuggestions = await generateFurnitureSuggestions(params.prompt);
        
        return {
          success: materialSuggestions.success || furnitureSuggestions.success,
          data: {
            materials: materialSuggestions.success ? materialSuggestions.suggestions : null,
            furniture: furnitureSuggestions.success ? furnitureSuggestions.suggestions : null
          },
          errors: {
            materials: !materialSuggestions.success ? materialSuggestions.message : null,
            furniture: !furnitureSuggestions.success ? furnitureSuggestions.message : null
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `生成綜合建議時出錯: ${error.message}`
        };
      }
      
    default:
      return {
        success: false,
        error: `未知的建議目標: ${target}`,
        supportedTargets: [TARGET_TYPES.MATERIAL, TARGET_TYPES.FURNITURE, TARGET_TYPES.ROOM]
      };
  }
};

/**
 * 處理執行命令
 * @param {Object} command 執行命令
 * @returns {Object} 執行結果
 */
const handleExecuteCommand = async (command) => {
  const { target, params } = command;
  const store = useSelectionStore.getState();
  
  switch (target) {
    case TARGET_TYPES.MATERIAL:
      // 應用材質
      if (!params || !params.materials) {
        return {
          success: false,
          error: "應用材質需要提供 materials 參數"
        };
      }
      
      try {
        const roomData = { ...store.roomData };
        const materials = params.materials;
        
        // 應用地板材質
        if (materials.floor && roomData.floor) {
          roomData.floor = {
            ...roomData.floor,
            materialName: materials.floor.name || roomData.floor.materialName,
            isModified: true,
            textures: {
              ...roomData.floor.textures,
              color: materials.floor.color || roomData.floor.textures.color,
              needsUpdate: true
            }
          };
        }
        
        // 應用牆壁材質
        if (materials.walls) {
          Object.keys(roomData).forEach(key => {
            if (key.startsWith('wall-')) {
              roomData[key] = {
                ...roomData[key],
                materialName: materials.walls.name || roomData[key].materialName,
                isModified: true,
                textures: {
                  ...roomData[key].textures,
                  color: materials.walls.color || roomData[key].textures.color,
                  needsUpdate: true
                }
              };
            }
          });
        }
        
        // 應用天花板材質
        if (materials.ceiling && roomData.ceiling) {
          roomData.ceiling = {
            ...roomData.ceiling,
            materialName: materials.ceiling.name || roomData.ceiling.materialName,
            isModified: true,
            textures: {
              ...roomData.ceiling.textures,
              color: materials.ceiling.color || roomData.ceiling.textures.color,
              needsUpdate: true
            }
          };
        }
        
        // 更新 Store
        store.setRoomData(roomData);
        
        return {
          success: true,
          message: "材質已成功應用"
        };
      } catch (error) {
        return {
          success: false,
          error: `應用材質時出錯: ${error.message}`
        };
      }
      
    case TARGET_TYPES.FURNITURE:
      // 添加家具
      if (!params || !params.furniture || !Array.isArray(params.furniture)) {
        return {
          success: false,
          error: "添加家具需要提供 furniture 參數 (數組)"
        };
      }
      
      try {
        const results = [];
        
        // 添加每個家具
        for (const item of params.furniture) {
          if (!item.name || !item.position) {
            results.push({
              success: false,
              error: "家具項目需要提供 name 和 position"
            });
            continue;
          }
          
          // 添加家具
          store.addObject('furniture', {
            name: item.name,
            description: item.type || '',
            transform: {
              translate: [
                item.position.x || 0, 
                item.position.y || 0, 
                item.position.z || 0
              ],
              rotate: [
                0, 
                (item.rotation || 0) * Math.PI / 180, 
                0
              ],
              scale: [1, 1, 1]
            }
          });
          
          results.push({
            success: true,
            message: `已添加家具: ${item.name}`
          });
        }
        
        return {
          success: true,
          results
        };
      } catch (error) {
        return {
          success: false,
          error: `添加家具時出錯: ${error.message}`
        };
      }
      
    case TARGET_TYPES.MODEL:
      // 應用模型到場景
      if (!params || !params.modelId || !params.position) {
        return {
          success: false,
          error: "應用模型需要提供 modelId 和 position 參數"
        };
      }
      
      try {
        const { modelId, position, rotation = [0, 0, 0], scale = [1, 1, 1], category = 'furniture' } = params;
        
        // 獲取模型
        const modelData = store.getModel(modelId);
        if (!modelData) {
          return { success: false, error: `找不到模型: ${modelId}` };
        }
        
        // 添加到場景
        store.addObject(category, {
          name: modelId,
          object: modelData.object,
          description: modelData.info?.description || '',
          transform: {
            translate: [position.x || 0, position.y || 0, position.z || 0],
            rotate: [rotation.x || 0, rotation.y || 0, rotation.z || 0],
            scale: [scale.x || 1, scale.y || 1, scale.z || 1]
          }
        });
        
        return {
          success: true,
          message: `模型 ${modelId} 已添加到場景`
        };
      } catch (error) {
        return {
          success: false,
          error: `應用模型時出錯: ${error.message}`
        };
      }
      
    case TARGET_TYPES.TEXTURE:
      // 應用貼圖到表面
      if (!params || !params.textureId || !params.target) {
        return {
          success: false,
          error: "應用貼圖需要提供 textureId 和 target 參數"
        };
      }
      
      try {
        const { textureId, target: surfaceTarget } = params;
        
        // 獲取貼圖
        const texture = store.getTexture(textureId);
        if (!texture) {
          return { success: false, error: `找不到貼圖: ${textureId}` };
        }
        
        // 獲取房間數據
        const roomData = { ...store.roomData };
        if (!roomData[surfaceTarget]) {
          return { success: false, error: `找不到表面: ${surfaceTarget}` };
        }
        
        // 應用貼圖
        roomData[surfaceTarget] = {
          ...roomData[surfaceTarget],
          materialName: texture.name || roomData[surfaceTarget].materialName,
          isModified: true,
          textures: {
            ...roomData[surfaceTarget].textures,
            ...texture.textures,
            needsUpdate: true
          }
        };
        
        // 更新 Store
        store.setRoomData(roomData);
        
        return {
          success: true,
          message: `貼圖 ${textureId} 已應用到 ${surfaceTarget}`
        };
      } catch (error) {
        return {
          success: false,
          error: `應用貼圖時出錯: ${error.message}`
        };
      }
      
    case TARGET_TYPES.RESOURCE:
      // 初始化或重新加載資源
      if (params?.reload) {
        try {
          const result = await store.initializeResources();
          return {
            success: result,
            message: result ? "資源已重新加載" : "資源加載失敗"
          };
        } catch (error) {
          return {
            success: false,
            error: `重新加載資源時出錯: ${error.message}`
          };
        }
      }
      
      return {
        success: false,
        error: "未指定資源操作"
      };
      
    default:
      return {
        success: false,
        error: `未知的執行目標: ${target}`,
        supportedTargets: Object.values(TARGET_TYPES)
      };
  }
};

/**
 * 分析地板
 * @returns {Object} 地板分析結果
 */
const analyzeFloor = () => {
  const roomAnalysis = analyzeRoom();
  
  if (!roomAnalysis.success) {
    return { error: "無法獲取房間數據" };
  }
  
  let floorInfo = {
    area: 0,
    shape: '未知',
    dimensions: null,
    material: '未設置'
  };
  
  // 從幾何信息中獲取地板大小
  if (roomAnalysis.roomInfo.geometry && roomAnalysis.roomInfo.geometry.area) {
    floorInfo.area = roomAnalysis.roomInfo.geometry.area;
    floorInfo.shape = roomAnalysis.roomInfo.geometry.shape || '未知';
    
    // 如果是矩形，計算大致尺寸
    if (floorInfo.shape === '矩形' && roomAnalysis.roomInfo.geometry.points && roomAnalysis.roomInfo.geometry.points.length === 4) {
      const points = roomAnalysis.roomInfo.geometry.points;
      
      // 計算矩形的寬度和長度
      const width = Math.abs(points[0].x - points[1].x);
      const length = Math.abs(points[1].z - points[2].z);
      
      floorInfo.dimensions = {
        width: parseFloat(width.toFixed(2)),
        length: parseFloat(length.toFixed(2))
      };
    }
  }
  
  // 從材質信息中獲取地板材質
  if (roomAnalysis.roomInfo.materials && roomAnalysis.roomInfo.materials.floor) {
    // 如果材質信息中有面積，優先使用
    if (roomAnalysis.roomInfo.materials.floor.area) {
      floorInfo.area = roomAnalysis.roomInfo.materials.floor.area;
    }
    
    if (roomAnalysis.roomInfo.materials.floor.materialName) {
      floorInfo.material = roomAnalysis.roomInfo.materials.floor.materialName;
    }
    
    // 添加材質詳情
    floorInfo.materialDetails = roomAnalysis.roomInfo.materials.floor.textures;
  }
  
  return floorInfo;
};

/**
 * 分析牆壁
 * @param {String} wallId 可選的牆壁 ID
 * @returns {Object} 牆壁分析結果
 */
const analyzeWalls = (wallId) => {
  const roomAnalysis = analyzeRoom();
  
  if (!roomAnalysis.success) {
    return { error: "無法獲取房間數據" };
  }
  
  if (!roomAnalysis.roomInfo.materials || !roomAnalysis.roomInfo.materials.walls) {
    return { error: "找不到牆壁數據" };
  }
  
  const walls = roomAnalysis.roomInfo.materials.walls;
  
  if (wallId) {
    // 返回特定牆壁的分析
    if (!walls[wallId]) {
      return { error: `找不到牆壁: ${wallId}` };
    }
    
    return {
      id: wallId,
      area: walls[wallId].area,
      material: walls[wallId].materialName,
      materialDetails: walls[wallId].textures
    };
  } else {
    // 返回所有牆壁的分析
    const wallsAnalysis = {};
    
    Object.keys(walls).forEach(key => {
      wallsAnalysis[key] = {
        area: walls[key].area,
        material: walls[key].materialName,
        materialDetails: walls[key].textures
      };
    });
    
    return {
      count: Object.keys(walls).length,
      totalArea: Object.values(walls).reduce((sum, wall) => sum + (wall.area || 0), 0),
      walls: wallsAnalysis
    };
  }
};

/**
 * 分析家具
 * @param {String} category 可選的家具類別
 * @returns {Object} 家具分析結果
 */
const analyzeFurniture = (category) => {
  const roomAnalysis = analyzeRoom();
  
  if (!roomAnalysis.success) {
    return { error: "無法獲取房間數據" };
  }
  
  if (!roomAnalysis.roomInfo.objects || Object.keys(roomAnalysis.roomInfo.objects).length === 0) {
    return { error: "找不到家具數據" };
  }
  
  const objects = roomAnalysis.roomInfo.objects;
  
  if (category) {
    // 返回特定類別的家具分析
    if (!objects[category]) {
      return { error: `找不到家具類別: ${category}` };
    }
    
    return {
      category,
      count: objects[category].length,
      items: objects[category]
    };
  } else {
    // 返回所有家具的分析
    const furnitureAnalysis = {};
    
    Object.keys(objects).forEach(key => {
      furnitureAnalysis[key] = {
        count: objects[key].length,
        items: objects[key]
      };
    });
    
    return {
      categories: Object.keys(objects).length,
      totalCount: Object.values(objects).reduce((sum, items) => sum + items.length, 0),
      furniture: furnitureAnalysis
    };
  }
};

// 導出常量和函數
export { COMMAND_TYPES, TARGET_TYPES }; 