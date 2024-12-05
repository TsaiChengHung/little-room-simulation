import React from 'react';
import { useEffect } from 'react';
import useSelectionStore from '../Store/Store';
import * as THREE from 'three';

const RoomGenerative = () => {
  const { roomDimensions } = useSelectionStore();

  useEffect(() => {
    // Convert dimensions from meters to appropriate scale
    const width = roomDimensions.width;
    const depth = roomDimensions.depth;
    const wallThickness = roomDimensions.wallThickness;

    // Create floor geometry
    const floorGeometry = new THREE.BoxGeometry(width, 0.1, depth);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.position.y = -0.05; // Half of the floor thickness

    // Create walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.1
    });

    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(width, 3, wallThickness),
      wallMaterial
    );
    northWall.position.set(0, 1.5, -depth/2);

    // South wall
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(width, 3, wallThickness),
      wallMaterial
    );
    southWall.position.set(0, 1.5, depth/2);

    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, 3, depth),
      wallMaterial
    );
    eastWall.position.set(width/2, 1.5, 0);

    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, 3, depth),
      wallMaterial
    );
    westWall.position.set(-width/2, 1.5, 0);

    // Add all meshes to the scene
    return () => {
      floor.geometry.dispose();
      floor.material.dispose();
      northWall.geometry.dispose();
      northWall.material.dispose();
      southWall.geometry.dispose();
      southWall.material.dispose();
      eastWall.geometry.dispose();
      eastWall.material.dispose();
      westWall.geometry.dispose();
      westWall.material.dispose();
    };
  }, [roomDimensions]);

  return (
    <group>
      <mesh
        receiveShadow
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <boxGeometry args={[roomDimensions.width, roomDimensions.depth, 0.1]} />
        <meshStandardMaterial 
          color={0xcccccc}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {/* North Wall */}
      <mesh position={[0, 1.5, -roomDimensions.depth/2]}>
        <boxGeometry args={[roomDimensions.width, 3, roomDimensions.wallThickness]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, 1.5, roomDimensions.depth/2]}>
        <boxGeometry args={[roomDimensions.width, 3, roomDimensions.wallThickness]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
      {/* East Wall */}
      <mesh position={[roomDimensions.width/2, 1.5, 0]}>
        <boxGeometry args={[roomDimensions.wallThickness, 3, roomDimensions.depth]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-roomDimensions.width/2, 1.5, 0]}>
        <boxGeometry args={[roomDimensions.wallThickness, 3, roomDimensions.depth]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
    </group>
  );
};

export default RoomGenerative;