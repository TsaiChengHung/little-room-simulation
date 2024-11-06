import { Perf } from "r3f-perf"
import { Canvas, useThree } from "@react-three/fiber"
import { Sky, OrbitControls, Environment } from "@react-three/drei"
import { EffectComposer, Outline, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { Scene } from "./Scene"
import { DebugMenu } from "./components/DebugMenu"
import InteractiveUI from "./components/InteractiveUI"
import useSelectionStore from "./components/Store"

export const App = () => {

  const { sunPositionX, sunPositionY, sunPositionZ, showPerf } = DebugMenu()
  const { clearSelectedObject, selectedObject } = useSelectionStore();

  const handleCanvasClick = () => {
    clearSelectedObject();
  }

  return (
    <>
  <Canvas shadows flat dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0,0,10], fov: 25, near: 1, far: 100 }} onPointerMissed={handleCanvasClick} >
    {showPerf && <Perf position="top-left" />}
    <OrbitControls makeDefault />
    <ambientLight intensity={0.2} />
    
    <Sky
      distance={450000}
      sunPosition={[sunPositionX, sunPositionY, sunPositionZ]}
      inclination={0}
      azimuth={0.25}
    />

    <directionalLight
      castShadow
      position={[sunPositionX, sunPositionY, sunPositionZ]}
      intensity={1.2}
      shadow-mapSize={[2048, 2048]}
    />

    <Effects />
    <Environment preset="dawn" />
    

    <Scene position={[-2,-1,2]} rotation={[0, Math.PI / 2, 0]} />
      

  </Canvas>
  <InteractiveUI/>
  </>

  )
}

function Effects() {
  const { size } = useThree()
  return (
    <EffectComposer autoClear={false} multisampling={4}>
      <Outline visibleEdgeColor="white" hiddenEdgeColor="white" blur width={size.width * 1.25} edgeStrength={10} />
      <TiltShift2 samples={5} blur={0.05} />
      <ToneMapping />
    </EffectComposer>
  )
}
