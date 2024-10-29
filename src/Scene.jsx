import { useState } from 'react'
import { useGLTF, PivotControls } from '@react-three/drei'

export function Scene(props) {
  const { nodes }= useGLTF('/SmallRoomSimulation.glb')
  const [selected, setSelected] = useState(null);

  const handleSelect = (object) => {
    // 切換選取狀態，如果再次點擊已選中物件就取消選取
    setSelected(selected === object ? null : object);
  };

  return (
    <>
      <group {...props} dispose={null}>
          {Object.keys(nodes).map((key) => (
            <primitive
              key={key}
              object={nodes[key]}
              castShadow
              receiveShadow
              onPointerDown={(e) => {
                e.stopPropagation(); // 防止事件冒泡
                handleSelect(nodes[key]); // 設定選取的物件
              }}
            />
          ))}
      </group>

      {selected && (
        <PivotControls
          anchor={[0, 0, 0]}
          scale={75}
          lineWidth={2}
          fixed
          depthTest={false}
        >
          <primitive object={selected} />
        </PivotControls>
      )}
    </>
  )
}

useGLTF.preload('/SmallRoomSimulation.glb')