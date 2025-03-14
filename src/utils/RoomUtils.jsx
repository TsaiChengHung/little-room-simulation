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
 * 計算房間體積
 * @param {Number} floorArea 地板面積
 * @param {Number} wallHeight 牆壁高度
 * @returns {Number} 體積
 */
export const calculateRoomVolume = (floorArea, wallHeight) => {
  if (!floorArea || !wallHeight) return 0;
  return floorArea * wallHeight;
};

/**
 * 計算房間總表面積 (地板 + 天花板 + 所有牆壁)
 * @param {Object} roomData 房間數據
 * @returns {Number} 總表面積
 */
export const calculateTotalSurfaceArea = (roomData) => {
  if (!roomData) return 0;
  
  let totalArea = 0;
  
  // 添加地板面積
  if (roomData.floor && roomData.floor.area) {
    totalArea += roomData.floor.area;
  }
  
  // 添加天花板面積
  if (roomData.ceiling && roomData.ceiling.area) {
    totalArea += roomData.ceiling.area;
  }
  
  // 添加所有牆壁面積
  Object.keys(roomData).forEach(key => {
    if (key.startsWith('wall-') && roomData[key].area) {
      totalArea += roomData[key].area;
    }
  });
  
  return totalArea;
};

/**
 * 計算房間的尺寸 (長、寬、高)
 * @param {Array} points 多邊形頂點數組
 * @param {Number} wallHeight 牆壁高度
 * @returns {Object} 房間尺寸
 */
