import React, { useState } from 'react';
import { useGLTF, PivotControls } from '@react-three/drei';
import Room from './components/Room';

function CustomObject({ object, isVisible, onClick, ...props }) {
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
          e.stopPropagation(); // 防止事件冒泡
          onClick(); // 點擊後更新選擇的物件
        }}
      />
    </PivotControls>
  );
}

export function Scene(props) {
  const { nodes } = useGLTF('/default_deco_0.glb');
  const [selectedObject, setSelectedObject] = useState(null);

  return (
    <>

      <group {...props} dispose={null} onPointerMissed={()=>{setSelectedObject(null)}}>
        {Object.keys(nodes).map((key) => (
          <CustomObject
            key={key}
            object={nodes[key]}
            isVisible={key === selectedObject} // 當前物件被選中時顯示 PivotControls
            onClick={() => setSelectedObject(key)} // 更新選中的物件
          />
        ))}
        <Room/>
      </group>
    </>
  );
}

useGLTF.preload('/default_deco_0.glb');
