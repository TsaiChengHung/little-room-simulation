import { TransformControls, PivotControls } from '@react-three/drei'
import { DebugMenu } from "./DebugMenu"

export const CustomTransformControls = ({ selectedMesh }) => {
  const { transformMode } = DebugMenu()

  return (
    <>
        {/* <TransformControls
          object={selectedMesh}
          mode={transformMode}
          size={1}
          showX={true}
          showY={true}
          showZ={true}
        /> */}

        <PivotControls>
          {selectedMesh}
        </PivotControls>
        
    </>
  )
}
