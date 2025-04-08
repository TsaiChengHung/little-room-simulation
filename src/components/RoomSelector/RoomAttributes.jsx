import * as THREE from 'three'

// Room points
const room1FloorPoints = [
  new THREE.Vector3(-2.5, 0, -2.5), // 左下角
  new THREE.Vector3(2.5, 0, -2.5),  // 右下角
  new THREE.Vector3(2.5, 0, 2.5),   // 右上角
  new THREE.Vector3(-2.5, 0, 2.5),  // 左上角
]

const room2FloorPoints = [
  new THREE.Vector3(-3, 0, -2),     // 左下角
  new THREE.Vector3(3, 0, -2),      // 右下角
  new THREE.Vector3(3, 0, 2),       // 右上角
  new THREE.Vector3(-3, 0, 2),      // 左上角
]

const room3FloorPoints = [
  new THREE.Vector3(-2.5, 0, -2.5), // 左下角（主體起點）
  new THREE.Vector3(2.5, 0, -2.5),  // 右下角（主體）
  new THREE.Vector3(2.5, 0, 2.5),   // 右上角（延伸）
  new THREE.Vector3(-1.25, 0, 2.5), // 中點（L 形轉折）
  new THREE.Vector3(-1.25, 0, 0),   // 中下點
  new THREE.Vector3(-2.5, 0, 0),    // 左中點
]

export default function RoomPointsTemplate(roomIndex) {
  const roomFloorPoints = [room1FloorPoints, room2FloorPoints, room3FloorPoints][roomIndex]

  return (roomFloorPoints)
}

