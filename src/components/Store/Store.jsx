import { v4 as uuidv4 } from 'uuid';
import { create } from "zustand";
import * as THREE from 'three';

const useSelectionStore = create((set, get) => ({
  designMode: "roomDesign", // 'roomDesign' or 'roomSimulation'
  selectedObject: { object: null, objectId: null, type: null }, // type用於標誌選中的物件類型，例如 'room' 或 'customObject'
  operationMode: null,
  transformMode: "translate",
  paintMode: "color",
  currentFloorPoints: [],
  sunPosition: 0.5,

  // 統一管理所有家具物件
  objects: {},

  // 統一管理的天地壁資料，初始為空，由組件設置
  roomData: null, // 初始為 null，等待組件初始化

  // 預載資源相關狀態
  preloadedModels: {}, // 存儲預載的 3D 模型
  preloadedTextures: {}, // 存儲預載的貼圖
  isResourcesLoaded: false, // 資源是否已加載完成

  // AI 相關狀態
  aiPrompt: '',
  isAIGenerating: false,
  aiGeneratedSuggestions: null,

  // 原有的 general functions
  setDesignMode: (mode) => set({ designMode: mode }),

  // 原有的 room simulation functions
  setSelectedObject: (object, objectId, type) =>
    set({ selectedObject: { object, objectId, type } }),

  clearSelectedObject: () =>
    set({ selectedObject: null }),

  setOperationMode: (mode) =>
    set({
      operationMode: mode,
      selectedObject: {object: null, objectId: null, type: null},
    }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  setPaintMode: (mode) => set({ paintMode: mode }),

  addObject: (objectKey, objectData) =>
    set((state) => {
      if (!objectKey || !objectData) return state;

      if (!state.objects[objectKey]) {
        state.objects[objectKey] = [];
      }

      // Clone the 3D object to create an independent instance
      const clonedObject = objectData.object.clone();
      clonedObject.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
        }
      });

      const newObject = {
        id: uuidv4(),
        object: clonedObject, // Use the cloned object instead of the original
        objectName: objectData?.name ?? null,
        description: objectData?.description ?? null,
        price: objectData?.price ?? null,
        glbFile: objectData?.glbFile ?? null,
        thumbnailUrl: objectData?.thumbnailUrl ?? null,
        transform: objectData?.transform ?? {
          translate: [0, 0, 0],
          rotate: [0, 0, 0],
          scale: [1, 1, 1]
        }
      };

      state.objects[objectKey].push(newObject);

      return { objects: { ...state.objects } };
    }),

  removeObject: (objectId) =>
    set((state) => {
      if (!objectId) return state;

      const updatedObjects = { ...state.objects };

      // Search through all object categories to find and remove the object with matching ID
      Object.keys(updatedObjects).forEach(key => {
        updatedObjects[key] = updatedObjects[key].filter(item => item.id !== objectId);

        // Remove the category if it's empty
        if (updatedObjects[key].length === 0) {
          delete updatedObjects[key];
        }
      });

      return {
        objects: updatedObjects,
        selectedObject: state.selectedObject?.objectId === objectId ?
          { object: null, objectId: null, type: null } :
          state.selectedObject
      };
    }),

  addRoomDataObject: (objectKey, objectArea, objectData) =>
    set((state) => {
      const roomDataObject = {
        id: objectKey,
        area: objectArea,
        price: 0,
        materialName: objectData?.materialName ?? null,
        isModified: objectData?.isModified ?? false,
        textures: {
          // texture
          map: objectData?.textures?.mapPath ?? null,
          normalMap: objectData?.textures?.normalMapPath ?? null,
          roughnessMap: objectData?.textures?.roughnessMapPath ?? null,
          aoMap: objectData?.textures?.aoMapPath ?? null,
          bumpMap: objectData?.textures?.bumpMapPath ?? null,
          color: objectData?.textures?.color ?? null,
          // value
          aoMapIntensity: objectData?.textures?.aoMapIntensity ?? 1,
          roughness: objectData?.textures?.roughness ?? 1,
          metalness: objectData?.textures?.metalness ?? 0,
          ratio: objectData?.textures?.ratio ?? [1, 1],
        },
      };

      return {
        roomData: {
          ...state.roomData,
          [objectKey]: roomDataObject,
        },
      };
    }),

  // 更新材質貼圖（統一管理於 roomData）
  setMaterialTexture: (textureObject) =>
    set((state) => {
      const selectedObject = state.selectedObject.object;
      if (!state.roomData || !selectedObject || state.selectedObject.type !== "room")
        return state;

      const textures = textureObject.textures;
      const updatedRoomData = {
        ...state.roomData,
        [selectedObject]: {
          ...state.roomData[selectedObject],
          materialName: textureObject.name,
          price: textureObject.price,
          textures: {
            ...state.roomData[selectedObject].textures,
            map: textures.map || null,
            normalMap: textures.normalMap || null,
            roughnessMap: textures.roughnessMap || null,
            aoMap: textures.aoMap || null,
            bumpMap: textures.bumpMap || null,
            color:
              textures.color ??
              state.roomData[selectedObject].textures.color,
            aoMapIntensity:
              textures.aoMapIntensity ??
              state.roomData[selectedObject].textures.aoMapIntensity,
            roughness:
              textures.roughness ??
              state.roomData[selectedObject].textures.roughness,
            metalness:
              textures.metalness ??
              state.roomData[selectedObject].textures.metalness,
            needsUpdate: true,
          },
          isModified: true,
        },
      };
      return {
        roomData: updatedRoomData,
      };
    }),

  // 更新材質顏色（統一管理於 roomData）
  setMaterialColor: (color) =>
    set((state) => {
      const selectedObject = state.selectedObject.object;
      if (!state.roomData || !selectedObject || state.selectedObject.type !== "room")
        return state;

      // 直接更新 Three.js 材質
      const mesh = selectedObject;
      if (mesh && mesh.material) {
        mesh.material.color = new THREE.Color(color);
        mesh.material.needsUpdate = true;
      }

      const updatedRoomData = {
        ...state.roomData,
        [selectedObject]: {
          ...state.roomData[selectedObject],
          textures: {
            ...state.roomData[selectedObject].textures,
            color: color,
          },
          isModified: true,
        },
      };

      return {
        roomData: updatedRoomData,
      };
    }),

  setSunPosition: (position) => set({ sunPosition: position }),

  setCurrentFloorPoints: (points) => set({ currentFloorPoints: points }),

  resetRoomData: () => set({ roomData: {} }),

  getModifiedItems: () => {
    if (!get().roomData) return [];
    const { ceiling, floor, walls } = get().roomData;
    return [
      ceiling.isModified ? ceiling : null,
      floor.isModified ? floor : null,
      ...walls.filter((wall) => wall.isModified),
    ].filter(Boolean);
  },

  updateObjectTransform: (objectId, newTransform) =>
    set((state) => {
      const updatedObjects = { ...state.objects };

      // Find and update the object with matching ID
      Object.keys(updatedObjects).forEach(key => {
        const objectIndex = updatedObjects[key].findIndex(item => item.id === objectId);
        if (objectIndex !== -1) {
          updatedObjects[key][objectIndex] = {
            ...updatedObjects[key][objectIndex],
            transform: {
              ...updatedObjects[key][objectIndex].transform,
              ...newTransform
            }
          };
        }
      });

      return { objects: updatedObjects };
    }),

  // 設置預載模型
  setPreloadedModels: (models) => set({ preloadedModels: models }),
  
  // 設置預載貼圖
  setPreloadedTextures: (textures) => set({ preloadedTextures: textures }),
  
  // 標記資源加載完成
  setResourcesLoaded: (loaded) => set({ isResourcesLoaded: loaded }),
  
  // 獲取特定模型
  getModel: (modelId) => {
    const { preloadedModels } = get();
    return preloadedModels[modelId] || null;
  },
  
  // 獲取特定貼圖
  getTexture: (textureId) => {
    const { preloadedTextures } = get();
    return preloadedTextures[textureId] || null;
  },
  
  // 初始化預載資源
  initializeResources: async () => {
    try {
      // 這裡將調用修改後的 preloadAllObjects 和 loadAllTextures 函數
      const { preloadAllObjects } = await import('../Objects/ObjectsPreload');
      const { getTextureBuffers } = await import('../AssetManage/Textures');
      
      // 加載模型
      const models = await preloadAllObjects();
      set({ preloadedModels: models });
      
      // 加載貼圖
      const textures = getTextureBuffers();
      set({ preloadedTextures: textures });
      
      // 標記加載完成
      set({ isResourcesLoaded: true });
      
      return true;
    } catch (error) {
      console.error("初始化資源時出錯:", error);
      return false;
    }
  },

  // 設置 AI 提示詞
  setAIPrompt: (prompt) => set({ aiPrompt: prompt }),
  
  // 觸發 AI 生成設計
  generateAIDesign: async (prompt) => {
    const { roomData } = get();
    if (!roomData) return false;
    
    set({ isAIGenerating: true });
    
    try {
      // 準備房間數據供 AI 使用
      const roomDimensions = {
        // 從 roomData 中提取房間尺寸信息
        floor: {
          id: 'floor',
          area: roomData.floor?.area || 0
        },
        walls: Object.keys(roomData)
          .filter(key => key.startsWith('wall-'))
          .map(key => ({
            id: key,
            area: roomData[key].area
          })),
        ceiling: {
          id: 'ceiling',
          area: roomData.ceiling?.area || 0
        }
      };
      
      // 調用 AI 服務
      const response = await fetch('YOUR_AI_SERVICE_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomDimensions,
          prompt,
          type: 'fullDesign'
        })
      });
      
      if (!response.ok) throw new Error('AI service request failed');
      
      const aiSuggestions = await response.json();
      
      set({ 
        aiGeneratedSuggestions: aiSuggestions,
        isAIGenerating: false 
      });
      
      return true;
    } catch (error) {
      console.error('AI generation failed:', error);
      set({ isAIGenerating: false });
      return false;
    }
  },
  
  // 應用 AI 生成的材質設計 (修訂版，適配您的材質結構)
  applyAIMaterials: () => {
    const { aiGeneratedSuggestions, roomData } = get();
    if (!aiGeneratedSuggestions?.materials || !roomData) return false;
    
    const updatedRoomData = { ...roomData };
    
    // 應用 AI 建議的材質到各個表面
    Object.keys(aiGeneratedSuggestions.materials).forEach(surfaceId => {
      if (updatedRoomData[surfaceId]) {
        const materialSuggestion = aiGeneratedSuggestions.materials[surfaceId];
        
        // 創建或更新材質
        updatedRoomData[surfaceId] = {
          ...updatedRoomData[surfaceId],
          materialName: materialSuggestion.name || 'AI Generated',
          isModified: true,
          price: materialSuggestion.price || 0,
          textures: {
            // 保留現有的 textures 屬性
            ...updatedRoomData[surfaceId].textures,
            
            // 更新 AI 建議的材質屬性
            // 注意：對於貼圖，我們需要先加載貼圖，然後設置 uuid
            color: materialSuggestion.color || null,
            metalness: materialSuggestion.metalness !== undefined ? materialSuggestion.metalness : updatedRoomData[surfaceId].textures.metalness,
            roughness: materialSuggestion.roughness !== undefined ? materialSuggestion.roughness : updatedRoomData[surfaceId].textures.roughness,
            aoMapIntensity: materialSuggestion.aoMapIntensity !== undefined ? materialSuggestion.aoMapIntensity : updatedRoomData[surfaceId].textures.aoMapIntensity,
            ratio: materialSuggestion.ratio || updatedRoomData[surfaceId].textures.ratio,
            needsUpdate: true
          }
        };
        
        // 如果 AI 建議包含貼圖路徑，我們需要加載這些貼圖
        if (materialSuggestion.mapPath) {
          loadTexture(materialSuggestion.mapPath).then(texture => {
            updatedRoomData[surfaceId].textures.map = texture;
            set({ roomData: { ...updatedRoomData } });
          });
        }
        
        if (materialSuggestion.normalMapPath) {
          loadTexture(materialSuggestion.normalMapPath).then(texture => {
            updatedRoomData[surfaceId].textures.normalMap = texture;
            set({ roomData: { ...updatedRoomData } });
          });
        }
        
        if (materialSuggestion.roughnessMapPath) {
          loadTexture(materialSuggestion.roughnessMapPath).then(texture => {
            updatedRoomData[surfaceId].textures.roughnessMap = texture;
            set({ roomData: { ...updatedRoomData } });
          });
        }
        
        if (materialSuggestion.aoMapPath) {
          loadTexture(materialSuggestion.aoMapPath).then(texture => {
            updatedRoomData[surfaceId].textures.aoMap = texture;
            set({ roomData: { ...updatedRoomData } });
          });
        }
        
        if (materialSuggestion.bumpMapPath) {
          loadTexture(materialSuggestion.bumpMapPath).then(texture => {
            updatedRoomData[surfaceId].textures.bumpMap = texture;
            set({ roomData: { ...updatedRoomData } });
          });
        }
      }
    });
    
    set({ roomData: updatedRoomData });
    return true;
  },
}));

// 輔助函數：加載貼圖
async function loadTexture(path) {
  if (!path) return null;
  
  return new Promise((resolve) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(path, (texture) => {
      // 設置貼圖屬性
      texture.isTexture = true;
      texture.uuid = THREE.MathUtils.generateUUID();
      resolve(texture);
    });
  });
}

export default useSelectionStore;
