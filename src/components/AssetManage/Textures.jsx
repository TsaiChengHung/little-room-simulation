import * as THREE from "three";
import { useMemo } from "react";

// Define material textures
export const materialTextures = {
  brick: {
    baseColor:
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
    baseColor:
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
    baseColor:
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
    baseColor:
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
    baseColor: "/textures/checkerBoardFabric/CarpetJuteChecker001_COL_2K.jpg",
    normalMap: "/textures/checkerBoardFabric/CarpetJuteChecker001_NRM_2K.jpg",
    roughnessMap:
      "/textures/checkerBoardFabric/CarpetJuteChecker001_BUMP_2K.jpg",
    aoMap: "/textures/checkerBoardFabric/CarpetJuteChecker001_AO_2K.jpg",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0.5,
    ratio: [1,1],
  },
  rock: {
    baseColor: "/textures/rock/Rock030_4K-PNG_Color.png",
    normalMap: "/textures/rock/Rock030_4K-PNG_NormalGL.png",
    roughnessMap: "/textures/rock/Rock030_4K-PNG_Roughness.png",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0.2,
    ratio: [1,1],
  },
  woodFloor: {
    baseColor: "/textures/woodFloorWonrn/WoodFlooringWorn002_COL_2K.jpg",
    normalMap: "/textures/woodFloorWonrn/WoodFlooringWorn002_NRM_2K.jpg",
    aoMap: "/textures/woodFloorWonrn/WoodFlooringWorn002_AO_2K.jpg",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0.2,
    ratio: [1,1],
  },
  woodPlanksDark: {
    baseColor:
      "/textures/woodPlanksDark/WoodButcherBlockHickoryPlanksDark001_COL_2K.jpg",
    normalMap:
      "/textures/woodPlanksDark/WoodButcherBlockHickoryPlanksDark001_NRM_2K.jpg",
    aoMapIntensity: 1,
    roughness: 1,
    metalness: 0.2,
    ratio: [1,1],
  },
};

// Create texture loader
const textureLoader = new THREE.TextureLoader();

// Load textures
const loadTexture = (path, ratio) => {
  const texture = textureLoader.load(path);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(ratio[0], ratio[1]);
  return texture;
};

// Modified texture loading system
export const useTextureLoader = () => {
  const textureBuffers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(materialTextures).map(([key, textureData]) => {
        const ratio = textureData.ratio ? textureData.ratio : [0.75, 0.75];
        const textures = {
          baseColor: loadTexture(textureData.baseColor, ratio),
          normalMap: textureData.normalMap ? loadTexture(textureData.normalMap, ratio) : null,
          roughnessMap: textureData.roughnessMap ? loadTexture(textureData.roughnessMap, ratio) : null,
          aoMap: textureData.aoMap ? loadTexture(textureData.aoMap, ratio) : null,
          bumpMap: textureData.bumpMap ? loadTexture(textureData.bumpMap, ratio) : null,
          // Store material properties
          aoMapIntensity: textureData.aoMapIntensity || null,
          roughness: textureData.roughness || null,
          metalness: textureData.metalness || null,
        };
        return [key, textures];
      })
    );
  }, []); // Empty dependency array ensures this only runs once

  return textureBuffers;
};