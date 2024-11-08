import { Perf } from "r3f-perf"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { EffectComposer, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { Scene } from "./Scene"
import { DebugMenu } from "./components/DebugMenu"
import InteractiveUI from "./components/InteractiveUI"
import useSelectionStore from "./components/Store"

export const App = () => {

  const { sunPositionX, sunPositionY, sunPositionZ, showPerf, environmentControls } = DebugMenu()
  const { clearSelectedObject, selectedObject } = useSelectionStore();
  
  const handleCanvasClick = () => {
    clearSelectedObject();
  }

  return (
    <>
  <Canvas shadows  gl={{ antialias: true }} camera={{ position: [0,0,10], fov: 15, near: 1, far: 100 }} onPointerMissed={handleCanvasClick} >
    {showPerf && <Perf position="top-left" />}
    <OrbitControls makeDefault />
    <ambientLight intensity={0.5} />
    
    <directionalLight
      castShadow
      position={[sunPositionX, sunPositionY, sunPositionZ]}
      intensity={1.2}
      shadow-mapSize={[2048, 2048]}
    />

    <Environment preset={environmentControls.preset} background backgroundIntensity={0.5} />
    <Effects />

    <Scene position={[-2,-1,2]} rotation={[0, Math.PI / 2, 0]} />
      

  </Canvas>
  <InteractiveUI/>
  </>

  )
}

function Effects() {
  const { size } = useThree()
  return (
    <EffectComposer autoClear={false} multisampling={4} >
      <TiltShift2 samples={5} blur={0.05} />
      <ToneMapping /> 
      
    </EffectComposer>
  )
}