export const calculateRoomDimensions = (points, wallHeight) => {
  if (!points || points.length < 3) return { width: 0, length: 0, height: 0 };
  
  // 計算邊界框
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  points.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
  });
  
  return {
    width: maxX - minX,
    length: maxZ - minZ,
    height: wallHeight || 0
  };
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
      objects: {},
      dimensions: {},
      volume: 0,
      totalSurfaceArea: 0
    }
  };
  
  // 獲取牆壁高度
  const wallHeight = useSelectionStore.getState().wallHeight || 2.4; // 默認高度為 2.4 米
  
  // 分析幾何形狀 (如果有 currentFloorPoints)
  if (currentFloorPoints && currentFloorPoints.length > 0) {
    const area = calculatePolygonArea(currentFloorPoints);
    const perimeter = calculatePolygonPerimeter(currentFloorPoints);
    const shape = determineRoomShape(currentFloorPoints);
    const dimensions = calculateRoomDimensions(currentFloorPoints, wallHeight);
    
    analysis.roomInfo.geometry = {
      points: currentFloorPoints,
      verticesCount: currentFloorPoints.length,
      area: parseFloat(area.toFixed(2)),
      perimeter: parseFloat(perimeter.toFixed(2)),
      shape: shape
    };
    
    analysis.roomInfo.dimensions = dimensions;
    
    // 計算體積
    analysis.roomInfo.volume = calculateRoomVolume(area, wallHeight);
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
      
      // 如果沒有從 currentFloorPoints 計算面積，使用 roomData 中的面積
      if (!analysis.roomInfo.geometry.area && roomData.floor.area) {
        analysis.roomInfo.geometry.area = roomData.floor.area;
      }
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
      if (key.startsWith('wall')) {
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
    
    // 計算總表面積
    analysis.roomInfo.totalSurfaceArea = calculateTotalSurfaceArea(roomData);
    
    // 如果沒有從 currentFloorPoints 計算體積，使用 roomData 中的面積
    if (!analysis.roomInfo.volume && roomData.floor && roomData.floor.area) {
      analysis.roomInfo.volume = calculateRoomVolume(roomData.floor.area, wallHeight);
    }
  }
  
  // 分析物件 (如果有 objects)
  if (objects && Object.keys(objects).length > 0) {
    const objectsInfo = {};
    let totalFurnitureCount = 0;
    
    Object.keys(objects).forEach(category => {
      if (Array.isArray(objects[category])) {
        objectsInfo[category] = objects[category].map(obj => ({
          id: obj.id || "",
          name: obj.objectName || "未命名物件",
          price: obj.price || 0,
          position: obj.transform?.translate || [0, 0, 0],
          rotation: obj.transform?.rotate || [0, 0, 0],
          scale: obj.transform?.scale || [1, 1, 1]
        }));
        
        totalFurnitureCount += objects[category].length;
      }
    });
    
    analysis.roomInfo.objects = {
      categories: Object.keys(objects).length,
      totalCount: totalFurnitureCount,
      items: objectsInfo
    };
    
    // 計算家具密度 (每平方米的家具數量)
    if (analysis.roomInfo.geometry.area && totalFurnitureCount > 0) {
      analysis.roomInfo.objects.density = parseFloat((totalFurnitureCount / analysis.roomInfo.geometry.area).toFixed(2));
    }
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
    dimensions: roomAnalysis.roomInfo.dimensions || {},
    volume: roomAnalysis.roomInfo.volume || 0,
    totalSurfaceArea: roomAnalysis.roomInfo.totalSurfaceArea || 0,
    materials: {}
  };
  
  // 簡化材質信息
  if (roomAnalysis.roomInfo.materials) {
    if (roomAnalysis.roomInfo.materials.floor) {
      simplifiedRoomInfo.materials.floor = {
        material: roomAnalysis.roomInfo.materials.floor.materialName,
        area: roomAnalysis.roomInfo.materials.floor.area,
        color: roomAnalysis.roomInfo.materials.floor.textures?.color || null
      };
    }
    
    if (roomAnalysis.roomInfo.materials.ceiling) {
      simplifiedRoomInfo.materials.ceiling = {
        material: roomAnalysis.roomInfo.materials.ceiling.materialName,
        area: roomAnalysis.roomInfo.materials.ceiling.area,
        color: roomAnalysis.roomInfo.materials.ceiling.textures?.color || null
      };
    }
    
    if (roomAnalysis.roomInfo.materials.walls) {
      simplifiedRoomInfo.materials.walls = Object.keys(roomAnalysis.roomInfo.materials.walls).map(key => ({
        id: key,
        material: roomAnalysis.roomInfo.materials.walls[key].materialName,
        area: roomAnalysis.roomInfo.materials.walls[key].area,
        color: roomAnalysis.roomInfo.materials.walls[key].textures?.color || null
      }));
    }
  }
  
  // 簡化物件信息
  if (roomAnalysis.roomInfo.objects && roomAnalysis.roomInfo.objects.items) {
    simplifiedRoomInfo.objects = {
      categories: roomAnalysis.roomInfo.objects.categories || 0,
      totalCount: roomAnalysis.roomInfo.objects.totalCount || 0,
      density: roomAnalysis.roomInfo.objects.density || 0,
      categoryBreakdown: {}
    };
    
    Object.keys(roomAnalysis.roomInfo.objects.items).forEach(category => {
      simplifiedRoomInfo.objects.categoryBreakdown[category] = roomAnalysis.roomInfo.objects.items[category].length;
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
    if (roomInfo.geometry.area) description += `- 面積: ${roomInfo.geometry.area} 平方米\n`;
    if (roomInfo.geometry.perimeter) description += `- 周長: ${roomInfo.geometry.perimeter} 米\n`;
  }
  
  // 添加尺寸信息
  if (roomInfo.dimensions) {
    const { width, length, height } = roomInfo.dimensions;
    if (width && length) description += `- 尺寸: ${width.toFixed(2)}m × ${length.toFixed(2)}m`;
    if (height) description += ` × ${height.toFixed(2)}m (高)\n`;
    else description += '\n';
  }
  
  // 添加體積和總表面積
  if (roomInfo.volume) description += `- 體積: ${roomInfo.volume.toFixed(2)} 立方米\n`;
  if (roomInfo.totalSurfaceArea) description += `- 總表面積: ${roomInfo.totalSurfaceArea.toFixed(2)} 平方米\n`;
  
  // 添加材質信息
  if (roomInfo.materials) {
    description += '\n材質信息:\n';
    
    if (roomInfo.materials.floor) {
      const floorColor = roomInfo.materials.floor.color ? 
        `，顏色: ${roomInfo.materials.floor.color}` : '';
      description += `- 地板: ${roomInfo.materials.floor.material} (面積: ${roomInfo.materials.floor.area} 平方米${floorColor})\n`;
    } else {
      description += '- 地板: 未設置\n';
    }
    
    if (roomInfo.materials.ceiling) {
      const ceilingColor = roomInfo.materials.ceiling.color ? 
        `，顏色: ${roomInfo.materials.ceiling.color}` : '';
      description += `- 天花板: ${roomInfo.materials.ceiling.material} (面積: ${roomInfo.materials.ceiling.area} 平方米${ceilingColor})\n`;
    } else {
      description += '- 天花板: 未設置\n';
    }
    
    if (roomInfo.materials.walls && roomInfo.materials.walls.length > 0) {
      description += '- 牆壁:\n';
      roomInfo.materials.walls.forEach(wall => {
        const wallColor = wall.color ? `，顏色: ${wall.color}` : '';
        description += `  * ${wall.id}: ${wall.material} (面積: ${wall.area} 平方米${wallColor})\n`;
      });
    } else {
      description += '- 牆壁: 未設置\n';
    }
  }
  
  // 添加物件信息
  if (roomInfo.objects) {
    description += '\n物件信息:\n';
    
    if (roomInfo.objects.totalCount) {
      description += `- 總數: ${roomInfo.objects.totalCount} 個物件\n`;
    }
    
    if (roomInfo.objects.density) {
      description += `- 家具密度: ${roomInfo.objects.density} 個/平方米\n`;
    }
    
    if (roomInfo.objects.categoryBreakdown) {
      description += '- 類別明細: ';
      description += Object.entries(roomInfo.objects.categoryBreakdown)
        .map(([category, count]) => `${category}: ${count}個`)
        .join(', ');
      description += '\n';
    }
  } else {
    description += '\n物件信息: 無物件\n';
  }
  
  return description;
};

/**
 * 分析房間空間利用率
 * @param {Number} floorArea 地板面積
 * @param {Number} furnitureCount 家具數量
 * @returns {String} 空間利用率評估
 */
export const analyzeSpaceUtilization = (floorArea, furnitureCount) => {
  if (!floorArea || floorArea <= 0) return "無法評估空間利用率：缺少地板面積資訊";
  if (!furnitureCount) return "空間利用率：空房間，無家具";
  
  const density = furnitureCount / floorArea;
  
  if (density < 0.1) return "空間利用率：非常低，房間顯得空曠";
  if (density < 0.2) return "空間利用率：較低，有充足的活動空間";
  if (density < 0.3) return "空間利用率：適中，平衡了家具與活動空間";
  if (density < 0.4) return "空間利用率：較高，家具佈置較為緊湊";
  return "空間利用率：非常高，空間可能顯得擁擠";
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
  
  // 獲取空間利用率評估
  let spaceUtilization = "";
  if (simplifiedRoomInfo.geometry.area && simplifiedRoomInfo.objects && simplifiedRoomInfo.objects.totalCount) {
    spaceUtilization = analyzeSpaceUtilization(
      simplifiedRoomInfo.geometry.area, 
      simplifiedRoomInfo.objects.totalCount
    );
  }
  
  let enhancedPrompt = '';
  
  switch (task) {
    case 'material':
      enhancedPrompt = `
你是一位專業的室內設計師 AI 助手。請根據以下房間信息和用戶需求，提供詳細的材質建議：

${roomDescription}

${spaceUtilization ? spaceUtilization + "\n" : ""}

用戶需求:
${userPrompt}

請考慮房間的形狀、尺寸、體積和現有材質，提供以下內容：
1. 為地板推薦的材質，包括名稱、顏色和質感描述
2. 為牆壁推薦的材質，包括名稱、顏色和質感描述
3. 為天花板推薦的材質，包括名稱、顏色和質感描述
4. 這些材質如何搭配，以及整體效果描述
5. 考慮到房間高度的特殊建議（如高牆壁適合垂直設計元素）

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
  "overall": "整體效果描述",
  "heightConsiderations": "考慮房間高度的特殊建議"
}
`;
      break;
    
    case 'furniture':
      enhancedPrompt = `
你是一位專業的室內設計師 AI 助手。請根據以下房間信息和用戶需求，提供詳細的家具擺放建議：

${roomDescription}

${spaceUtilization ? spaceUtilization + "\n" : ""}

用戶需求:
${userPrompt}

請考慮房間的形狀、尺寸、體積和現有家具，提供以下內容：
1. 推薦的家具列表，包括名稱、尺寸和位置
2. 家具擺放的整體布局描述
3. 考慮到房間形狀和大小的特殊建議
4. 考慮到房間高度的垂直空間利用建議

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
  "specialNotes": "特殊建議",
  "verticalSpaceUtilization": "垂直空間利用建議"
}
`;
      break;
    
    case 'lighting':
      enhancedPrompt = `
你是一位專業的室內設計師 AI 助手。請根據以下房間信息和用戶需求，提供詳細的照明設計建議：

${roomDescription}

${spaceUtilization ? spaceUtilization + "\n" : ""}

用戶需求:
${userPrompt}

請考慮房間的形狀、尺寸、體積和現有材質，提供以下內容：
1. 推薦的照明方案，包括主照明和輔助照明
2. 燈具的類型、數量和位置
3. 光源的色溫和亮度建議
4. 考慮到房間高度的特殊照明建議
5. 照明與材質的互動效果

請以JSON格式回答，格式如下：
{
  "mainLighting": {
    "type": "照明類型",
    "quantity": 數量,
    "position": "位置描述",
    "colorTemperature": "色溫描述",
    "brightness": "亮度描述"
  },
  "auxiliaryLighting": [
    {
      "type": "照明類型",
      "quantity": 數量,
      "position": "位置描述",
      "purpose": "用途描述"
    }
  ],
  "heightConsiderations": "考慮房間高度的特殊照明建議",
  "materialInteraction": "照明與材質的互動效果",
  "overallEffect": "整體照明效果描述"
}
`;
      break;
    
    default: // general
      enhancedPrompt = `
${roomDescription}

${spaceUtilization ? spaceUtilization + "\n" : ""}

用戶問題: ${userPrompt}

請根據以上房間信息回答用戶問題。在回答時，請考慮以下因素：
1. 房間的形狀、尺寸、體積和總表面積
2. 房間的材質和顏色
3. 現有的家具佈置和密度
4. 房間的空間利用率
5. 房間高度對設計的影響

如果是關於房間設計、家具擺放或材質選擇的問題，請提供具體、可行的建議，並解釋這些建議如何適合房間的特性。
`;
  }
  
  return enhancedPrompt;
}; 