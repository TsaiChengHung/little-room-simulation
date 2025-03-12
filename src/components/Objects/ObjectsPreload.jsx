import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import useSelectionStore from "../Store/Store";

// Pre-defined object URLs - you can modify this list
const resources = [
    {
        name: 'Arm Chair',
        description: 'Comfortable modern armchair with padded cushions, perfect for reading corners',
        tags: ["chair", "arm", "furniture"],
        price: 100,
        modelFileGLB: '/objects/arm_chair_t.glb',
        thumbnailUrl: '/objects/thumbnails/arm_chair_t_thumbnail.png',
    },
    {
        name: 'Bookcase',
        description: 'Spacious wooden bookcase with multiple shelves for books and decorative items',
        tags: ["bookcase", "furniture"],
        price: 200,
        modelFileGLB: '/objects/bookcase_t.glb',
        thumbnailUrl: '/objects/thumbnails/bookcase_t_thumbnail.png',  
    },
    {
        name: 'Coffee Table',
        description: 'Elegant low coffee table with a smooth surface, ideal for living room spaces',
        tags: ["table", "coffee", "furniture"],
        price: 150,
        modelFileGLB: '/objects/coffee_table_t.glb',
        thumbnailUrl: '/objects/thumbnails/coffee_table_t_thumbnail.png',
    }, 
    {
        name:'double bed',
        description: 'Spacious double bed with headboard and comfortable mattress for two people',
        tags: ["bed", "double", "furniture"],
        price: 300,
        modelFileGLB: '/objects/double_bed.glb',
        thumbnailUrl: '/objects/thumbnails/double_bed_thumbnail.png',
    },
    {
        name:'double sofa',
        description: 'Cozy two-seater sofa with plush cushions, perfect for relaxing or entertaining',
        tags: ["sofa", "double", "furniture"],
        price: 400,
        modelFileGLB: '/objects/double_sofa.glb',
        thumbnailUrl: '/objects/thumbnails/double_sofa_thumbnail.png',
    },
    {
        name:'lamp',
        description: 'Stylish floor lamp with adjustable height, providing warm ambient lighting',
        tags: ["lamp", "light", "furniture"],
        price: 50,
        modelFileGLB: '/objects/lamp.glb',
        thumbnailUrl: '/objects/thumbnails/lamp_thumbnail.png',
    },
    {
        name:'plant',
        description: 'Lush indoor potted plant with vibrant green leaves, adds natural beauty to any room',
        tags: ["plant", "green", "nature"],
        price: 25,
        modelFileGLB: '/objects/plant.glb',
        thumbnailUrl: '/objects/thumbnails/plant_thumbnail.png',
    },
    {
        name:'shelf',
        description: 'Modern wall-mounted shelf unit with multiple compartments for storage and display',
        tags: ["shelf", "storage", "furniture"],
        price: 75,
        modelFileGLB: '/objects/shelf.glb',
        thumbnailUrl: '/objects/thumbnails/shelf_thumbnail.png',
    },
    {
        name: 'little cabinet',
        description: 'Compact storage cabinet with doors, perfect for small spaces and organization',
        tags: ["cabinet", "storage", "furniture"],
        price: 100,
        modelFileGLB: '/objects/little_cabinet.glb',
        thumbnailUrl: '/objects/thumbnails/little_cabinet_thumbnail.png',
    },
    {
        name:'little sofa',
        description: 'Compact single-seater sofa with comfortable cushioning, ideal for small apartments',
        tags: ["sofa", "little", "furniture"],
        price: 200,
        modelFileGLB: '/objects/little_sofa.glb',
        thumbnailUrl: '/objects/thumbnails/little_sofa_thumbnail.png',
    },
    {
        name:'paint',
        description: 'Framed wall art painting with abstract design, adds color and style to your walls',
        tags: ["paint", "art", "decoration"],
        price: 50,
        modelFileGLB: '/objects/paint.glb',
        thumbnailUrl: '/objects/thumbnails/paint_thumbnail.png',
    },
    {
        name:'table plant',
        description: 'Small decorative plant in a stylish pot, perfect for tables and desks',
        tags: ["plant", "table", "decoration"],
        price: 25,
        modelFileGLB: '/objects/table_plant.glb',
        thumbnailUrl: '/objects/thumbnails/table_plant_thumbnail.png',
    },
    {
        name:'tiny desk',
        description: 'Compact writing desk with clean lines, ideal for home office or study areas',
        tags: ["desk", "tiny", "furniture"],
        price: 75,
        modelFileGLB: '/objects/tiny_desk.glb',
        thumbnailUrl: '/objects/thumbnails/tiny_desk_thumbnail.png',
    },
    {
        name:'vase',
        description: 'Elegant ceramic vase with curved shape, perfect for displaying fresh or dried flowers',
        tags: ["vase", "decoration"],
        price: 5,
        modelFileGLB: '/objects/vase.glb',
        thumbnailUrl: '/objects/thumbnails/vase_thumbnail.png',
    },
    {
        name:'wood chair',
        description: 'Classic wooden dining chair with simple design, durable and versatile',
        tags: ["chair", "wood", "furniture"],
        price: 100,
        modelFileGLB: '/objects/wood_chair.glb',
        thumbnailUrl: '/objects/thumbnails/wood_chair_thumbnail.png',
    },
    {
        name:'tea cup set',
        description: 'Decorative tea set with cups and teapot, perfect for serving guests or display',
        tags: ["tea", "cup", "set"],
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
