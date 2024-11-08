import * as THREE from "three"
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import useSelectionStore from './Store';
import { useTexture } from "@react-three/drei";

const Room = (props) => {
  const { nodes } = useGLTF('/little_room_0.glb');
  const { setSelectedObject, selectedObject, roomMaterials, initializeRoomMaterials } = useSelectionStore();

  useEffect(()=>{
    initializeRoomMaterials(nodes)
  }, [nodes, initializeRoomMaterials])

  const handleClick = (e, key) => {
    e.stopPropagation(); // 防止事件冒泡到 Canvas 上
    if (selectedObject === key) {
      setSelectedObject(null);
      console.log(`Deselected: ${key}`);
    } else {
      setSelectedObject(key); // 設置選取的物件名稱
      console.log(e.object.material)
      console.log(`Selected: ${key}`);
    }
  };

  return (
    <group {...props} dispose={null}>
      {Object.keys(nodes).map((key) => {
        const node = nodes[key];
        if (node.isMesh) {
          return (
            <mesh
              key={key}
              geometry={node.geometry}
              material={roomMaterials[key] || node.material}
              onClick={(e) => handleClick(e, key)}
              position={node.position}
              rotation={node.rotation}
              castShadow
              receiveShadow
            />
          );
        }
        return null;
      })}
    </group> )
};

export default Room;
useGLTF.preload('/little_room_0.glb');
