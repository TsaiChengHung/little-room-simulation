'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import {
  EffectComposer,
  ToneMapping,
  Bloom,
} from "@react-three/postprocessing";
import Scene from "../components/Scenes/Scene";
import RoomSelectorUI from "../components/RoomSelector/RoomSelectorUI";
import InteractiveUI from "../components/UI/InteractiveUI";
import useSelectionStore from "../components/Store/Store";
import { preloadAllObjects } from "../components/Objects/ObjectsPreload";
import { initializeTextures } from "../components/AssetManage/Textures";
import CustomObjectControl from "../components/UI/CustomObjectControl";
import SunPosition from "../components/SFX/SunPosition";
import '../styles/App.css';

function Effects() {
  return (
    <EffectComposer autoClear={false} multisampling={4}>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.3}
        height={300}
        intensity={0.1}
      />
      <ToneMapping />
    </EffectComposer>
  );
}

export default function Page() {
  const [resourcesLoaded, setResourcesLoaded] = useState(false);
  const { clearSelectedObject, designMode, setResourcesLoaded: storeSetResourcesLoaded } = useSelectionStore();

  // Preload objects and textures when app starts
  useEffect(() => {
    const initializeResources = async () => {
      try {
        console.log("Starting resource initialization...");
        
        // Load models
        const models = await preloadAllObjects();
        console.log("Models loading completed:", Object.keys(models).length);
        
        // Load textures
        const textures = initializeTextures();
        console.log("Textures loading completed:", Object.keys(textures).length);
        
        // Mark resources as loaded
        setResourcesLoaded(true);
        storeSetResourcesLoaded(true);
        
        console.log("All resources initialized");
      } catch (error) {
        console.error("Error initializing resources:", error);
      }
    };
    
    initializeResources();
  }, []);

  const handleCanvasClick = () => {
    clearSelectedObject();
  };

  return (
    <>
      <div
        style={{ position: "fixed", width: "100%", height: "100%", zIndex: 0 }}
        className="app-container"
      >
        <Canvas
          shadows
          gl={{ antialias: true }}
          camera={{ position: [0, 1, 10], fov: 15, near: 1, far: 100 }}
          onPointerMissed={handleCanvasClick}
          className="canvas-container"
        >
          {designMode === "roomSimulation" && (
            <>
              <Environment
                preset={"sunset"}
                environmentIntensity={0.15}
              />

              <OrbitControls
                makeDefault
                target={[0, 1, 0]}
                maxPolarAngle={Math.PI * 0.5}
                enableZoom={true}
                enablePan={true}
                rotateSpeed={0.5}
                zoomSpeed={0.7}
                panSpeed={0.5}
                dampingFactor={0.05}
                enableDamping={true}
              />

              <Effects />

              <CustomObjectControl />

              <SunPosition />

              <Scene rotation={[0, Math.PI / 2, 0]} />
            </>
          )}

          {designMode === "roomDesign" && (
            <RoomSelectorUI />
          )}
        </Canvas>
      </div>

      <InteractiveUI />
    </>
  );
}
