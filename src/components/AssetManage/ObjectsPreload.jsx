import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Pre-defined object URLs - you can modify this list
export const objectsUrl = {
    armChairs: "/objects/arm_chair_t.glb",
    bookcase: "/objects/bookcase_t.glb",
    coffeeTable: "/objects/coffee_table_t.glb",   
}

export const cachedObjects = {}

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');  
loader.setDRACOLoader(dracoLoader);

let isPreloading = false;

const loadModel = (url) => {
    return new Promise((resolve, reject) => {
        // If model is already cached, return it
        if (cachedObjects[url]) {
            resolve({ scene: cachedObjects[url] });
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

export async function preloadAllObjects(objectList = objectsUrl) {
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
            if (!Object.values(objectList).includes(key)) {
                delete cachedObjects[key];
            }
        });

        const loadPromises = Object.entries(objectList).map(async ([key, url]) => {
            if (!cachedObjects[key]) {
                const object = await loadModel(url);
                SetupSceneChildren(object.scene);
                cachedObjects[key] = object.scene;
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
    return !!cachedObjects[key];
}

// Function to get a cached object
export function getCachedObject(key) {
    return cachedObjects[key] || null;
}
