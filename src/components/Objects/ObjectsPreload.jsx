import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import useSelectionStore from "../Store/Store";

// Pre-defined object URLs - you can modify this list
const resources = [
    {
        name: 'Arm Chair',
        description: 'Comfortable modern armchair with padded cushions, perfect for reading corners',
        tags: ["chair", "arm", "furniture"],
        price: 399,
        modelFileGLB: '/objects/arm_chair_t.glb',
        thumbnailUrl: '/objects/thumbnails/arm_chair_t_thumbnail.png',
    },
    {
        name: 'Bookcase',
        description: 'Spacious wooden bookcase with multiple shelves for books and decorative items',
        tags: ["bookcase", "furniture"],
        price: 249,
        modelFileGLB: '/objects/bookcase_t.glb',
        thumbnailUrl: '/objects/thumbnails/bookcase_t_thumbnail.png',  
    },
    {
        name: 'Coffee Table',
        description: 'Elegant low coffee table with a smooth surface, ideal for living room spaces',
        tags: ["table", "coffee", "furniture"],
        price: 199,
        modelFileGLB: '/objects/coffee_table_t.glb',
        thumbnailUrl: '/objects/thumbnails/coffee_table_t_thumbnail.png',
    }, 
    {
        name:'double bed',
        description: 'Spacious double bed with headboard and comfortable mattress for two people',
        tags: ["bed", "double", "furniture"],
        price: 699,
        modelFileGLB: '/objects/double_bed.glb',
        thumbnailUrl: '/objects/thumbnails/double_bed_thumbnail.png',
    },
    {
        name:'double sofa',
        description: 'Cozy two-seater sofa with plush cushions, perfect for relaxing or entertaining',
        tags: ["sofa", "double", "furniture"],
        price: 799,
        modelFileGLB: '/objects/double_sofa.glb',
        thumbnailUrl: '/objects/thumbnails/double_sofa_thumbnail.png',
    },
    {
        name:'lamp',
        description: 'Stylish floor lamp with adjustable height, providing warm ambient lighting',
        tags: ["lamp", "light", "furniture"],
        price: 129,
        modelFileGLB: '/objects/lamp.glb',
        thumbnailUrl: '/objects/thumbnails/lamp_thumbnail.png',
    },
    {
        name:'plant',
        description: 'Lush indoor potted plant with vibrant green leaves, adds natural beauty to any room',
        tags: ["plant", "green", "nature"],
        price: 49,
        modelFileGLB: '/objects/plant.glb',
        thumbnailUrl: '/objects/thumbnails/plant_thumbnail.png',
    },
    {
        name:'shelf',
        description: 'Modern wall-mounted shelf unit with multiple compartments for storage and display',
        tags: ["shelf", "storage", "furniture"],
        price: 149,
        modelFileGLB: '/objects/shelf.glb',
        thumbnailUrl: '/objects/thumbnails/shelf_thumbnail.png',
    },
    {
        name: 'little cabinet',
        description: 'Compact storage cabinet with doors, perfect for small spaces and organization',
        tags: ["cabinet", "storage", "furniture"],
        price: 179,
        modelFileGLB: '/objects/little_cabinet.glb',
        thumbnailUrl: '/objects/thumbnails/little_cabinet_thumbnail.png',
    },
    {
        name:'little sofa',
        description: 'Compact single-seater sofa with comfortable cushioning, ideal for small apartments',
        tags: ["sofa", "little", "furniture"],
        price: 349,
        modelFileGLB: '/objects/little_sofa.glb',
        thumbnailUrl: '/objects/thumbnails/little_sofa_thumbnail.png',
    },
    {
        name:'paint',
        description: 'Framed wall art painting with abstract design, adds color and style to your walls',
        tags: ["paint", "art", "decoration"],
        price: 89,
        modelFileGLB: '/objects/paint.glb',
        thumbnailUrl: '/objects/thumbnails/paint_thumbnail.png',
    },
    {
        name:'table plant',
        description: 'Small decorative plant in a stylish pot, perfect for tables and desks',
        tags: ["plant", "table", "decoration"],
        price: 29,
        modelFileGLB: '/objects/table_plant.glb',
        thumbnailUrl: '/objects/thumbnails/table_plant_thumbnail.png',
    },
    {
        name:'tiny desk',
        description: 'Compact writing desk with clean lines, ideal for home office or study areas',
        tags: ["desk", "tiny", "furniture"],
        price: 169,
        modelFileGLB: '/objects/tiny_desk.glb',
        thumbnailUrl: '/objects/thumbnails/tiny_desk_thumbnail.png',
    },
    {
        name:'vase',
        description: 'Elegant ceramic vase with curved shape, perfect for displaying fresh or dried flowers',
        tags: ["vase", "decoration"],
        price: 39,
        modelFileGLB: '/objects/vase.glb',
        thumbnailUrl: '/objects/thumbnails/vase_thumbnail.png',
    },
    {
        name:'wood chair',
        description: 'Classic wooden dining chair with simple design, durable and versatile',
        tags: ["chair", "wood", "furniture"],
        price: 129,
        modelFileGLB: '/objects/wood_chair.glb',
        thumbnailUrl: '/objects/thumbnails/wood_chair_thumbnail.png',
    },
    {
        name:'tea cup set',
        description: 'Decorative tea set with cups and teapot, perfect for serving guests or display',
        tags: ["tea", "cup", "set"],
        price: 79,
        modelFileGLB: '/objects/tea_cup_set.glb',
        thumbnailUrl: '/objects/thumbnails/tea_cup_set_thumbnail.png',
    },
    {
        name:'bulvin leisure chair (blue)',
        description: 'Bulvin Leisure Chair (Blue), a warm and luxurious tone, creates a sophisticated and elegant atmosphere. Suitable for various styles, it creates a warm and inviting spatial feel.',
        tags: ["chair", "bulvin", "furniture"],
        price: 449,
        modelFileGLB: '/objects/Bulvin Leisure Chair (Blue)-t.glb',
        thumbnailUrl: '/objects/thumbnails/Bulvin Leisure Chair (Blue)_thumbnail.png',
    },
    {
        name:'garnier 4-foot main computer desk',
        description: 'Garnier 4-Foot Main Computer Desk, a modern and functional design that combines style with practicality. Features a spacious work surface and clean lines, perfect for home office or study spaces.',
        tags: ["desk", "computer", "furniture", "garnier"],
        price: 329,
        modelFileGLB: '/objects/Garnier 4-Foot Main Computer Desk.glb',
        thumbnailUrl: '/objects/thumbnails/Garnier 4-Foot Main Computer Desk_thumbnail.png',
    },
    {
        name:'hope natural stone modular coffee table set',
        description: 'Hope Natural Stone Modular Coffee Table Set, featuring elegant natural stone tops and modular design. Perfect for contemporary living spaces, combining functionality with luxurious materials.',
        tags: ["table", "coffee", "stone", "modular", "furniture"],
        price: 899,
        modelFileGLB: '/objects/Hope Natural Stone Modular Coffee Table Set.glb',
        thumbnailUrl: '/objects/thumbnails/Hope Natural Stone Modular Coffee Table Set_thumbnail.png',
    },
    {
        name:'leon 6-foot long cabinet',
        description: 'Leon 6-Foot Long Cabinet, a spacious and elegant storage solution with clean lines and modern design. Perfect for living rooms or dining areas, offering ample storage space with style.',
        tags: ["cabinet", "storage", "furniture", "leon"],
        price: 799,
        modelFileGLB: '/objects/Leon 6-Foot Long Cabinet.glb',
        thumbnailUrl: '/objects/thumbnails/Leon 6-Foot Long Cabinet_thumbnail.png',
    },
    {
        name:'little jia 2.1-foot walnut dual-purpose computer desk',
        description: 'Little Jia 2.1-Foot Walnut Dual-Purpose Computer Desk, a compact and versatile workstation with rich walnut finish. Perfect for small spaces, featuring dual functionality for both work and storage.',
        tags: ["desk", "computer", "walnut", "furniture", "little jia"],
        price: 249,
        modelFileGLB: '/objects/Little Jia 2.1-Foot Walnut Dual-Purpose Computer Desk.glb',
        thumbnailUrl: '/objects/thumbnails/Little Jia 2.1-Foot Walnut Dual-Purpose Computer Desk_thumbnail.png',
    },
    {
        name:'miro floor lamp',
        description: 'Miro Floor Lamp, a sleek and modern lighting fixture with adjustable height and direction. Features contemporary design elements and provides elegant ambient lighting for any room setting.',
        tags: ["lamp", "floor", "lighting", "furniture", "miro"],
        price: 179,
        modelFileGLB: '/objects/Miro Floor Lamp.glb',
        thumbnailUrl: '/objects/thumbnails/Miro Floor Lamp_thumbnail_thumbnail.jpg',
    },
    {
        name:'puffy sofa',
        description: 'Puffy Sofa, a luxuriously comfortable and modern sofa featuring plush, cloud-like cushions. Perfect for creating a cozy and inviting living space with its soft, rounded design and premium upholstery.',
        tags: ["sofa", "seating", "furniture", "puffy", "comfortable"],
        price: 1499,
        modelFileGLB: '/objects/Puffy Sofa-t.glb',
        thumbnailUrl: '/objects/thumbnails/Puffy Sofa_thumbnail.png',
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
