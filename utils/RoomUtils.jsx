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
  
  let description = 'Room Information:\n';
  
  // Add geometric information
  if (roomInfo.geometry) {
    if (roomInfo.geometry.shape) description += `- Shape: ${roomInfo.geometry.shape}\n`;
    if (roomInfo.geometry.area) description += `- Area: ${roomInfo.geometry.area} square meters\n`;
    if (roomInfo.geometry.perimeter) description += `- Perimeter: ${roomInfo.geometry.perimeter} meters\n`;
  }
  
  // Add dimension information
  if (roomInfo.dimensions) {
    const { width, length, height } = roomInfo.dimensions;
    if (width && length) description += `- Dimensions: ${width.toFixed(2)}m × ${length.toFixed(2)}m`;
    if (height) description += ` × ${height.toFixed(2)}m (height)\n`;
    else description += '\n';
  }
  
  // Add volume and total surface area
  if (roomInfo.volume) description += `- Volume: ${roomInfo.volume.toFixed(2)} cubic meters\n`;
  if (roomInfo.totalSurfaceArea) description += `- Total Surface Area: ${roomInfo.totalSurfaceArea.toFixed(2)} square meters\n`;
  
  // Add material information
  if (roomInfo.materials) {
    description += '\nMaterial Information:\n';
    
    if (roomInfo.materials.floor) {
      const floorColor = roomInfo.materials.floor.color ? 
        `, Color: ${roomInfo.materials.floor.color}` : '';
      description += `- Floor: ${roomInfo.materials.floor.material} (Area: ${roomInfo.materials.floor.area} square meters${floorColor})\n`;
    } else {
      description += '- Floor: Not set\n';
    }
    
    if (roomInfo.materials.ceiling) {
      const ceilingColor = roomInfo.materials.ceiling.color ? 
        `, Color: ${roomInfo.materials.ceiling.color}` : '';
      description += `- Ceiling: ${roomInfo.materials.ceiling.material} (Area: ${roomInfo.materials.ceiling.area} square meters${ceilingColor})\n`;
    } else {
      description += '- Ceiling: Not set\n';
    }
    
    if (roomInfo.materials.walls && roomInfo.materials.walls.length > 0) {
      description += '- Walls:\n';
      roomInfo.materials.walls.forEach(wall => {
        const wallColor = wall.color ? `, Color: ${wall.color}` : '';
        description += `  * ${wall.id}: ${wall.material} (Area: ${wall.area} square meters${wallColor})\n`;
      });
    } else {
      description += '- Walls: Not set\n';
    }
  }
  
  // Add object information
  if (roomInfo.objects) {
    description += '\nObject Information:\n';
    
    if (roomInfo.objects.totalCount) {
      description += `- Total Count: ${roomInfo.objects.totalCount} objects\n`;
    }
    
    if (roomInfo.objects.density) {
      description += `- Furniture Density: ${roomInfo.objects.density} items/square meter\n`;
    }
    
    if (roomInfo.objects.categoryBreakdown) {
      description += '- Category Breakdown: ';
      description += Object.entries(roomInfo.objects.categoryBreakdown)
        .map(([category, count]) => `${category}: ${count} items`)
        .join(', ');
      description += '\n';
    }
  } else {
    description += '\nObject Information: No objects\n';
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
  if (!floorArea || floorArea <= 0) return "Cannot assess space utilization: Missing floor area information";
  if (!furnitureCount) return "Space Utilization: Empty room, no furniture";
  
  const density = furnitureCount / floorArea;
  
  if (density < 0.1) return "Space Utilization: Very low, room appears spacious";
  if (density < 0.2) return "Space Utilization: Low, plenty of activity space";
  if (density < 0.3) return "Space Utilization: Moderate, balanced furniture and activity space";
  if (density < 0.4) return "Space Utilization: High, furniture arrangement is compact";
  return "Space Utilization: Very high, space may appear crowded";
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
You are a professional AI assistant for interior design. Please provide detailed material suggestions based on the following room information and user requirements:

${roomDescription}

${spaceUtilization ? spaceUtilization + "\n" : ""}

User Requirements:
${userPrompt}

Please consider the shape, dimensions, volume, and existing materials of the room, and provide the following content:
1. Material suggestions for the floor, including name, color, and texture description
2. Material suggestions for the walls, including name, color, and texture description
3. Material suggestions for the ceiling, including name, color, and texture description
4. How these materials can be combined and describe the overall effect
5. Considerations for special design suggestions based on room height (e.g., high walls are suitable for vertical design elements)

Please answer in JSON format, as follows:
{
  "floor": {
    "name": "Material Name",
    "color": "Color Code or Description",
    "description": "Texture and Appearance Description"
  },
  "walls": {
    "name": "Material Name",
    "color": "Color Code or Description",
    "description": "Texture and Appearance Description"
  },
  "ceiling": {
    "name": "Material Name",
    "color": "Color Code or Description",
    "description": "Texture and Appearance Description"
  },
  "overall": "Overall Effect Description",
  "heightConsiderations": "Special Design Suggestions Based on Room Height"
}
`;
      break;
    
    case 'furniture':
      enhancedPrompt = `
You are a professional AI assistant for interior design. Please provide detailed furniture placement suggestions based on the following room information and user requirements:

${roomDescription}

${spaceUtilization ? spaceUtilization + "\n" : ""}

User Requirements:
${userPrompt}

Please consider the shape, dimensions, volume, and existing furniture of the room, and provide the following content:
1. Recommended furniture list, including name, dimensions, and position
2. Describe the overall layout of furniture placement
3. Considerations for special design suggestions based on room shape and size
4. Considerations for vertical space utilization based on room height

Please answer in JSON format, as follows:
{
  "furniture": [
    {
      "name": "Furniture Name",
      "type": "Furniture Type",
      "dimensions": {
        "width": Width,
        "depth": Depth,
        "height": Height
      },
      "position": {
        "x": x Coordinate,
        "y": y Coordinate,
        "z": z Coordinate
      },
      "rotation": Rotation Angle (degrees)
    }
  ],
  "layout": "Overall Layout Description",
  "specialNotes": "Special Suggestions",
  "verticalSpaceUtilization": "Vertical Space Utilization Suggestions"
}
`;
      break;
    
    case 'lighting':
      enhancedPrompt = `
You are a professional AI assistant for interior design. Please provide detailed lighting design suggestions based on the following room information and user requirements:

${roomDescription}

${spaceUtilization ? spaceUtilization + "\n" : ""}

User Requirements:
${userPrompt}

Please consider the shape, dimensions, volume, and existing materials of the room, and provide the following content:
1. Recommended lighting solutions, including main lighting and auxiliary lighting
2. Type, quantity, and position of lights
3. Light source color temperature and brightness suggestions
4. Considerations for special lighting suggestions based on room height
5. Lighting interaction with materials

Please answer in JSON format, as follows:
{
  "mainLighting": {
    "type": "Lighting Type",
    "quantity": Quantity,
    "position": "Position Description",
    "colorTemperature": "Color Temperature Description",
    "brightness": "Brightness Description"
  },
  "auxiliaryLighting": [
    {
      "type": "Lighting Type",
      "quantity": Quantity,
      "position": "Position Description",
      "purpose": "Purpose Description"
    }
  ],
  "heightConsiderations": "Special Lighting Suggestions Based on Room Height",
  "materialInteraction": "Lighting Interaction with Materials",
  "overallEffect": "Overall Lighting Effect Description"
}
`;
      break;
    
    default: // general
      enhancedPrompt = `
${roomDescription}

${spaceUtilization ? spaceUtilization + "\n" : ""}

User Question: ${userPrompt}

Please answer the user question based on the above room information. When answering, please consider the following factors:
1. Room shape, dimensions, volume, and total surface area
2. Room materials and colors
3. Existing furniture arrangement and density
4. Room space utilization
5. Room height's impact on design

If the question is about room design, furniture placement, or material selection, please provide specific and feasible suggestions, and explain how these suggestions are suitable for the room's characteristics.
`;
  }
  
  return enhancedPrompt;
}; 