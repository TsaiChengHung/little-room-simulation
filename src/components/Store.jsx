import { create } from "zustand";

const useSelectionStore = create((set) => ({
  selectedObject: null, // 儲存選中的物件名稱
  selectedObjectType: null, // 用於標誌選中的物件類型，例如 'room' 或 'customObject'
  roomMaterials: {},
  enableChangingRoomMaterial: true,
  objects: {}, // 儲存所有場景物件的資訊

  setSelectedObject: (object, type) => set({ selectedObject: object, selectedObjectType: type }),
  clearSelectedObject: () => set({ selectedObject: null, selectedObjectType: null }),

  setIsChangingRoomMaterial: (value) => set({ enableChangingRoomMaterial: value }),

  // 初始化 roomMaterials
  initializeRoomMaterials: (nodes) => {
    const initialMaterials = {};
    Object.keys(nodes).forEach((key) => {
      const node = nodes[key];
      if (node.isMesh) {
        initialMaterials[key] = node.material;
      }
    });
    set({ roomMaterials: initialMaterials });
  },

  // 初始化場景物件資訊
  initializeObjects: (nodes) => {
    const objects = {};
    Object.keys(nodes).forEach((key) => {
      const node = nodes[key];
      if (node.isMesh) {
        objects[key] = {
          geometry: node.geometry,
          material: node.material,
          position: node.position,
          rotation: node.rotation,
          scale: node.scale,
        };
      }
    });
    set({ objects });
  },

  // 設定並保存材質到 roomMaterials
  setMaterial: (material) =>
    set((state) => {
      const selectedObjectKey = state.selectedObject;
      if (selectedObjectKey && state.selectedObjectType === 'room') {
        // 只對房間中的物件進行材質設置
        return {
          roomMaterials: {
            ...state.roomMaterials,
            [selectedObjectKey]: material,
          },
        };
      }
      return {}; // 如果沒有選中物件或者不是房間物件，返回空更新
    }),

  // 移除模型
  removeModel: (modelKey) =>
    set((state) => {
      if (!modelKey) return state;
      const updatedObjects = { ...state.objects };
      if (updatedObjects[modelKey]) {
        delete updatedObjects[modelKey];
      }
      return { objects: updatedObjects, selectedObject: null, selectedObjectType: null };
    }),
}));

export default useSelectionStore;
