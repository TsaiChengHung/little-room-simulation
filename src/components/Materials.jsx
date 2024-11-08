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

// Create and configure materials
export const materials = {
    brick: new THREE.MeshPhysicalMaterial({
        map: loadTexture('/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_BaseColor.jpg'),
        normalMap: loadTexture('/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Normal.jpg'),
        roughnessMap: loadTexture('/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Roughness.jpg'),
        aoMap: loadTexture('/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_AO.jpg'),
        bumpMap: loadTexture('/textures/brick_wall_tkphcebi_1k/Brick_Wall_tkphcebi_1K_Bump.jpg'),
        aoMapIntensity: 1,
        roughness: 1,
        metalness: 0,
    }),
    concrete: new THREE.MeshStandardMaterial({
        map: loadTexture('/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_BaseColor.jpg'),
        normalMap: loadTexture('/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_Normal.jpg'),
        roughnessMap: loadTexture('/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_Roughness.jpg'),
        aoMap: loadTexture('/textures/concrete_wall_ubvjdgfew_1k/Concrete_Wall_ubvjdgfew_1K_AO.jpg'),
        aoMapIntensity: 1,
        roughness: 0.9,
        metalness: 0,
    }),
    dry: new THREE.MeshStandardMaterial({
        map: loadTexture('/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_BaseColor.jpg'),
        normalMap: loadTexture('/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_Normal.jpg'),
        roughnessMap: loadTexture('/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_Roughness.jpg'),
        aoMap: loadTexture('/textures/dry_wall_qjpmzsp0_1k/Dry_Wall_qjpmzsp0_1K_AO.jpg'),
        aoMapIntensity: 1,
        roughness: 0.7,
        metalness: 0,
    }),
    wallpapper: new THREE.MeshStandardMaterial({
        map: loadTexture('/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_BaseColor.jpg'),
        normalMap: loadTexture('/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_Normal.jpg'),
        roughnessMap: loadTexture('/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_Roughness.jpg'),
        aoMap: loadTexture('/textures/old_decorative_wallpaper_umridamn_1k/Old_Decorative_Wallpaper_umridamn_1K_AO.jpg'),
        aoMapIntensity: 1,
        roughness: 0.7,
        metalness: 0.5,
    })
};