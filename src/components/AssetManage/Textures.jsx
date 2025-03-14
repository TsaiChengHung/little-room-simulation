import * as THREE from "three";
import { useMemo } from "react";
import React from "react";
import useSelectionStore from "../Store/Store";

// 全局 textureBuffers 對象
export const textureBuffers = {};

// Define material textures
export const materialTextures = {
  brick: {
    price: 5,
    description: "Traditional red brick wall with mortar joints, rough and rustic appearance",
    tags: ["wall", "brick", "wall texture"],
    map:
      "/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_BaseColor.jpg",
    normalMap:
      "/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Normal.jpg",
    roughnessMap:
      "/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Roughness.jpg",
    aoMap: "/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_AO.jpg",
    bumpMap: "/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Bump.jpg",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0,
    ratio: [1,1],
  },
  concrete: {
    price: 10,
    description: "Smooth gray concrete surface with subtle imperfections and fine grain texture",
    tags: ["wall", "concrete", "industrial"],
    map:
      "/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_BaseColor.jpg",
    normalMap:
      "/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_Normal.jpg",
    roughnessMap:
      "/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_Roughness.jpg",
    aoMap:
      "/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_AO.jpg",
    aoMapIntensity: 1,
    roughness: 0.9,
    metalness: 0,
    ratio: [0.8,0.8],
  },
  dryWall: {
    price: 15,
    description: "Clean, flat white interior wall surface with minimal texture and slight variations",
    tags: ["wall", "interior", "smooth"],
    map:
      "/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_BaseColor.jpg",
    normalMap: "/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_Normal.jpg",
    roughnessMap:
      "/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_Roughness.jpg",
    aoMap: "/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_AO.jpg",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0,
    ratio: [0.8,0.8],
  },
  wallpaper: {
    price: 20,
    description: "Vintage ornate wallpaper with repeating floral or geometric patterns in muted colors",
    tags: ["wall", "interior", "decorative", "pattern"],
    map:
      "/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_BaseColor.jpg",
    normalMap:
      "/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_Normal.jpg",
    roughnessMap:
      "/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_Roughness.jpg",
    aoMap:
      "/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_AO.jpg",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.8,0.8],
  },
  checkerBoardFabric: {
    price: 25,
    description: "Woven jute carpet with alternating light and dark squares in a classic checkerboard pattern",
    tags: ["fabric", "pattern", "floor", "carpet"],
    map: "/textures/checkerBoardFabric/CarpetJuteChecker001_COL_2K.jpg",
    normalMap: "/textures/checkerBoardFabric/CarpetJuteChecker001_NRM_2K.jpg",
    roughnessMap:
      "/textures/checkerBoardFabric/CarpetJuteChecker001_BUMP_2K.jpg",
    aoMap: "/textures/checkerBoardFabric/CarpetJuteChecker001_AO_2K.jpg",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  rock: {
    price: 30,
    description: "Rugged natural stone surface with varied coloration and craggy, uneven texture",
    tags: ["stone", "natural", "rough", "exterior"],
    map: "/textures/rock/Rock030_4K-PNG_Color.png",
    normalMap: "/textures/rock/Rock030_4K-PNG_NormalGL.png",
    roughnessMap: "/textures/rock/Rock030_4K-PNG_Roughness.png",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0.2,
    ratio: [0.75,0.75],
  },
  woodFloor: {
    price: 35,
    description: "Aged wooden floor planks with visible grain, wear marks, and natural color variations",
    tags: ["wood", "floor", "worn", "natural"],
    map: "/textures/woodFloorWonrn/WoodFlooringWorn002_COL_2K.jpg",
    normalMap: "/textures/woodFloorWonrn/WoodFlooringWorn002_NRM_2K.jpg",
    aoMap: "/textures/woodFloorWonrn/WoodFlooringWorn002_AO_2K.jpg",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0.2,
    ratio: [0.75,0.75],
  },
  woodPlanksDark: {
    price: 40,
    description: "Rich, dark-stained hickory wood planks with pronounced grain and butcher block pattern",
    tags: ["wood", "dark", "planks", "furniture"],
    map:
      "/textures/woodPlanksDark/WoodButcherBlockHickoryPlanksDark001_COL_2K.jpg",
    normalMap:
      "/textures/woodPlanksDark/WoodButcherBlockHickoryPlanksDark001_NRM_2K.jpg",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0.2,
    ratio: [0.75,0.75],
  },
  whiteAndGrayPaint: {
    price: 45,
    description: "W124 White & Gray paint, combining white and gray, creates a soft neutral tone. Suitable for various styles, it creates a minimalist and modern spatial feel.",
    tags: ["paint", "white", "gray", "interior"],
    map: "/textures/124White&gary paint/124White&gary paint_1k_basecolor.png",
    normalMap: "/textures/124White&gary paint/124White&gary paint_1k_normal.png",
    roughnessMap: "/textures/124White&gary paint/124White&gary paint_1k_roughness.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  brownGoldLuxurySandPaint: {
    price: 50,
    description: "Brown Gold Luxury Sand Paint, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["paint", "brown", "gold", "interior"],
    map: "/textures/Brown Gold Luxury Sand Paint/Brown Gold Luxury Sand Paint_1k_basecolor.png",
    normalMap: "/textures/Brown Gold Luxury Sand Paint/Brown Gold Luxury Sand Paint_1k_normal.png",
    roughnessMap: "/textures/Brown Gold Luxury Sand Paint/Brown Gold Luxury Sand Paint_1k_roughness.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  caravaggioPaint: {
    price: 55,
    description: "Caravaggio Paint, a rich and vibrant tone, creates a dramatic and authentic atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["paint", "caravaggio", "interior"],
    map: "/textures/Caravaggio paint/Caravaggio paint_basecolor.png",
    normalMap: "/textures/Caravaggio paint/Caravaggio paint_normal.png",
    roughnessMap: "/textures/Caravaggio paint/Caravaggio paint_roughness.png",
    aoMap: "/textures/Caravaggio paint/Caravaggio paint_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  dinoBeigeGlossyFloorAndWallTiles: {
    price: 60,
    description: "Dino Beige Glossy Floor and Wall Tiles, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["tile", "beige", "glossy", "interior"],
    map: "/textures/Dino Beige Glossy Floor and Wall Tiles/Dino Beige Glossy Floor and Wall Tiles_basecolor.png",
    normalMap: "/textures/Dino Beige Glossy Floor and Wall Tiles/Dino Beige Glossy Floor and Wall Tiles_normal.png",
    roughnessMap: "/textures/Dino Beige Glossy Floor and Wall Tiles/Dino Beige Glossy Floor and Wall Tiles_roughness.png",
    aoMap: "/textures/Dino Beige Glossy Floor and Wall Tiles/Dino Beige Glossy Floor and Wall Tiles_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  luminousWaterWhiteGrayPaint: {
    price: 65,
    description: "Luminous Water White Gray Paint, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["paint", "white", "gray", "interior"],
    map: "/textures/Luminous Water White Gray Paint/Luminous Water White Gray Paint_1k_basecolor.png",
    normalMap: "/textures/Luminous Water White Gray Paint/Luminous Water White Gray Paint_1k_normal.png",
    roughnessMap: "/textures/Luminous Water White Gray Paint/Luminous Water White Gray Paint_1k_roughness.png",
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  marmoPaint: {
    price: 70,
    description: "Marmo Paint, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["paint", "marmo", "interior"],
    map: "/textures/Marmo paint/Marmo paint_basecolor.png",
    normalMap: "/textures/Marmo paint/Marmo paint_normal.png",
    roughnessMap: "/textures/Marmo paint/Marmo paint_roughness.png",
    aoMap: "/textures/Marmo paint/Marmo paint_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  maybachTile: {
    price: 75,
    description: "Maybach Tile, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["tile", "maybach", "interior"],
    map: "/textures/Maybach Tile/Maybach Tile_basecolor.png",
    normalMap: "/textures/Maybach Tile/Maybach Tile_normal.png",
    roughnessMap: "/textures/Maybach Tile/Maybach Tile_roughness.png",
    aoMap: "/textures/Maybach Tile/Maybach Tile_DA918011_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  newPascoGrayGlossTiles: {
    price: 80,
    description: "New Pasco Gray Gloss Tiles, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["tile", "new pasco", "gray", "gloss", "interior"],
    map: "/textures/New Pasco Gray Gloss Tiles/New Pasco Gray Gloss Tiles_basecolor.png",
    normalMap: "/textures/New Pasco Gray Gloss Tiles/New Pasco Gray Gloss Tiles_normal.png",
    roughnessMap: "/textures/New Pasco Gray Gloss Tiles/New Pasco Gray Gloss Tiles_roughness.png",
    aoMap: "/textures/New Pasco Gray Gloss Tiles/New Pasco Gray Gloss Tiles_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  offWhiteTravertineFloorAndWallTiles: {
    price: 85,
    description: "Off-White Travertine Floor and Wall Tiles, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["tile", "off-white", "travertine", "interior"],
    map: "/textures/Off-White Travertine Floor and Wall Tiles/Off-White Travertine Floor and Wall Tiles_basecolor.png",
    normalMap: "/textures/Off-White Travertine Floor and Wall Tiles/Off-White Travertine Floor and Wall Tiles_normal.png",
    roughnessMap: "/textures/Off-White Travertine Floor and Wall Tiles/Off-White Travertine Floor and Wall Tiles_roughness.png",
    aoMap: "/textures/Off-White Travertine Floor and Wall Tiles/Off-White Travertine Floor and Wall Tiles_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  phantomStoneWarmLightGreyFloorAndWallTiles: {
    price: 90,
    description: "Phantom Stone Warm Light Grey Floor and Wall Tiles, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["tile", "phantom stone", "warm", "light", "grey", "interior"],
    map: "/textures/Phantom Stone Warm Light Grey Floor and Wall Tiles/Phantom Stone Warm Light Grey Floor and Wall Tiles_basecolor.png",
    normalMap: "/textures/Phantom Stone Warm Light Grey Floor and Wall Tiles/Phantom Stone Warm Light Grey Floor and Wall Tiles_normal.png",
    roughnessMap: "/textures/Phantom Stone Warm Light Grey Floor and Wall Tiles/Phantom Stone Warm Light Grey Floor and Wall Tiles_roughness.png",
    aoMap: "/textures/Phantom Stone Warm Light Grey Floor and Wall Tiles/Phantom Stone Warm Light Grey Floor and Wall Tiles_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  rockCaveConcretePaint: {
    price: 95,
    description: "Rock Cave Concrete Paint, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["paint", "rock", "cave", "concrete", "interior"],
    map: "/textures/Rock Cave Concrete Paint/Rock Cave Concrete Paint_1k_basecolor.png",
    normalMap: "/textures/Rock Cave Concrete Paint/Rock Cave Concrete Paint_1k_normal.png",
    roughnessMap: "/textures/Rock Cave Concrete Paint/Rock Cave Concrete Paint_1k_roughness.png",
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  ruststylePaint: {
    price: 100,
    description: "Rust Style Paint, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["paint", "rust", "interior"],
    map: "/textures/ruststyle paint_basecolor.png/ruststyle paint_basecolor.png",
    normalMap: "/textures/ruststyle paint_basecolor.png/ruststyle paint_normal.png",
    roughnessMap: "/textures/ruststyle paint_basecolor.png/ruststyle paint_roughness.png",
    aoMap: "/textures/ruststyle paint_basecolor.png/ruststyle paint_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  scotlandYellowGreenPaint: {
    price: 105,
    description: "Scotland Yellow Green Paint, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["paint", "scotland", "yellow", "green", "interior"],
    map: "/textures/Scotland Yellow Green Paint/Scotland yellow green paint_basecolor.png",
    normalMap: "/textures/Scotland Yellow Green Paint/Scotland yellow green paint_normal.png",
    roughnessMap: "/textures/Scotland Yellow Green Paint/Scotland yellow green paint_roughness.png",
    aoMap: "/textures/Scotland Yellow Green Paint/Scotland yellow green paint_ao.png",
    aoMapIntensity: 1,
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
  subtleLuxuryBlackGoldPaint: {
    price: 110,
    description: "Subtle Luxury Black Gold Paint, a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.",
    tags: ["paint", "subtle", "luxury", "black", "gold", "interior"],
    map: "/textures/Subtle Luxury Black Gold Paint/Subtle Luxury Black Gold Paint_1k_basecolor.png",
    normalMap: "/textures/Subtle Luxury Black Gold Paint/Subtle Luxury Black Gold Paint_1k_normal.png",
    roughnessMap: "/textures/Subtle Luxury Black Gold Paint/Subtle Luxury Black Gold Paint_1k_roughness.png",
    roughness: 0.7,
    metalness: 0.5,
    ratio: [0.75,0.75],
  },
};

// Create texture loader
const textureLoader = new THREE.TextureLoader();

// Load textures
const loadTexture = (path, ratio) => {
  if (!path) return null;
  const texture = textureLoader.load(path);
  texture.encoding = THREE.sRGBEncoding;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(ratio[0], ratio[1]);
  texture.needsUpdate = true;
  return texture;
};

// Modified texture loading system
export const useTextureLoader = () => {
  const textureBuffers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(materialTextures).map(([key, textureData]) => {
        const name = textureData.name ? textureData.name : key;
        const price = textureData.price ? textureData.price : 0;
        const description = textureData.description ? textureData.description : null;
        const tags = textureData.tags ? textureData.tags : null;
        const ratio = textureData.ratio ? textureData.ratio : [0.75, 0.75];
        const textures = {
          map: loadTexture(textureData.map, ratio),
          normalMap: textureData.normalMap ? loadTexture(textureData.normalMap, ratio) : null,
          roughnessMap: textureData.roughnessMap ? loadTexture(textureData.roughnessMap, ratio) : null,
          aoMap: textureData.aoMap ? loadTexture(textureData.aoMap, ratio) : null,
          bumpMap: textureData.bumpMap ? loadTexture(textureData.bumpMap, ratio) : null,
          // Store material properties
          aoMapIntensity: textureData.aoMapIntensity || null,
          roughness: textureData.roughness || null,
          metalness: textureData.metalness || null,
          ratio: textureData.ratio || [1, 1],
        };
        return [key, {name, price, description, tags, textures}];
      })
    );
  }, []); // Empty dependency array ensures this only runs once

  React.useEffect(() => {
    // 更新 Store 中的預載貼圖
    const { setPreloadedTextures } = useSelectionStore.getState();
    setPreloadedTextures(textureBuffers);
  }, []); // Empty dependency array ensures this only runs once

  return textureBuffers;
};

