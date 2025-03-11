import * as THREE from "three";
import useSelectionStore from "../components/Store/Store";

// 從 RoomGeneratorUtils 導入的函數
import { 
  createShapeFromPoints, 
  createShapeGeometryWithUV, 
  createWallGeometry 
} from "../components/RoomSelector/RoomGenerateUtils";

// 重新導出 RoomGeneratorUtils 的函數，使它們可以從 RoomUtils 訪問
export { createShapeFromPoints, createShapeGeometryWithUV, createWallGeometry };

/**
 * 獲取房間數據的函數
 * @returns {Object} 包含房間幾何、材質和物件信息的對象
 */
export const getRoomData = () => {
  const store = useSelectionStore.getState();
  return {
    currentFloorPoints: store.currentFloorPoints || [],
    roomData: store.roomData || {},
    objects: store.objects || {}
  };
};

/**
 * 計算多邊形面積
 * @param {Array} points 多邊形頂點數組
 * @returns {Number} 面積
 */
export const calculatePolygonArea = (points) => {
  if (!points || points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].z;
    area -= points[j].x * points[i].z;
  }
  return Math.abs(area) / 2;
};

/**
 * 計算多邊形周長
 * @param {Array} points 多邊形頂點數組
 * @returns {Number} 周長
 */
export const calculatePolygonPerimeter = (points) => {
  if (!points || points.length < 2) return 0;
  
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dz = points[j].z - points[i].z;
    perimeter += Math.sqrt(dx * dx + dz * dz);
  }
  return perimeter;
};

/**
 * 判斷房間形狀
 * @param {Array} points 多邊形頂點數組
 * @returns {String} 形狀描述
 */
export const determineRoomShape = (points) => {
  if (!points) return "未知";
  
  const count = points.length;
  if (count === 3) return "三角形";
  if (count === 4) {
    // 可以進一步判斷是否為矩形、正方形等
    return "矩形";
  }
  if (count === 5) return "五邊形";
  if (count === 6) return "六邊形";
  if (count > 6) return `${count}邊形`;
  
  return "未知形狀";
};

/**
 * 分析房間的函數
 * @returns {Object} 房間分析結果
 */
export const analyzeRoom = () => {
  const { currentFloorPoints, roomData, objects } = getRoomData();
  
  if ((!currentFloorPoints || currentFloorPoints.length === 0) && 
      (!roomData || Object.keys(roomData).length === 0)) {
    return {
      success: false,
      message: "沒有找到房間數據"
    };
  }
  
  // 分析結果對象
  const analysis = {
    success: true,
    roomInfo: {
      geometry: {},
      materials: {},
      objects: {}
    }
  };
  
  // 分析幾何形狀 (如果有 currentFloorPoints)
  if (currentFloorPoints && currentFloorPoints.length > 0) {
    const area = calculatePolygonArea(currentFloorPoints);
    const perimeter = calculatePolygonPerimeter(currentFloorPoints);
    const shape = determineRoomShape(currentFloorPoints);
    
    analysis.roomInfo.geometry = {
      points: currentFloorPoints,
      verticesCount: currentFloorPoints.length,
      area: area.toFixed(2),
      perimeter: perimeter.toFixed(2),
      shape: shape
    };
  }
  
  // 分析材質 (如果有 roomData)
  if (roomData && Object.keys(roomData).length > 0) {
    const materials = {};
    
    // 處理地板材質
    if (roomData.floor) {
      materials.floor = {
        materialName: roomData.floor.materialName || "未命名",
        price: roomData.floor.price || 0,
        area: roomData.floor.area || 0,
        textures: {
          color: roomData.floor.textures?.color || null,
          metalness: roomData.floor.textures?.metalness || 0,
          roughness: roomData.floor.textures?.roughness || 0
        }
      };
    }
    
    // 處理天花板材質
    if (roomData.ceiling) {
      materials.ceiling = {
        materialName: roomData.ceiling.materialName || "未命名",
        price: roomData.ceiling.price || 0,
        area: roomData.ceiling.area || 0,
        textures: {
          color: roomData.ceiling.textures?.color || null,
          metalness: roomData.ceiling.textures?.metalness || 0,
          roughness: roomData.ceiling.textures?.roughness || 0
        }
      };
    }
    
    // 處理牆壁材質
    const walls = {};
    Object.keys(roomData).forEach(key => {
      if (key.startsWith('wall-')) {
        walls[key] = {
          materialName: roomData[key].materialName || "未命名",
          price: roomData[key].price || 0,
          area: roomData[key].area || 0,
          textures: {
            color: roomData[key].textures?.color || null,
            metalness: roomData[key].textures?.metalness || 0,
            roughness: roomData[key].textures?.roughness || 0
          }
        };
      }
    });
    
    if (Object.keys(walls).length > 0) {
      materials.walls = walls;
    }
    
    analysis.roomInfo.materials = materials;
  }
  
  // 分析物件 (如果有 objects)
  if (objects && Object.keys(objects).length > 0) {
    const objectsInfo = {};
    
    Object.keys(objects).forEach(category => {
      if (Array.isArray(objects[category])) {
        objectsInfo[category] = objects[category].map(obj => ({
          name: obj.name || "未命名物件",
          price: obj.price || 0,
          position: obj.transform?.translate || [0, 0, 0],
          rotation: obj.transform?.rotate || [0, 0, 0],
          scale: obj.transform?.scale || [1, 1, 1]
        }));
      }
    });
    
    analysis.roomInfo.objects = objectsInfo;
  }
  
  return analysis;
};

