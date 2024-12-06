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
import { DebugMenu } from "./components/UI/DebugMenu";
import InteractiveUI from "./components/UI/InteractiveUI";
import useSelectionStore from "./components/Store/Store";
import { preloadAllObjects } from "./components/AssetManage/ObjectsPreload";
import { useEffect } from "react";
import CustomObjectControl from "./components/UI/CustomObjectControl";

export const App = () => {
  // Preload objects when app starts
  useEffect(() => {
    preloadAllObjects();
  }, []);

  const {
    sunPositionX,
    sunPositionY,
    sunPositionZ,
    showPerf,
    environmentControls,
  } = DebugMenu();
  
  const { clearSelectedObject, setCurrentScene, designMode } = useSelectionStore();

  const handleCanvasClick = () => {
    clearSelectedObject();
  };

  return (
    <>
      {designMode === "roomSimulation" && (
        <>
          <Canvas
            shadows
            gl={{ antialias: true }}
            camera={{ position: [0, 1, 10], fov: 15, near: 1, far: 100 }}
            onPointerMissed={handleCanvasClick}
          >

            {showPerf && <Perf position="top-left" />}
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
            <ambientLight intensity={0.5} />

            <directionalLight
              castShadow
              position={[sunPositionX, sunPositionY, sunPositionZ]}
              intensity={1.2}
              shadow-mapSize={[2048, 2048]}
            />

            <Environment
              preset={environmentControls.preset}
              background
              backgroundIntensity={0.5}
            />
            <Effects />
            <Scene rotation={[0, Math.PI / 2, 0]} />
            <CustomObjectControl />

          </Canvas>
        </>
      )}

      {designMode === "roomDesign" && (
        <>
          <RoomDesign />
        </>
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
