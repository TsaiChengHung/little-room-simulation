import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Pre-defined object URLs - you can modify this list
const resources = [
    {
        name: 'Arm Chair',
        description: 'Description for Arm Chair',
        price: 100,
        modelFileGLB: '/objects/arm_chair_t.glb',
        thumbnailUrl: '/thumbnails/arm_chair_thumb.png',
    },
    {
        name: 'Bookcase',
        description: 'Description for Bookcase',
        price: 200,
        modelFileGLB: '/objects/bookcase_t.glb',
        thumbnailUrl: '/thumbnails/bookcase_thumb.png',
    },
    {
        name: 'Coffee Table',
        description: 'Description for Coffee Table',
        price: 150,
        modelFileGLB: '/objects/coffee_table_t.glb',
        thumbnailUrl: '/thumbnails/coffee_table_thumb.png',
    }, 
]

// Cache structure will store both object and info
export const cachedObjects = {}

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
    // Prevent multiple preloading attempts
    if (isPreloading) {
        console.log("Already preloading objects...");
        return;
    }

    isPreloading = true;
    console.log("Starting to preload objects");

    try {
        // Clear cache for objects not in the new list
        Object.keys(cachedObjects).forEach(key => {
            if (!objectList[key]) {
                delete cachedObjects[key];
            }
        });

        const loadPromises = Object.entries(objectList).map(async ([key, resourceInfo]) => {
            if (!cachedObjects[key]?.object) {
                const object = await loadModel(resourceInfo.modelFileGLB);
                SetupSceneChildren(object.scene);
                cachedObjects[key] = {
                    object: object.scene,
                    info: resourceInfo
                };
                console.log(`Loaded object: ${key}`, object);
            }
        });

        await Promise.all(loadPromises);
        console.log("All objects preloaded successfully:", cachedObjects);
    } catch (error) {
        console.error("Error during preloading:", error);
    } finally {
        isPreloading = false;
    }
}

// Function to check if an object is cached
export function isObjectCached(key) {
    return !!cachedObjects[key]?.object;
}

// Function to get a cached object
export function getCachedObject(key) {
    return cachedObjects[key]?.object || null;
}

// Function to get object info
export function getCachedObjectInfo(key) {
    return cachedObjects[key]?.info || null;
}

// Helper function to get resource data by name
export function getResourceByName(name) {
    const key = name.replace(/\s+/g, '_').toLowerCase();
    return resources.find(resource => resource.name.replace(/\s+/g, '_').toLowerCase() === key);
}
