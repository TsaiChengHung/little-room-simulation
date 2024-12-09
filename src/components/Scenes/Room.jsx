import { useEffect, useCallback, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { MeshStandardMaterial, Clock } from "three";
import useSelectionStore from '../Store/Store';

const Room = (props) => {
  const { nodes } = useGLTF('/cozy_home_structure.glb');
  const { setSelectedObject, selectedObject, roomMaterials, initializeRoomMaterials, operationMode, selectedObjectType } = useSelectionStore();
  const clock = useMemo(() => new Clock(), []);

  useEffect(() => {
    initializeRoomMaterials(nodes);
  }, [nodes, initializeRoomMaterials]);

  // 使用 useMemo 來創建一個特殊的選取材質，並讓其緩慢閃爍
  const selectedMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({ color: "yellow", emissive: "yellow", emissiveIntensity: 0.5 });
    const updateEmissiveIntensity = () => {
      const time = clock.getElapsedTime();
      material.emissiveIntensity = 0.5 + 0.5 * Math.sin(time * 2); // 緩慢閃爍效果
      requestAnimationFrame(updateEmissiveIntensity);
    };
    updateEmissiveIntensity();
    return material;
  }, [clock]);

  const handleClick = useCallback((e, key) => {
    e.stopPropagation(); // 防止事件冒泡到父級 group
    if (selectedObject === key && selectedObjectType === 'room') {
      setSelectedObject(null, null);
    } else {
      setSelectedObject(key, 'room');
    }
  }, [selectedObject, setSelectedObject, selectedObjectType]);

  return (
    <group {...props} dispose={null}>
      {Object.keys(nodes).map((key) => {
        const node = nodes[key];
        if (node.isMesh) {
          return (
            <mesh
              key={key}
              geometry={node.geometry}
              material={operationMode === "paint" && selectedObject === key && selectedObjectType === 'room' ? selectedMaterial : (roomMaterials[key] || node.material)}
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
    </group>
  );
};

export default Room;

useGLTF.preload('/cozy_home_structure.glb');
