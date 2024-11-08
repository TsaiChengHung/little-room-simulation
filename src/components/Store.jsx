import { create } from "zustand";

const useSelectionStore = create((set) => ({
  selectedObject: null, // 儲存選中的物件名稱
  roomMaterials: {},
  isChangingRoomMaterial: false,
  
  setSelectedObject: (object) => set({ selectedObject: object }),
  clearSelectedObject: () => set({ selectedObject: null }),
  
  setIsChangingRoomMaterial: (value) => set({ isChangingRoomMaterial: value }),

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
  
  // 設定並保存材質到 objectMaterials
  setMaterial: (material) =>
    set((state) => {
        const selectedObjectKey = state.selectedObject
      if (selectedObjectKey) {
        return {
          roomMaterials: {
            ...state.roomMaterials, [selectedObjectKey]: material
          }
        };
      }
      return {};
    }),
}));

export default useSelectionStore;
