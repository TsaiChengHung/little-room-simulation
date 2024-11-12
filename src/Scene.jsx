import { useGLTF, PivotControls } from '@react-three/drei';
import { useEffect } from 'react';
import Room from './components/Room';
import useSelectionStore from './components/Store';
import { RobinBird } from './items/RobinBird'

export function Scene(props) {
  const { nodes } = useGLTF('/default_deco_0.glb');
  const { setSelectedObject, selectedObject, selectedObjectType, initializeObjects, objects } = useSelectionStore();

  // Initialize the objects in the store
  useEffect(() => {
    initializeObjects(nodes);
  }, [nodes, initializeObjects]);

  return (
    <>
      <group {...props} dispose={null} onPointerMissed={() => setSelectedObject(null, null)}>
        {Object.keys(objects).map((key) => (
          <PivotControls
            key={key}
            visible={selectedObject === key && selectedObjectType === 'customObject'}
            enabled={selectedObject === key && selectedObjectType === 'customObject'}
            anchor={[0, 0, 0]}
            scale={0.5}
            autoTransform={true}
            disableScaling={true}
            annotations={true}
            depthTest={false}
          >
            <mesh
              geometry={objects[key].geometry}
              material={objects[key].material}
              position={objects[key].position}
              rotation={objects[key].rotation}
              scale={objects[key].scale}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                setSelectedObject(key, 'customObject'); // 更新選中的物件
              }}
            />
          </PivotControls>
        ))}
        <Room />
        <RobinBird position={[3.9,0.7,2]} rotation={[0,-0.4,0]} />
      </group>
    </>
  );
}
