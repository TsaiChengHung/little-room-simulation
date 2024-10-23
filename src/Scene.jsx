import React, { useState } from 'react'
import { useGLTF, TransformControls, OrbitControls } from '@react-three/drei'
import { CustomTransformControls } from './components/CustomTransformControls'
import { RobinBird } from './components/RobinBird'

export function Scene(props) {
  const { nodes, materials } = useGLTF('/SmallRoomSimulation.glb')

  const [selectedMesh, setSelectedMesh] = useState(null) // 狀態來保存選擇的 mesh

  const handleMeshClick = (e) => {
    e.stopPropagation() // 防止事件冒泡
    setSelectedMesh(e.object) // 設置當前點擊的 mesh 為選中
  }

  return (
    <>
      <group {...props} dispose={null} onPointerMissed={() => setSelectedMesh(null)}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Floor_400x400.geometry}
          material={materials.MI_Taj_Mahal_Granite_wjmkahbl_2K}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Wall_400x200.geometry}
          material={materials.MI_Stucco_Wall_ukmobfecw_2K}
          position={[0, 0, 3.9]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Wall_Window_400x400.geometry}
          material={materials.MI_Stucco_Wall_ukmobfecw_2K}
          position={[3.9, 0, 4]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.S_Wooden_Table_viejdi1_lod3_Var1.geometry}
          material={materials.MI_Wooden_Table_viejdi1_2K}
          position={[1.7, 0, 1.8]}
          onClick={handleMeshClick}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.S_Wooden_Chair_ukmlcaoaw_lod3_Var1.geometry}
          material={materials.MI_Wooden_Chair_ukmlcaoaw_2K}
          position={[1.8, 0, 0.8]}
          rotation={[-Math.PI, -1.396, -Math.PI]}
          onClick={handleMeshClick}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.S_Wooden_Chair_ukmlcaoaw_lod3_Var2.geometry}
          material={materials.MI_Wooden_Chair_ukmlcaoaw_2K}
          position={[1.8, 0, 2.8]}
          rotation={[Math.PI, Math.PI / 3, -Math.PI]}
          onClick={handleMeshClick}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.S_Wooden_Bookshelf_vmhndfu_lod3_Var1.geometry}
          material={materials.MI_Wooden_Bookshelf_vmhndfu_2K}
          position={[0.7, 0.9, 3.8]}
          rotation={[-Math.PI, 0, -Math.PI]}
          onClick={handleMeshClick}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.S_Wooden_Bookshelf_vmhndfu_lod3_Var2.geometry}
          material={materials.MI_Wooden_Bookshelf_vmhndfu_2K}
          position={[1.9, 0.9, 3.8]}
          rotation={[-Math.PI, 0, -Math.PI]}
          onClick={handleMeshClick}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.S_Wooden_Bookshelf_vmhndfu_lod3_Var3.geometry}
          material={materials.MI_Wooden_Bookshelf_vmhndfu_2K}
          position={[3.1, 0.9, 3.8]}
          rotation={[-Math.PI, 0, -Math.PI]}
          onClick={handleMeshClick}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.S_Cactus_Pot_uenkeewfa_lod3_Var1.geometry}
          material={materials.MI_Cactus_Pot_uenkeewfa_2K}
          position={[1.7, 1.4, 3.7]}
          rotation={[0, -0.698, 0]}
          onClick={handleMeshClick}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.S_Female_Bust_Statuette_ugsicgxva_lod3_Var1.geometry}
          material={materials.MI_Female_Bust_Statuette_ugsicgxva_2K}
          position={[3.5, 0, 0.5]}
          rotation={[0, -1.396, 0]}
          scale={5.25}
          onClick={handleMeshClick}
        />
        <RobinBird position={[0.2, 2, 3.85]} rotation={[0, Math.PI *1.2 , 0]}/>
      </group>
      {selectedMesh && (
        console.log('Mesh clicked:', {selectedMesh}),
        <CustomTransformControls selectedMesh={selectedMesh} />
      )}

    </>
  )
}

useGLTF.preload('/SmallRoomSimulation.glb')
