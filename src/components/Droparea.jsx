import { useGLTF } from "@react-three/drei"

export default function Droparea(props)
{
    const { nodes } = useGLTF('./droparea.glb');

    nodes.Scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

    return (
    <primitive object={nodes.Scene} {...props}/>)
}

useGLTF.preload('./droparea.glb')