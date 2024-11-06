import { create } from "zustand";
import * as THREE from 'three';

const useSelectionStore = create((set) => ({
  selectedObject: null, // 儲存選中的物件名稱
  roomMaterials: {},
  
  // 定義三個材質
  material1: new THREE.MeshStandardMaterial({ color: '#FF5733' }), // 紅色
  material2: new THREE.MeshStandardMaterial({ color: '#33FF57' }), // 綠色
  material3: new THREE.MeshStandardMaterial({ color: '#3357FF' }), // 藍色
  
  setSelectedObject: (object) => set({ selectedObject: object }),
  clearSelectedObject: () => set({ selectedObject: null }),
  
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
