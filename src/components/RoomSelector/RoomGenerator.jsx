import * as THREE from "three";
import { useRef, useMemo, useEffect, useCallback } from "react";
import useSelectionStore from "../Store/Store";
import {createShapeFromPoints, createShapeGeometryWithUV, createWallGeometry } from "./RoomGenerateUtils";

function Room({ floorPoints, wallHeight = 3, useRoomData = false, ...props }) {
  const {
    designMode,
    resetRoomData,
    addRoomDataObject,
    roomData,
    selectedObject,
    setSelectedObject,
    selectedObjectType,
  } = useSelectionStore();
  const groupRef = useRef();

  // 點擊觸發的事件
  const handleClick = useCallback(
    (e, targetId) => {
      e.stopPropagation();
      if (selectedObject === targetId && selectedObjectType === "room") {
        setSelectedObject(null, null);
      } else {
        setSelectedObject(targetId, "room");
      }
      console.log("room clicked", targetId, roomData);
      console.log(roomData);
    },
    [selectedObject, setSelectedObject, selectedObjectType]
  );

  const [floorShapeGeo, floorArea] = useMemo(() => {
    return createShapeGeometryWithUV(floorPoints);
  }, [floorPoints]);

  // 地板延伸設置
  const extrudeSettings = { depth: 0.2, bevelEnabled: false };

  // 天花板 Shape 和面積
  const [ceilingShapeGeo, ceilingArea] = useMemo(() => {
    const ceilingPoints = floorPoints.map(
      (point) => new THREE.Vector3(point.x, wallHeight, point.z)
    );
    return createShapeGeometryWithUV(ceilingPoints);
  }, [floorPoints, wallHeight]);

  // 牆壁數據
  const walls = useMemo(() => {
    const n = floorPoints.length;
    const wallData = [];
    for (let i = 0; i < n; i++) {
      const startPoint = floorPoints[i];
      const endPoint = floorPoints[(i + 1) % n];
      const [ geometry, area ] = createWallGeometry(
        startPoint,
        endPoint,
        wallHeight
      );
      wallData.push({ geometry, area, id: `wall-${i}` });
    }
    return wallData;
  }, [floorPoints, wallHeight]);

  // 初始化 roomData，僅在必要時設置
  useEffect(() => {
    // 如果 roomData 已存在，則不重新設置，避免循環
    if (roomData && designMode === "roomDesign") return;
    resetRoomData();
    console.log("roomData init");

    addRoomDataObject("ceiling", ceilingArea);
    addRoomDataObject("floor", floorArea);
    walls.forEach((wall) => addRoomDataObject(wall.id, wall.area));
  }, [floorPoints]);

  return (
    <group ref={groupRef} {...props}>
      {/* 地板 */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ type: "floor", area: floorArea, id: "floor" }}
        onClick={(e) => handleClick(e, e.object.userData.id)}
      >
       <primitive attach="geometry" object={floorShapeGeo} />
        {useRoomData ? (
          <meshStandardMaterial
            {...roomData["floor"].textures}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial color="red" side={THREE.DoubleSide} />
        )}
      </mesh>

      {/* 地板延伸部分 */}
      <mesh
        position={[0, -0.001, 0]}
        scale={[1.05, 1.05, 1]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <extrudeGeometry
          attach="geometry"
          args={[createShapeFromPoints(floorPoints), extrudeSettings]}
        />
        <meshStandardMaterial color="darkgray" side={THREE.DoubleSide} />
      </mesh>

      {/* 天花板 */}
      <mesh
        position={[0, wallHeight, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ type: "ceiling", area: ceilingArea, id: "ceiling" }}
        onClick={(e) => handleClick(e, e.object.userData.id)}
      >
        <primitive attach="geometry" object={ceilingShapeGeo} />
        {useRoomData ? (
          <meshStandardMaterial
            {...roomData["ceiling"].textures}
            side={THREE.FrontSide}
          />
        ) : (
          <meshStandardMaterial color="white" side={THREE.FrontSide} />
        )}
      </mesh>

      {/* 牆壁 */}
      {walls.map((wall) => (
        <mesh
          key={wall.id}
          userData={{ type: "wall", area: wall.area, id: wall.id }}
          onClick={(e) => handleClick(e, e.object.userData.id)}
        >
          <bufferGeometry attach="geometry" {...wall.geometry} />
          {useRoomData ? (
            <meshStandardMaterial
              {...roomData[wall.id].textures}
              side={THREE.FrontSide}
            />
          ) : (
            <meshStandardMaterial color="darkgray" side={THREE.FrontSide} />
          )}
        </mesh>
      ))}
    </group>
  );
}

export default Room;
