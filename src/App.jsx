import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import {
  EffectComposer,
  TiltShift2,
  ToneMapping,
  Bloom,
  Noise,
} from "@react-three/postprocessing";
import Scene from "./components/Scenes/Scene";
import RoomSelectorUI from "./components/RoomSelector/RoomSelectorUI";
import InteractiveUI from "./components/UI/InteractiveUI";
import useSelectionStore from "./components/Store/Store";
import { preloadAllObjects } from "./components/Objects/ObjectsPreload";
import { initializeTextures } from "./components/AssetManage/Textures";
import CustomObjectControl from "./components/UI/CustomObjectControl";
import SunPosition from "./components/SFX/SunPosition";
import AIAssistant from './components/AI/AIAssistant';
import Room from './components/RoomSelector/RoomGenerator';
import './App.css';

export function App() {
  const [showAI, setShowAI] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);
  const { clearSelectedObject, setCurrentScene, designMode, isAIGenerating, setResourcesLoaded: storeSetResourcesLoaded } = useSelectionStore();

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
  }, [storeSetResourcesLoaded]);

  const handleCanvasClick = () => {
    clearSelectedObject();
  };

  return (
    <>
      <div
        style={{ position: "fixed", width: "100%", height: "100%", zIndex: 0 }}
        className="app-container"
      >
        {designMode === "roomSimulation" && (
          <Canvas
            shadows
            gl={{ antialias: true }}
            camera={{ position: [0, 1, 10], fov: 15, near: 1, far: 100 }}
            onPointerMissed={handleCanvasClick}
            className="canvas-container"
          >
            <Environment
              preset={"studio"}
              background={true}
              environmentIntensity={0.3}
            />

            {/* <Perf position="top-right" /> */}
            <OrbitControls
              makeDefault
              target={[0, 1, 0]}
              maxPolarAngle={Math.PI * 0.5} // Maximum ~135 degrees from top
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

            {/* Loading indicator during AI generation */}
            {isAIGenerating && (
              <Html center>
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>AI is generating design...</p>
                </div>
              </Html>
            )}
          </Canvas>
        )}

        {designMode === "roomDesign" && (
          <Canvas
            shadows
            gl={{ antialias: true }}
            camera={{ position: [0, 1, 10], fov: 15, near: 1, far: 100 }}
            onPointerMissed={handleCanvasClick}
            className="canvas-container"
          >
            <RoomSelectorUI />
            <OrbitControls />
            
            {/* Loading indicator during AI generation */}
            {isAIGenerating && (
              <Html center>
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>AI is generating design...</p>
                </div>
              </Html>
            )}
          </Canvas>
        )}
        
        <div className="controls-container">
          <button 
            className="ai-toggle-button"
            onClick={() => setShowAI(!showAI)}
          >
            {showAI ? 'Hide AI Assistant' : 'Show AI Assistant'}
          </button>
          {/* Other control panels */}
        </div>
        
        {showAI && (
          <div className="ai-assistant-container">
            <AIAssistant />
          </div>
        )}
      </div>

      <InteractiveUI />
    </>
  );
}

function Effects() {
  return (
    <EffectComposer autoClear={false} multisampling={4}>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        height={300}
        intensity={0.25}
      />
      <TiltShift2 samples={4} blur={0.08} />
      <Noise opacity={0.02} />
      <ToneMapping />
    </EffectComposer>
  );
}

export default App;
