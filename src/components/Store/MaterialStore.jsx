import { create } from "zustand";

const useMaterialStore = create((set, get) => ({
    // 把所有被選中的物件的材質資料統一管理，初始為空
    materialData: null,
    
    addMaterialData: (materialKey, materialData) =>
        set((state) => {
            if (!materialKey || !materialData || (materialKey in state.materialData)) return state;
            return { materialData: { ...state.materialData, [materialKey]: materialData } };
        }),


    }));