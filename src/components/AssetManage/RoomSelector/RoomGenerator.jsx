import * as THREE from "three";
import { useRef } from "react";

// 根據點陣列創建 Shape
function createShapeFromPoints(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].z); // 假設 Z 為 Shape 的 Y 軸
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, points[i].z);
  }
  shape.closePath();
  return shape;
}

function calculateShapeGeometryArea(geometry) {
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

    // 計算三角形面積（使用叉積）
    const edge1 = new THREE.Vector3().subVectors(v1, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v0);
    const cross = new THREE.Vector3().crossVectors(edge1, edge2);
    area += cross.length() * 0.5;
  }

  return area;
}

// 根據 Shape 生成地板幾何體
function createFloorShapeGeometry(floorPoints) {
  const shape = createShapeFromPoints(floorPoints);
  const geometry = new THREE.ShapeGeometry(shape);

  // 計算面積
  const area = calculateShapeGeometryArea(geometry);

  return { geometry, area }; // 返回包含幾何體和面積的對象
}

// 根據 Shape 生成地板幾何體的延伸
function createFloorShapeExtrudeGeometry(floorPoints, extrudeSettings) {
  const shape = createShapeFromPoints(floorPoints);
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

// 根據 Shape 生成天板幾何體
function createCeilingShapeGeometry(floorPoints, wallHeight) {
  const ceilingPoints = floorPoints.map(
    (point) => new THREE.Vector3(point.x, wallHeight, point.z)
  );
  const shape = createShapeFromPoints(ceilingPoints);
  const geometry = new THREE.ShapeGeometry(shape);

  // 計算面積
  const area = calculateShapeGeometryArea(geometry);

  return { geometry, area }; // 返回包含幾何體和面積的對象
}

// 根據兩點和牆高生成牆壁幾何體（支援 DoubleSide）
function createWallGeometry(startPoint, endPoint, wallHeight) {
  const geometry = new THREE.BufferGeometry();

  // 定義四個頂點：底部（startPoint, endPoint）與頂部（向上延伸 wallHeight）
  const vertices = [
    startPoint.x,
    startPoint.y,
    startPoint.z, // 底部起點
    endPoint.x,
    endPoint.y,
    endPoint.z, // 底部終點
    endPoint.x,
    endPoint.y + wallHeight,
    endPoint.z, // 頂部終點
    startPoint.x,
    startPoint.y + wallHeight,
    startPoint.z, // 頂部起點
  ];

  // 設置頂點屬性
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  // 定義索引（形成兩個三角形，構成矩形）
  const indices = [
    0,
    1,
    2, // 第一個三角形
    0,
    2,
    3, // 第二個三角形
  ];
  geometry.setIndex(indices);

  // 計算法線（確保朝外）
  geometry.computeVertexNormals();

  // 計算牆壁面積
  const length = new THREE.Vector3().subVectors(endPoint, startPoint).length();
  const area = length * wallHeight;

  return { geometry, area };
}

// 根據地板點陣列生成所有牆壁、地板和天板的單一物件
function createRoomObject(
  floorPoints,
  wallHeight,
  wallMaterial,
  floorMaterial,
  ceilingMaterial
) {
  const group = new THREE.Group();

  // 生成牆壁
  const n = floorPoints.length;
  for (let i = 0; i < n; i++) {
    const startPoint = floorPoints[i];
    const endPoint = floorPoints[(i + 1) % n];
    const { geometry, area } = createWallGeometry(
      startPoint,
      endPoint,
      wallHeight
    ); // 解構返回值

    const wallMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        ...wallMaterial,
        side: THREE.FrontSide,
      })
    );
    wallMesh.userData = { type: "wall", area: area }; // 標記為牆壁，面積在選取時計算
    group.add(wallMesh);
  }

  // 生成地板
  const { geometry: floorGeometry, area: floorArea } =
    createFloorShapeGeometry(floorPoints);
  const floorExtrudeGeometry = createFloorShapeExtrudeGeometry(floorPoints, {
    depth: 0.2,
    bevelSize: 0,
  });
  const floorMesh = new THREE.Mesh(
    floorGeometry,
    new THREE.MeshStandardMaterial({
      ...floorMaterial,
      side: THREE.DoubleSide,
    })
  );
  const floorExtrudeMesh = new THREE.Mesh(
    floorExtrudeGeometry,
    new THREE.MeshStandardMaterial({
      color: "darkgray",
      side: THREE.DoubleSide,
    })
  );
  floorMesh.rotation.x = Math.PI / 2;
  floorMesh.userData = { type: "floor", area: floorArea }; // 儲存地板面積
  floorExtrudeMesh.position.y = -0.201;
  floorExtrudeMesh.scale.set(1.05, 1.05, 1);
  floorExtrudeMesh.rotation.x = Math.PI / 2;
  group.add(floorMesh);
  group.add(floorExtrudeMesh);

  // 生成天板
  const { geometry: ceilingGeometry, area: ceilingArea } =
    createCeilingShapeGeometry(floorPoints, wallHeight);
  const ceilingMesh = new THREE.Mesh(
    ceilingGeometry,
    new THREE.MeshStandardMaterial({
      ...ceilingMaterial,
      side: THREE.FrontSide,
    })
  );
  ceilingMesh.position.y = wallHeight;
  ceilingMesh.rotation.x = Math.PI / 2;
  ceilingMesh.userData = { type: "ceiling", area: ceilingArea }; // 儲存天板面積
  group.add(ceilingMesh);

  return group;
}

function Room({
  floorPoints,
  wallHeight = 3,
  wallMaterial = { color: "gray" },
  floorMaterial = { color: "red" },
  ceilingMaterial = { color: "lightgray" },
  ...props
}) {
  const groupRef = useRef();

  // 創建房間物件
  const roomObject = createRoomObject(
    floorPoints,
    wallHeight,
    wallMaterial,
    floorMaterial,
    ceilingMaterial
  );

  return (
    <group ref={groupRef} {...props} >
      <primitive object={roomObject} />
    </group>
  );
}

export default Room;
