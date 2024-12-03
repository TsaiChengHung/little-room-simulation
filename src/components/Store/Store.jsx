import { create } from "zustand";

const useSelectionStore = create((set, get) => ({
  // general params
  currentScene: "roomDesign", // roomDesign or roomSimulation
  
  // room simulation params
  selectedObject: null, // 儲存選中的物件名稱
  selectedObjectType: null, // 用於標誌選中的物件類型，例如 'room' 或 'customObject'
  roomMaterials: {},
  operationMode: null,
  transformMode: "translate",
  defaultObjects: {}, // 儲存所有場景物件的資訊
  objects: {},

  // room design params
  

  // general functions
  setCurrentScene: (scene) => set({ currentScene: scene }),
  
  // room simulation functions
  setSelectedObject: (object, type) => set({ selectedObject: object, selectedObjectType: type }),

  clearSelectedObject: () => set({ selectedObject: null, selectedObjectType: null }),

  setOperationMode: (mode) => set({ operationMode: mode, selectedObject: null, selectedObjectType: null }), //paint or object

  setTransformMode: (mode) => set({ transformMode: mode }),

  initializeRoomMaterials: (nodes) => {
    const initialMaterials = Object.fromEntries(
      Object.entries(nodes).filter(([key, node]) => node.isMesh).map(([key, node]) => [key, node.material])
    );
    set({ roomMaterials: initialMaterials });
  },

  AddToDefaultObjects: (key, node) =>
    set((state) => ({ defaultObjects: { ...state.defaultObjects, [key]: node } })),

  removeDefaultObject: (objectKey) =>
    set((state) => {
      if (!objectKey) return state;
      const updatedObjects = { ...state.defaultObjects };
      if (updatedObjects[objectKey]) {
        delete updatedObjects[objectKey];
      }
      return { defaultObjects: updatedObjects, selectedObject: null, selectedObjectType: null };
    }),

  addObject: (objectKey, objectData) =>
    set((state) => {
      if (!objectKey || !objectData) return state;
      return { objects: { ...state.objects, [objectKey]: objectData } };
    }),

  removeObject: (objectKey) =>
    set((state) => {
      if (!objectKey) return state;
      const updatedObjects = { ...state.objects };
      if (updatedObjects[objectKey]) {
        delete updatedObjects[objectKey];
      }
      return { objects: updatedObjects, selectedObject: null, selectedObjectType: null };
    }),                                               

  setMaterial: (material) =>
    set((state) => {
      const selectedObjectKey = state.selectedObject;
      if (selectedObjectKey && state.selectedObjectType === 'room') {
        return { roomMaterials: { ...state.roomMaterials, [selectedObjectKey]: material } };
      }
      return {};
    }),

    // room design functions
    
}));

export default useSelectionStore;
