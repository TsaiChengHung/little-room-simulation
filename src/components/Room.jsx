import { useEffect, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import useSelectionStore from './Store';


const Room = (props) => {
  const { nodes } = useGLTF('/little_room_0.glb');
  const { setSelectedObject, selectedObject, roomMaterials, initializeRoomMaterials } = useSelectionStore();

  useEffect(()=>{
    initializeRoomMaterials(nodes)
  }, [nodes, initializeRoomMaterials])

  const handleClick = useCallback((e, key) => {
    e.stopPropagation();
    if (selectedObject === key) {
      setSelectedObject(null);
      console.log(`Deselected: ${key}`);
    } else {
      setSelectedObject(key);
      console.log(`Selected: ${key}`);
    }
  }, [selectedObject, setSelectedObject]);

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