/**
 * 簡化房間數據以用於 AI 提示詞
 * @param {Object} roomAnalysis 房間分析結果
 * @returns {Object} 簡化後的房間數據
 */
export const simplifyRoomDataForAI = (roomAnalysis) => {
  if (!roomAnalysis || !roomAnalysis.success) {
    return null;
  }
  
  const simplifiedRoomInfo = {
    geometry: roomAnalysis.roomInfo.geometry || {},
    materials: {}
  };
  
  // 簡化材質信息
  if (roomAnalysis.roomInfo.materials) {
    if (roomAnalysis.roomInfo.materials.floor) {
      simplifiedRoomInfo.materials.floor = {
        material: roomAnalysis.roomInfo.materials.floor.materialName,
        area: roomAnalysis.roomInfo.materials.floor.area
      };
    }
    
    if (roomAnalysis.roomInfo.materials.ceiling) {
      simplifiedRoomInfo.materials.ceiling = {
        material: roomAnalysis.roomInfo.materials.ceiling.materialName,
        area: roomAnalysis.roomInfo.materials.ceiling.area
      };
    }
    
    if (roomAnalysis.roomInfo.materials.walls) {
      simplifiedRoomInfo.materials.walls = Object.keys(roomAnalysis.roomInfo.materials.walls).map(key => ({
        id: key,
        material: roomAnalysis.roomInfo.materials.walls[key].materialName,
        area: roomAnalysis.roomInfo.materials.walls[key].area
      }));
    }
  }
  
  // 簡化物件信息
  if (roomAnalysis.roomInfo.objects && Object.keys(roomAnalysis.roomInfo.objects).length > 0) {
    simplifiedRoomInfo.objects = {};
    
    Object.keys(roomAnalysis.roomInfo.objects).forEach(category => {
      simplifiedRoomInfo.objects[category] = roomAnalysis.roomInfo.objects[category].length;
    });
  }
  
  return simplifiedRoomInfo;
};

/**
 * 生成房間描述文本
 * @param {Object} roomInfo 簡化後的房間信息
 * @returns {String} 房間描述文本
 */
