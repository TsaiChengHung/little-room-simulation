import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

// 預先載入模型URL
export const glbUrls = {
  cabinet: {
    bookcase: "/items/cabinent/bookcase.glb",
    cabinet: "/items/cabinent/cabinet.glb",
    kalla: "/items/cabinent/kalla.glb",
  },
  chairs: {
    armChair: "/items/chairs/arm_chair.glb",
    metalChair: "/items/chairs/metal_chair.glb",
    woodChair: "/items/chairs/wood_chair.glb",
  },
  deco: {
    artDecoFan: "/items/deco/art_deco_fan_revised.glb",
    deskPlant: "/items/deco/desk_plant_in_pot.glb",
    monstera: "/items/deco/monstera_b02.glb",
    projectorScreen: "/items/deco/simple_tv_projector_screen.glb",
    snakePlant: "/items/deco/snake_plant_scan_lowpoly.glb",
  },
  table: {
    coffeeTable: "/items/table/coffee_table.glb",
    tableRonde: "/items/table/table_ronde.glb",
    woodenTable: "/items/table/wooden_table_viejdi1_mid.glb",
  },
};

// 用于缓存模型的对象，结构与 glbUrls 相同
export const modelCache = {
  cabinet: {},
  chairs: {},
  deco: {},
  table: {},
};

// 传入类别和模型名称，开始加载模型并更新缓存
export function preloadModel(category, itemName) {
  
    const url = glbUrls[category]?.[itemName];
    if (!url) {
      console.error("模型未找到: ", category, itemName);
      return;
    }

    // 检查缓存中是否已有模型数据
    if (modelCache[category][itemName]) {
      console.log(`模型已缓存: ${itemName}`);
      return "modelBeenCache";
    }

    // 使用 useGLTF Hook 预加载模型
    const {nodes, materials} = useGLTF(url)
    if (nodes){
      modelCache[category][itemName] = {
        geometry: nodes,
        material: materials,
        position: [0,0,0],
        rotation: [0,0,0],
        scale: [1,1,1],
      };
    }
    // 将加载的模型数据存入缓存
    

  return null;
}
