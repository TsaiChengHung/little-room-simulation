import * as THREE from "three";
import { useRef, useState } from "react";
import {
  OrbitControls,
  useCursor,
  MeshPortalMaterial,
  Text,
  Environment,
} from "@react-three/drei";
import { geometry } from "maath";
import { extend } from "@react-three/fiber";
import Room from "./RoomGenerator";
import RoomPointsTemplate from "./RoomAttributes";
import useSelectionStore from "../../Store/Store";

extend(geometry);

function Frame({
  id,
  name,
  describe,
  bg,
  width = 1,
  height = 1.61803398875,
  children,
  ...props
}) {
  const portal = useRef();
  const [hovered, hover] = useState(false);
  useCursor(hovered);

  const {setRoomType} = useSelectionStore()

  const onDoubleClickHandle = (e) => {
    console.log(e)
    setRoomType(2)
  }

  return (
    <group {...props}>
      <Text
        fontSize={0.18}
        anchorY="top"
        anchorX="left"
        lineHeight={0.8}
        position={[-0.375, 0.715, 0.01]}
        material-toneMapped={false}
      >
        {name}
      </Text>
      <Text
        fontSize={0.1}
        anchorX="right"
        position={[0.4, -0.659, 0.01]}
        material-toneMapped={false}
      >
        /{id}
      </Text>
      <Text
        fontSize={0.05}
        anchorX="right"
        position={[0.2, -0.677, 0.01]}
        material-toneMapped={false}
      >
        {describe}
      </Text>
      <mesh
        name={id}
        onPointerOver={(e) => hover(true)}
        onPointerOut={() => hover(false)}
        onDoubleClick={onDoubleClickHandle}
      >
        <roundedPlaneGeometry args={[width, height, 0.1]} />
        <MeshPortalMaterial ref={portal} side={THREE.DoubleSide}>
          <color attach="background" args={[bg]} />
          {children}
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
}

export default function RoomSelector() {
return (
    <>
        <color attach="background" args={['#f0f0f0']} />
        <OrbitControls
            makeDefault
            target={[0, .3, 0]}
            maxPolarAngle={Math.PI * 0.55} // Maximum ~135 degrees from top
            minPolarAngle={Math.PI *0.3}
            enableZoom={true}
            maxDistance={20}
            enablePan={false}
            rotateSpeed={0.3}
            zoomSpeed={0.7}
            dampingFactor={0.05}
            enableDamping={true}
        />

        <Frame
            id="01"
            name={`Basic\nsquare`}
            describe="5 x 5 x 3.6 m"
            bg="#e4cdac"
            position={[-1.15, 0.35, 0]}
            rotation={[0, 0.5, 0]}
            
        >
            <Environment
                preset={"studio"}
                background={false}
                environmentIntensity={0.5}
            />
            <Room
                floorPoints={RoomPointsTemplate(0)}
                wallHeight={3.6}
                scale={0.15}
                position={[0, -0.3, 0]}
            />
        </Frame>

        <Frame
            id="02"
            name={`Basic\nnarrow`}
            describe="6 x 4 x 3.6 m"
            bg="#e4cdac"
            position={[0, 0.35, 0]}
        >
            <Environment
                preset={"studio"}
                background={false}
                environmentIntensity={0.5}
            />
            <Room
                floorPoints={RoomPointsTemplate(1)}
                wallHeight={3.6}
                scale={0.15}
                position={[0, -0.3, 0]}
            />
        </Frame>

        <Frame
            id="03"
            name={`L-shaped\nroom`}
            describe="5 x 5 x 3.6 m + 1.25 x 2.5 m"
            bg="#e4cdac"
            position={[1.15, 0.35, 0]}
            rotation={[0, -0.5, 0]}
        >
            <Environment
                preset={"studio"}
                background={false}
                environmentIntensity={0.5}
            />
            <Room
                floorPoints={RoomPointsTemplate(2)}
                wallHeight={3.6}
                scale={0.15}
                position={[0, -0.3, 0]}
            />
        </Frame>
    </>
);
}
