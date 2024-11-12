import { useGLTF } from '@react-three/drei';

// 預先載入模型陣列
export const glbUrls = {
  cabinet: {
    bookcase: '/items/cabinent/bookcase.glb',
    cabinet: '/items/cabinent/cabinet.glb',
    kalla: '/items/cabinent/kalla.glb',
  },
  chairs: {
    armChair: '/items/chairs/arm_chair.glb',
    metalChair: '/items/chairs/metal_chair.glb',
    woodChair: '/items/chairs/wood_chair.glb',
  },
  deco: {
    artDecoFan: '/items/deco/art_deco_fan_revised.glb',
    deskPlant: '/items/deco/desk_plant_in_pot.glb',
    monstera: '/items/deco/monstera_b02.glb',
    projectorScreen: '/items/deco/simple_tv_projector_screen.glb',
    snakePlant: '/items/deco/snake_plant_scan_lowpoly.glb',
  },
  table: {
    coffeeTable: '/items/table/coffee_table.glb',
    tableRonde: '/items/table/table_ronde.glb',
    woodenTable: '/items/table/wooden_table_viejdi1_mid.glb',
  },
};

export function GetModel(category, itemName) {
  const url = glbUrls[category]?.[itemName];
  const { nodes, materials } = useGLTF(url);



  return (
    console.log(nodes, materials)
  );
}

