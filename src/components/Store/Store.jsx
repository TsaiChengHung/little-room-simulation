import { create } from "zustand";

const useSelectionStore = create(
    (set, get) => ({
      designMode: "roomDesign", // 'roomDesign' or 'roomSimulation'
      selectedObject: null, // 用於標誌選中的物件類型，例如 'room' 或 'customObject'
      selectedObjectType: null,
      operationMode: null,
      transformMode: "translate",
      paintMode: "color",
      objects: {},
      roomType: 0,
      sunPosition: 0.5,

      // 統一管理的天地壁資料，初始為空，由組件設置
      roomData: null, // 初始為 null，等待組件初始化

      // 原有的 general functions
      setDesignMode: (mode) => set({ designMode: mode }),

      // 原有的 room simulation functions
      setSelectedObject: (object, type) =>
        set({ selectedObject: object, selectedObjectType: type }),

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
          return { objects: { ...state.objects, [objectKey]: objectData } };
        }),

      removeObject: (objectKey) =>
        set((state) => {
          if (!objectKey) return state;
          const updatedObjects = { ...state.objects };
          if (updatedObjects[objectKey]) {
            delete updatedObjects[objectKey];
          }
          return {
            objects: updatedObjects,
            selectedObject: null,
            selectedObjectType: null,
          };
        }),

      // 更新材質貼圖（統一管理於 roomData）
      setMaterialTexture: (textures) =>
        set((state) => {
          const selectedObject = state.selectedObject;
          if (
            !state.roomData ||
            !selectedObject ||
            state.selectedObjectType !== "room"
          )
            return;

          const updateMaterial = (item) => {
            if (item.id === selectedObject) {
              const material = item.material;
              material.map = textures.baseColor || null;
              material.normalMap = textures.normalMap || null;
              material.roughnessMap = textures.roughnessMap || null;
              material.aoMap = textures.aoMap || null;
              material.bumpMap = textures.bumpMap || null;
              material.ratio = textures.ratio || [1, 1];
              if (textures.aoMapIntensity !== undefined) {
                material.aoMapIntensity = textures.aoMapIntensity;
              }
              if (textures.roughness !== undefined) {
                material.roughness = textures.roughness;
              }
              if (textures.metalness !== undefined) {
                material.metalness = textures.metalness;
              }
              
              material.needsUpdate = true;
              item.isModified = true;
            }
            return item;
          };
          
          return {
            roomData: {
              ceiling: updateMaterial({ ...state.roomData.ceiling }),
              floor: updateMaterial({ ...state.roomData.floor }),
              walls: state.roomData.walls.map((wall) =>
                updateMaterial({ ...wall })
              ),
            },
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

          const updateMaterial = (item) => {
            if (item.id === selectedObject) {
              item.material.color = color;
              item.material.needsUpdate = true;
              item.isModified = true;
            }
            return item;
          };

          return {
            roomData: {
              ceiling: updateMaterial({ ...state.roomData.ceiling }),
              floor: updateMaterial({ ...state.roomData.floor }),
              walls: state.roomData.walls.map((wall) =>
                updateMaterial({ ...wall })
              ),
            },
          };
        }),

      setSunPosition: (position) => set({ sunPosition: position }),

      // 原有的 room design functions
      setRoomType: (index) => set({ roomType: index }),

      // 初始化房間資料，由組件調用
      setRoomData: (data) => set({ roomData: data }),

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
    }),
  )

export default useSelectionStore;
