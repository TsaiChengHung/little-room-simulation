import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import useSelectionStore from "../Store/Store";

// Pre-defined object URLs - you can modify this list
const resources = [
    {
        name: 'Arm Chair',
        description: 'Description for Arm Chair',
        price: 100,
        modelFileGLB: '/objects/arm_chair_t.glb',
        thumbnailUrl: '/objects/thumbnails/arm_chair_t_thumbnail.png',
    },
    {
        name: 'Bookcase',
        description: 'Description for Bookcase',
        price: 200,
        modelFileGLB: '/objects/bookcase_t.glb',
        thumbnailUrl: '/objects/thumbnails/bookcase_t_thumbnail.png',  
    },
    {
        name: 'Coffee Table',
        description: 'Description for Coffee Table',
        price: 150,
        modelFileGLB: '/objects/coffee_table_t.glb',
        thumbnailUrl: '/objects/thumbnails/coffee_table_t_thumbnail.png',
    }, 
    {
        name:'double bed',
        description: 'Description for double bed',
        price: 300,
        modelFileGLB: '/objects/double_bed.glb',
        thumbnailUrl: '/objects/thumbnails/double_bed_thumbnail.png',
    },
    {
        name:'double sofa',
        description: 'Description for double sofa',
        price: 400,
        modelFileGLB: '/objects/double_sofa.glb',
        thumbnailUrl: '/objects/thumbnails/double_sofa_thumbnail.png',
    },
    {
        name:'lamp',
        description: 'Description for lamp',
        price: 50,
        modelFileGLB: '/objects/lamp.glb',
        thumbnailUrl: '/objects/thumbnails/lamp_thumbnail.png',
    },
    {
        name:'plant',
        description: 'Description for plant',
        price: 25,
        modelFileGLB: '/objects/plant.glb',
        thumbnailUrl: '/objects/thumbnails/plant_thumbnail.png',
    },
    {
        name:'shelf',
        description: 'Description for shelf',
        price: 75,
        modelFileGLB: '/objects/shelf.glb',
        thumbnailUrl: '/objects/thumbnails/shelf_thumbnail.png',
    },
    {
        name:'apple',
        description: 'Description for apple',
        price: 5,
        modelFileGLB: '/objects/apple.glb',
        thumbnailUrl: '/objects/thumbnails/apple_thumbnail.png',
    }, 
    {
        name: 'little cabinet',
        description: 'Description for little cabinet',
        price: 100,
        modelFileGLB: '/objects/little_cabinet.glb',
        thumbnailUrl: '/objects/thumbnails/little_cabinet_thumbnail.png',
    },
    {
        name:'little sofa',
        description: 'Description for little sofa',
        price: 200,
        modelFileGLB: '/objects/little_sofa.glb',
        thumbnailUrl: '/objects/thumbnails/little_sofa_thumbnail.png',
    },
    {
        name:'paint',
        description: 'Description for paint',
        price: 50,
        modelFileGLB: '/objects/paint.glb',
        thumbnailUrl: '/objects/thumbnails/paint_thumbnail.png',
    },
    {
        name:'table plant',
        description: 'Description for table plant',
        price: 25,
        modelFileGLB: '/objects/table_plant.glb',
        thumbnailUrl: '/objects/thumbnails/table_plant_thumbnail.png',
    },
    {
        name:'tiny desk',
        description: 'Description for tiny desk',
        price: 75,
        modelFileGLB: '/objects/tiny_desk.glb',
        thumbnailUrl: '/objects/thumbnails/tiny_desk_thumbnail.png',
    },
    {
        name:'vase',
        description: 'Description for vase',
        price: 5,
        modelFileGLB: '/objects/vase.glb',
        thumbnailUrl: '/objects/thumbnails/vase_thumbnail.png',
    },
    {
        name:'wood chair',
        description: 'Description for wood chair',
        price: 100,
        modelFileGLB: '/objects/wood_chair.glb',
        thumbnailUrl: '/objects/thumbnails/wood_chair_thumbnail.png',
    },
    {
        name:'tea cup set',
        description: 'Description for tea cup set',
        price: 200,
        modelFileGLB: '/objects/tea_cup_set.glb',
        thumbnailUrl: '/objects/thumbnails/tea_cup_set_thumbnail.png',
    },
]

// Cache structure will store both object and info
export const cachedObjects = {}
const { setPreloadedModels } = useSelectionStore.getState();

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);

let isPreloading = false;

const loadModel = (url) => {
    return new Promise((resolve, reject) => {
        // If model is already cached, return it
        const key = Object.keys(cachedObjects).find(k => cachedObjects[k]?.info?.modelFileGLB === url);
        if (key && cachedObjects[key]?.object) {
            resolve({ scene: cachedObjects[key].object });
            return;
        }

        loader.load(url, (gltf) => {
            resolve(gltf);
        }, undefined, (error) => {
            console.error(`Error loading model ${url}:`, error);
            reject(error);
        });
    });
}

// Function to set castShadow and receiveShadow for all mesh children
function SetupSceneChildren(scene) {
    scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

// Convert resources array to a map for preloading
const getObjectsUrlMap = () => {
    return resources.reduce((acc, resource) => {
        // Use name as the key, replacing spaces with underscores and converting to lowercase
        const key = resource.name.replace(/\s+/g, '_').toLowerCase();
        acc[key] = resource;
        return acc;
    }, {});
};

export async function preloadAllObjects(objectList = getObjectsUrlMap()) {
    if (isPreloading) {
        console.log("Already preloading objects, please wait...");
        return cachedObjects;
    }

    isPreloading = true;
    console.log("Starting to preload all objects...");

    try {
        // Load each object
        for (const [key, info] of Object.entries(objectList)) {
            if (!cachedObjects[key] || !cachedObjects[key].object) {
                console.log(`Loading object: ${key}`);
                try {
                    const gltf = await loadModel(info.modelFileGLB);
                    const object = gltf.scene;
                    
                    // Setup the object
                    SetupSceneChildren(object);
                    
                    // Cache the object
                    cachedObjects[key] = {
                        object,
                        info
                    };
                    
                    console.log(`Loaded object: ${key}`);
                } catch (error) {
                    console.error(`Failed to load object ${key}:`, error);
                }
            }
        }
        
        console.log("All objects preloaded successfully");
        
        // 更新 Store 中的預載模型
        const { setPreloadedModels } = useSelectionStore.getState();
        setPreloadedModels(cachedObjects);
        
        isPreloading = false;
        return cachedObjects;
    } catch (error) {
        console.error("Error during preloading objects:", error);
        isPreloading = false;
        
        // 即使出錯，也更新已加載的模型到 Store
        const { setPreloadedModels } = useSelectionStore.getState();
        setPreloadedModels(cachedObjects);
        
        return cachedObjects;
    }
}
