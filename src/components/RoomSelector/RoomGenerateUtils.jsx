import * as THREE from "three";

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

  return [geometry, area];
}

export { createShapeFromPoints, createShapeGeometryWithUV, createWallGeometry };