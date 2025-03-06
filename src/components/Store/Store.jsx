import { v4 as uuidv4 } from 'uuid';
import { create } from "zustand";

const useSelectionStore = create((set, get) => ({
  designMode: "roomDesign", // 'roomDesign' or 'roomSimulation'
  selectedObject: { object: null, objectId: null, type: null }, // type用於標誌選中的物件類型，例如 'room' 或 'customObject'
  operationMode: null,
  transformMode: "translate",
  paintMode: "color",
  roomType: 0,
  sunPosition: 0.5,

  // 統一管理所有家具物件
  objects: {},

  // 統一管理的天地壁資料，初始為空，由組件設置
  roomData: null, // 初始為 null，等待組件初始化

  // 原有的 general functions
  setDesignMode: (mode) => set({ designMode: mode }),

  // 原有的 room simulation functions
  setSelectedObject: (object, objectId, type) =>
    set({ selectedObject: {object, objectId, type}}),

  clearSelectedObject: () =>
    set({ selectedObject: null, selectedObjectType: null }),

  setOperationMode: (mode) =>
    set({
      operationMode: mode,
      selectedObject: null,
      selectedObjectType: null,
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
      const selectedObject = state.selectedObject;
      if (
        !state.roomData ||
        !selectedObject ||
        state.selectedObjectType !== "room"
      )
        return state;
      console.log("setMaterialTexture", textureObject, selectedObject);

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
            ratio: textures.ratio || [1, 1],
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
      const selectedObject = state.selectedObject;
      if (
        !state.roomData ||
        !selectedObject ||
        state.selectedObjectType !== "room"
      )
        return state;

      const updatedRoomData = {
        ...state.roomData,
        [selectedObject]: {
          ...state.roomData[selectedObject],
          textures: {
            ...state.roomData[selectedObject].textures,
            color: color,
            needsUpdate: true,
          },
          isModified: true,
        },
      };

      return {
        roomData: updatedRoomData,
      };
    }),

  setSunPosition: (position) => set({ sunPosition: position }),

  // 原有的 room design functions
  setRoomType: (index) => set({ roomType: index }),

  resetRoomData: () => set({ roomData: null }),

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
}));

export default useSelectionStore;
