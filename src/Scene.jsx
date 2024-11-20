import { PivotControls, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import Room from "./components/Room";
import useSelectionStore from "./components/Store";
import { RobinBird } from "./items/RobinBird";

export function Scene(props) {
  const {
    setSelectedObject,
    selectedObject,
    selectedObjectType,
    AddToObjects,
    objects,
  } = useSelectionStore();

  const { nodes } = useGLTF("/cozy_home_items_transformed.glb");

  useEffect(() => {
    Object.keys(nodes).forEach((key) => {
      const node = nodes[key];
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.parent) {
          node.position.x += node.parent.position.x;
          node.position.y += node.parent.position.y;
          node.position.z += node.parent.position.z;
          node.rotation.x += node.parent.rotation.x;
          node.rotation.y += node.parent.rotation.y;
          node.rotation.z += node.parent.rotation.z;
        }
        AddToObjects(key, node);
      }
    });
  }, [nodes, AddToObjects]);

  return (
    <>
      <group
        {...props}
        dispose={null}
        onPointerMissed={() => setSelectedObject(null, null)}
      >
        {Object.keys(objects).map((key, index) => {
          const object = objects[key]

          return (
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
              <primitive object={object} onClick={(e) => {
                console.log(e.object.name)
                if (e.object.name === "CozyRoom"){
                  return
                }
                e.stopPropagation(); // 阻止事件冒泡
                setSelectedObject(key, 'customObject'); // 更新選中的物件
              }} />
            </PivotControls>
          )
        })}

        <Room />
        <RobinBird position={[-0.2, 3, 0.2]} rotation={[0, -0.4, 0]} />
      </group>
    </>
  );
}
