import { Perf } from "r3f-perf";
import { Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import {
  EffectComposer,
  TiltShift2,
  ToneMapping,
  Bloom,
  Noise
} from "@react-three/postprocessing";
import Scene from "./components/Scenes/Scene";
import RoomDesign from "./components/Scenes/RoomDesign";
import InteractiveUI from "./components/UI/InteractiveUI";
import useSelectionStore from "./components/Store/Store";
import { preloadAllObjects } from "./components/AssetManage/ObjectsPreload";
import { useEffect } from "react";
import CustomObjectControl from "./components/UI/CustomObjectControl";
import SunPosition from "./components/SFX/SunPosition";

export const App = () => {
  // Preload objects when app starts
  useEffect(() => {
    preloadAllObjects();
  }, []);

  
  const { clearSelectedObject, setCurrentScene, designMode } = useSelectionStore();

  const handleCanvasClick = () => {
    clearSelectedObject();
  };

  return (
    <>
      {designMode === "roomSimulation" && (
        <div style={{ position: 'fixed', width: '100%', height: '100%', zIndex: 0 }}>
          <Canvas
            shadows
            gl={{ antialias: true }}
            camera={{ position: [0, 1, 10], fov: 15, near: 1, far: 100 }}
            onPointerMissed={handleCanvasClick}
          >
            <Environment
              preset={"dawn"}
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
            <Scene rotation={[0, Math.PI / 2, 0]} />
            <CustomObjectControl />
            <SunPosition/>
          </Canvas>
        </div>
      )}

      {designMode === "roomDesign" && (
        <div style={{ position: 'fixed', width: '100%', height: '100%', zIndex: 0 }}>
          <RoomDesign />
        </div>
      )}

      <InteractiveUI />
    </>
  );
};

function Effects() {
  const { size } = useThree();
  return (
    <EffectComposer autoClear={false} multisampling={4}>
      <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={0.25} />
      <TiltShift2 samples={4} blur={0.08} />
      <Noise opacity={0.02} />
      <ToneMapping />
    </EffectComposer>
  );
}
