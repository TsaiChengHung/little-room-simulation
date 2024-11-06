// src/components/Room.jsx
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import useSelectionStore from './Store';

const Room = (props) => {
  const { nodes } = useGLTF('/little_room_0.glb');
  const { setSelectedObject, selectedObject, roomMaterials } = useSelectionStore();

  useEffect(()=>{
    Object.keys(nodes).map((key) => {
      const node = nodes[key]
      roomMaterials[key] = node.material
    })
  }, [nodes])

  const handleClick = (e, key) => {
    e.stopPropagation(); // 防止事件冒泡到 Canvas 上
    if (selectedObject === key) {
      setSelectedObject(null);
      setMaterial(roomMaterials[key]); // 恢復原始材質
      console.log(`Deselected: ${key}`);
    } else {
      setSelectedObject(key); // 設置選取的物件名稱
      console.log(`Selected: ${key}`);
    }
  };

  const renderMeshes = () => {
    return Object.keys(nodes).map((key) => {
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
          />
        );
      }
      return null;
    });
  };

  return <group {...props} dispose={null}>{renderMeshes()}</group>;
};

export default Room;
useGLTF.preload('/little_room_0.glb');