export const generateRoomDescription = (roomInfo) => {
  if (!roomInfo) return '';
  
  let description = '房間信息:\n';
  
  // 添加幾何信息
  if (roomInfo.geometry) {
    if (roomInfo.geometry.shape) description += `- 形狀: ${roomInfo.geometry.shape}\n`;
    if (roomInfo.geometry.area) description += `- 面積: ${roomInfo.geometry.area} 平方單位\n`;
    if (roomInfo.geometry.perimeter) description += `- 周長: ${roomInfo.geometry.perimeter} 單位\n`;
  }
  
  // 添加材質信息
  if (roomInfo.materials) {
    description += '\n材質信息:\n';
    
    if (roomInfo.materials.floor) {
      description += `- 地板: ${roomInfo.materials.floor.material} (面積: ${roomInfo.materials.floor.area})\n`;
    } else {
      description += '- 地板: 未設置\n';
    }
    
    if (roomInfo.materials.ceiling) {
      description += `- 天花板: ${roomInfo.materials.ceiling.material} (面積: ${roomInfo.materials.ceiling.area})\n`;
    } else {
      description += '- 天花板: 未設置\n';
    }
    
    if (roomInfo.materials.walls && roomInfo.materials.walls.length > 0) {
      description += `- 牆壁: ${roomInfo.materials.walls.map(w => `${w.id}: ${w.material}`).join(', ')}\n`;
    } else {
      description += '- 牆壁: 未設置\n';
    }
  }
  
  // 添加物件信息
  if (roomInfo.objects) {
    description += '\n物件信息: ';
    description += Object.entries(roomInfo.objects)
      .map(([category, count]) => `${category}: ${count}個`)
      .join(', ');
  } else {
    description += '\n物件信息: 無物件';
  }
  
  return description;
};

/**
 * 生成 AI 提示詞
 * @param {String} userPrompt 用戶提示詞
 * @param {String} task 任務類型 ('general', 'material', 'furniture')
 * @returns {String} 增強後的提示詞
 */
export const generateAIPrompt = (userPrompt, task = 'general') => {
  const roomAnalysis = analyzeRoom();
  
  if (!roomAnalysis.success) {
    return userPrompt;
  }
  
  const simplifiedRoomInfo = simplifyRoomDataForAI(roomAnalysis);
  const roomDescription = generateRoomDescription(simplifiedRoomInfo);
  
  let enhancedPrompt = '';
  
  switch (task) {
    case 'material':
      enhancedPrompt = `
你是一位專業的室內設計師 AI 助手。請根據以下房間信息和用戶需求，提供詳細的材質建議：

${roomDescription}

用戶需求:
${userPrompt}

請提供以下內容：
1. 為地板推薦的材質，包括名稱、顏色和質感描述
2. 為牆壁推薦的材質，包括名稱、顏色和質感描述
3. 為天花板推薦的材質，包括名稱、顏色和質感描述
4. 這些材質如何搭配，以及整體效果描述

請以JSON格式回答，格式如下：
{
  "floor": {
    "name": "材質名稱",
    "color": "顏色代碼或描述",
    "description": "質感和外觀描述"
  },
  "walls": {
    "name": "材質名稱",
    "color": "顏色代碼或描述",
    "description": "質感和外觀描述"
  },
  "ceiling": {
    "name": "材質名稱",
    "color": "顏色代碼或描述",
    "description": "質感和外觀描述"
  },
  "overall": "整體效果描述"
}
`;
      break;
    
    case 'furniture':
      enhancedPrompt = `
你是一位專業的室內設計師 AI 助手。請根據以下房間信息和用戶需求，提供詳細的家具擺放建議：

${roomDescription}

用戶需求:
${userPrompt}

請提供以下內容：
1. 推薦的家具列表，包括名稱、尺寸和位置
2. 家具擺放的整體布局描述
3. 考慮到房間形狀和大小的特殊建議

請以JSON格式回答，格式如下：
{
  "furniture": [
    {
      "name": "家具名稱",
      "type": "家具類型",
      "dimensions": {
        "width": 寬度,
        "depth": 深度,
        "height": 高度
      },
      "position": {
        "x": x座標,
        "y": y座標,
        "z": z座標
      },
      "rotation": 旋轉角度（度）
    }
  ],
  "layout": "整體布局描述",
  "specialNotes": "特殊建議"
}
`;
      break;
    
    default: // general
      enhancedPrompt = `
${roomDescription}

用戶問題: ${userPrompt}

請根據以上房間信息回答用戶問題。如果是關於房間設計、家具擺放或材質選擇的問題，請考慮房間的形狀、大小和現有材質。
`;
  }
  
  return enhancedPrompt;
}; 