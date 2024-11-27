import { useGLTF, PivotControls } from '@react-three/drei';

export default function CustomObject({ object, isVisible, onClick, props }) {
  return (
    <PivotControls
      visible={isVisible}
      enabled={isVisible}
      anchor={[0, 0, 0]}
      scale={0.5}
      autoTransform={true}
      disableScaling={true}
      annotations={true}
      depthTest={false}
    >
      <primitive
        {...props}
        object={object}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      />
    </PivotControls>
  );
}