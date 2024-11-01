import { useGLTF } from "@react-three/drei"

export default function Room(...props)
{
    const { nodes } = useGLTF('/little_room_0.glb');

    nodes.Scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

    return (
    <primitive object={nodes.Scene} {...props}/>)
}

useGLTF.preload('/little_room_0.glb')