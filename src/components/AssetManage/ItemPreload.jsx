import { GLTFLoader } from "three/examples/jsm/Addons.js";

const itemUrls = {
    armChairs: "/items/arm_chair.glb",
    decoFan: "/items/art_deco_fan_revised.glb",
    bookcase: "/items/bookcase.glb",
    coffeeTable: "/items/coffee_table.glb",
}

export const chachedItems = {}

const loader = new GLTFLoader();
let isPreloading = false;

const loadModel = (url) => {
    return new Promise((resolve, reject) => {
        // If model is already cached, return it
        if (chachedItems[url]) {
            resolve({ scene: chachedItems[url] });
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

export async function preloadAllItems() {
    // Prevent multiple preloading attempts
    if (isPreloading) {
        console.log("Already preloading items...");
        return;
    }

    isPreloading = true;
    console.log("Starting to preload items");

    try {
        const loadPromises = Object.entries(itemUrls).map(async ([key, url]) => {
            if (!chachedItems[key]) {
                const item = await loadModel(url);
                chachedItems[key] = item.scene;
                console.log(`Loaded item: ${key}`);
            }
        });

        await Promise.all(loadPromises);
        console.log("All items preloaded successfully:", chachedItems);
    } catch (error) {
        console.error("Error during preloading:", error);
    } finally {
        isPreloading = false;
    }
}
