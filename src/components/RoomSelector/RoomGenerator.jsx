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

// 生成牆壁幾何體
function createWallGeometry(startPoint, endPoint, wallHeight) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    startPoint.x,
    startPoint.y,
    startPoint.z,
    endPoint.x,
    endPoint.y,
    endPoint.z,
    endPoint.x,
    endPoint.y + wallHeight,
    endPoint.z,
    startPoint.x,
    startPoint.y + wallHeight,
    startPoint.z,
  ]);
  const indices = [0, 1, 2, 0, 2, 3];

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const length = new THREE.Vector3().subVectors(endPoint, startPoint).length();
  const area = length * wallHeight;

  return { geometry, area };
}

function Room({
  floorPoints,
  wallHeight = 3,
  wallMaterial = { color: "gray" },
  floorMaterial = { color: "red" },
  ceilingMaterial = { color: "lightgray" },
  ...props
}) {
  const {
    designMode,
    setRoomData,
    roomData,
    selectedObject,
    setSelectedObject,
    selectedObjectType,
  } = useSelectionStore();
  const groupRef = useRef();
  const showRoomData = () => {};

  // 點擊觸發的事件
  const handleClick = useCallback(
    (e, targetId) => {
      e.stopPropagation(); // 防止事件冒泡到父級 group
      if (selectedObject === targetId && selectedObjectType === "room") {
        setSelectedObject(null, null);
      } else {
        setSelectedObject(targetId, "room");
      }
    },
    [selectedObject, setSelectedObject, selectedObjectType]
  );

  // 地板 Shape 和面積
  const floorShape = useMemo(
    () => createShapeFromPoints(floorPoints),
    [floorPoints]
  );
  const floorArea = useMemo(() => calculateShapeArea(floorShape), [floorShape]);

  // 地板延伸設置
  const extrudeSettings = { depth: 0.2, bevelEnabled: false };

  // 天花板 Shape 和面積
  const ceilingShape = useMemo(() => {
    const ceilingPoints = floorPoints.map(
      (point) => new THREE.Vector3(point.x, wallHeight, point.z)
    );
    return createShapeFromPoints(ceilingPoints);
  }, [floorPoints, wallHeight]);
  const ceilingArea = useMemo(
    () => calculateShapeArea(ceilingShape),
    [ceilingShape]
  );

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

    console.log("roomData init");

    const initialRoomData = {
      ceiling: {
        id: "ceiling",
        area: ceilingArea,
        isModified: false,
        material: {
          materialName: "預設天花材質",
          map: null,
          normalMap: null,
          roughnessMap: null,
          aoMap: null,
          bumpMap: null,
          aoMapIntensity: 1,
          roughness: 1,
          metalness: 0,
          ratio: [1, 1],
          needsUpdate: false,
        },
      },
      floor: {
        id: "floor",
        area: floorArea,
        isModified: false,
        material: {
          materialName: "預設地板材質",
          map: null,
          normalMap: null,
          roughnessMap: null,
          aoMap: null,
          bumpMap: null,
          aoMapIntensity: 1,
          roughness: 1,
          metalness: 0,
          ratio: [1, 1],
          needsUpdate: false,
        },
      },
      walls: walls.map((wall) => ({
        id: wall.id,
        area: wall.area,
        isModified: false,
        material: {
          materialName: "預設牆材質",
          map: null,
          normalMap: null,
          roughnessMap: null,
          aoMap: null,
          bumpMap: null,
          aoMapIntensity: 1,
          roughness: 1,
          metalness: 0,
          ratio: [1, 1],
          needsUpdate: false,
        },
      })),
    };

    setRoomData(initialRoomData);
  }, [floorPoints]);

  return (
    <group ref={groupRef} {...props}>
      {/* 地板 */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ type: "floor", area: floorArea, id: "floor" }}
        onClick={(e) => handleClick(e, e.object.userData.id)}
        onDoubleClick={showRoomData}
      >
        <shapeGeometry attach="geometry" args={[floorShape]} />
        <meshStandardMaterial {...floorMaterial} side={THREE.DoubleSide} />
      </mesh>

      {/* 地板延伸部分 */}
      <mesh
        position={[0, -0.001, 0]}
        scale={[1.05, 1.05, 1]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <extrudeGeometry
          attach="geometry"
          args={[floorShape, extrudeSettings]}
        />
        <meshStandardMaterial color="darkgray" side={THREE.DoubleSide} />
      </mesh>

      {/* 牆壁 */}
      {walls.map((wall) => (
        <mesh
          key={wall.id}
          userData={{ type: "wall", area: wall.area, id: wall.id }}
          onClick={(e) => console.log(e.object.userData)}
        >
          <bufferGeometry attach="geometry" {...wall.geometry} />
          <meshStandardMaterial {...wallMaterial} side={THREE.FrontSide} />
        </mesh>
      ))}

      {/* 天花板 */}
      <mesh
        position={[0, wallHeight, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ type: "ceiling", area: ceilingArea, id: "ceiling" }}
      >
        <shapeGeometry attach="geometry" args={[ceilingShape]} />
        <meshStandardMaterial {...ceilingMaterial} side={THREE.FrontSide} />
      </mesh>
    </group>
  );
}

export default Room;