// 添加函數以獲取所有貼圖緩存
export const getTextureBuffers = () => {
  // 返回 textureBuffers 或其副本
  return { ...textureBuffers };
};

// 添加函數以初始化並獲取所有貼圖
export const initializeTextures = () => {
  // 如果 textureBuffers 已經有數據，直接返回
  if (Object.keys(textureBuffers).length > 0) {
    return textureBuffers;
  }
  
  // 否則，加載所有貼圖
  const textureLoader = new THREE.TextureLoader();
  
  // 遍歷 textureData 加載所有貼圖
  Object.entries(materialTextures).forEach(([key, data]) => {
    const name = data.name || key;
    const price = data.price || 0;
    const description = data.description || null;
    const tags = data.tags || null;
    const ratio = data.ratio || [0.75, 0.75];
    
    const textures = {
      map: loadTexture(data.map, ratio),
      normalMap: data.normalMap ? loadTexture(data.normalMap, ratio) : null,
      roughnessMap: data.roughnessMap ? loadTexture(data.roughnessMap, ratio) : null,
      aoMap: data.aoMap ? loadTexture(data.aoMap, ratio) : null,
      bumpMap: data.bumpMap ? loadTexture(data.bumpMap, ratio) : null,
      // Store material properties
      aoMapIntensity: data.aoMapIntensity || null,
      roughness: data.roughness || null,
      metalness: data.metalness || null,
    };
    
    textureBuffers[key] = { name, price, description, tags, textures };
  });
  
  // 更新 Store 中的預載貼圖
  const { setPreloadedTextures } = useSelectionStore.getState();
  setPreloadedTextures(textureBuffers);
  
  return textureBuffers;
};