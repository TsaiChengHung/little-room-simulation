import { create } from "zustand";

const useSelectionStore = create((set, get) => ({
  // general params
  designMode: 'roomSimulation', // 'roomDesign' or 'roomSimulation'

  // room simulation params
  selectedObject: null, // 儲存選中的物件名稱
  selectedObjectType: null, // 用於標誌選中的物件類型，例如 'room' 或 'customObject'
  roomMaterials: {},
  operationMode: null,
  transformMode: "translate",
  paintMode: "color",
  defaultObjects: {}, // 儲存所有場景物件的資訊
  objects: {},

  // room design params
  roomDimensions: {
    width: 4, // meters
    depth: 3, // meters
    wallThickness: 0.1, // meters
  },

  // sun position params
  sunPosition: 0.5, // Default to noon

  // general functions
  setDesignMode: (mode) => set({ designMode: mode }),

  // room simulation functions
  setSelectedObject: (object, type) => set({ selectedObject: object, selectedObjectType: type }),

  clearSelectedObject: () => set({ selectedObject: null, selectedObjectType: null }),

  setOperationMode: (mode) => set({ operationMode: mode, selectedObject: null, selectedObjectType: null }), //paint or object

  setTransformMode: (mode) => set({ transformMode: mode }),

  setPaintMode: (mode) => set({ paintMode: mode }),

  addRoomMaterial: (key, material) => set((state) => ({ roomMaterials: { ...state.roomMaterials, [key]: material } })),

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

  setMaterialTexture: (material, textures) =>
    set((state) => {
      const selectedObjectKey = state.selectedObject;
      if (selectedObjectKey && state.selectedObjectType === 'room') {
        const currentMaterial = state.roomMaterials[selectedObjectKey];
        if (currentMaterial) {
          // Update existing material's textures
          currentMaterial.map = textures.baseColor || null;
          currentMaterial.normalMap = textures.normalMap || null;
          currentMaterial.roughnessMap = textures.roughnessMap || null;
          currentMaterial.aoMap = textures.aoMap || null;
          currentMaterial.bumpMap = textures.bumpMap || null;

          // Update material properties
          if (textures.aoMapIntensity !== undefined) {
            currentMaterial.aoMapIntensity = textures.aoMapIntensity;
          }
          if (textures.roughness !== undefined) {
            currentMaterial.roughness = textures.roughness;
          }
          if (textures.metalness !== undefined) {
            currentMaterial.metalness = textures.metalness;
          }

          // Force material update
          currentMaterial.needsUpdate = true;

          return { roomMaterials: { ...state.roomMaterials } };
        }

        // If no existing material, create new one
        return { roomMaterials: { ...state.roomMaterials, [selectedObjectKey]: material } };
      }
      return {};
    }),

  setMaterialColor: (material, color) => {
    const state = get();
    if (state.roomMaterials[material]) {
      state.roomMaterials[material].color.set(color);
    }
  },

  setSunPosition: (position) => set({ sunPosition: position }),

  // room design functions
  setRoomDimensions: (dimensions) =>
    set((state) => ({
      roomDimensions: { ...state.roomDimensions, ...dimensions }
    })),
}));

export default useSelectionStore;
