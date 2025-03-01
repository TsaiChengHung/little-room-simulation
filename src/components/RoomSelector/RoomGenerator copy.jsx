import * as THREE from "three";
import { useRef, useMemo, useEffect, useCallback } from "react";
import useSelectionStore from "../Store/Store";

// 根據點陣列創建 Shape
function createShapeFromPoints(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].z);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, points[i].z);
  }
  shape.closePath();
  return shape;
}

// 計算面積
function calculateShapeArea(shape) {
  const geometry = new THREE.ShapeGeometry(shape);
  const positions = geometry.attributes.position.array;
  const indices = geometry.index.array;
  let area = 0;

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];

    const v0 = new THREE.Vector3(
      positions[a * 3],
      positions[a * 3 + 1],
      positions[a * 3 + 2]
    );
    const v1 = new THREE.Vector3(
      positions[b * 3],
      positions[b * 3 + 1],
      positions[b * 3 + 2]
    );
    const v2 = new THREE.Vector3(
      positions[c * 3],
      positions[c * 3 + 1],
      positions[c * 3 + 2]
    );

    const edge1 = new THREE.Vector3().subVectors(v1, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v0);
    const cross = new THREE.Vector3().crossVectors(edge1, edge2);
    area += cross.length() * 0.5;
  }

  geometry.dispose();
  return area;
}

// 為 ShapeGeometry 設定 UV
function createShapeGeometryWithUV(points) {
  const shape = createShapeFromPoints(points);
  const area = calculateShapeArea(shape);
  const geometry = new THREE.ShapeGeometry(shape);

  // 計算形狀的邊界 (Bounding Box)
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const width = max.x - min.x;
  const height = max.y - min.y;

  // 生成 UV 座標，讓貼圖填滿整個形狀
  const uvs = [];
  const positions = geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const u = (x - min.x) / width; // Normalize UV X
    const v = (y - min.y) / height; // Normalize UV Y
    uvs.push(u, v);
  }

  // 設定 UV 屬性
  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(uvs), 2)
  );

  return [geometry, area];
}

// 生成牆壁幾何體
function createWallGeometry(startPoint, endPoint, wallHeight) {
  const geometry = new THREE.BufferGeometry();

  // 定義牆壁的頂點
  const vertices = new Float32Array([
    startPoint.x,
    startPoint.y,
    startPoint.z, // 0: Bottom-Left
    endPoint.x,
    endPoint.y,
    endPoint.z, // 1: Bottom-Right
    endPoint.x,
    endPoint.y + wallHeight,
    endPoint.z, // 2: Top-Right
    startPoint.x,
    startPoint.y + wallHeight,
    startPoint.z, // 3: Top-Left
  ]);

  // 定義索引，使其形成一個矩形
  const indices = [0, 1, 2, 0, 2, 3];

  // 計算牆的長度
  const length = new THREE.Vector3().subVectors(endPoint, startPoint).length();
  const area = length * wallHeight;

  // UV 座標對應頂點（以牆的長度與高度進行貼圖映射）
  const uvs = new Float32Array([
    0,
    0, // 0: Bottom-Left
    1,
    0, // 1: Bottom-Right
    1,
    1, // 2: Top-Right
    0,
    1, // 3: Top-Left
  ]);

  // 設定幾何屬性
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return [geometry, area] ;
}

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
      const { geometry, area } = createWallGeometry(
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
