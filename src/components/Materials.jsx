import * as THREE from "three";

// Create texture loader
const textureLoader = new THREE.TextureLoader();

// Load textures
const loadTexture = (path) => {
    const texture = textureLoader.load(path);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.75, 0.75);
    return texture;
};

// Define material textures
export const materialTextures = {
    brick: {
        baseColor: '/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_BaseColor.jpg',
        normalMap: '/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Normal.jpg',
        roughnessMap: '/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Roughness.jpg',
        aoMap: '/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_AO.jpg',
        bumpMap: '/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Bump.jpg',
        aoMapIntensity: 1,
        roughness: 1,
        metalness: 0,
    },
    concrete: {
        baseColor: '/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_BaseColor.jpg',
        normalMap: '/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_Normal.jpg',
        roughnessMap: '/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_Roughness.jpg',
        aoMap: '/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_AO.jpg',
        aoMapIntensity: 1,
        roughness: 0.9,
        metalness: 0,
    },
    dryWall: {
        baseColor: '/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_BaseColor.jpg',
        normalMap: '/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_Normal.jpg',
        roughnessMap: '/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_Roughness.jpg',
        aoMap: '/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_AO.jpg',
        aoMapIntensity: 1,
        roughness: 0.7,
        metalness: 0,
    },
    wallpaper: {
        baseColor: '/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_BaseColor.jpg',
        normalMap: '/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_Normal.jpg',
        roughnessMap: '/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_Roughness.jpg',
        aoMap: '/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_AO.jpg',
        aoMapIntensity: 1,
        roughness: 0.7,
        metalness: 0.5,
    },
};

// Create and configure materials dynamically from materialTextures
export const materials = Object.fromEntries(
    Object.entries(materialTextures).map(([key, textureData]) => {
        const material = new THREE.MeshStandardMaterial({
            map: loadTexture(textureData.baseColor),
            normalMap: textureData.normalMap ? loadTexture(textureData.normalMap) : null,
            roughnessMap: textureData.roughnessMap ? loadTexture(textureData.roughnessMap) : null,
            aoMap: textureData.aoMap ? loadTexture(textureData.aoMap) : null,
            bumpMap: textureData.bumpMap ? loadTexture(textureData.bumpMap) : null,
            aoMapIntensity: textureData.aoMapIntensity,
            roughness: textureData.roughness,
            metalness: textureData.metalness,
        });
        return [key, material];
    })
);
