import React, { useMemo, useEffect, useCallback } from 'react';
import useSelectionStore from '../Store/Store';
import * as THREE from 'three';
import { MeshPhysicalMaterial, Clock, MeshStandardMaterial } from 'three';

// Define materials for all meshes
const materials = {
    floor: new MeshPhysicalMaterial({
        color: 0xcccccc,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.FrontSide
    }),
    wallNorth: new MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.BackSide
    }),
    wallSouth: new MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.BackSide
    }),
    wallEast: new MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.FrontSide
    }),
    wallWest: new MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.FrontSide
    }),
};

// UV-scaled plane geometry component
const UVScaledPlane = React.memo(({ width, height, tileScale = 2 }) => {
    return (
        <planeGeometry
            args={[width, height]}
            onUpdate={(geometry) => {
                const uvScale = {
                    x: width / tileScale,
                    y: height / tileScale
                };
                const uvs = geometry.attributes.uv;
                for (let i = 0; i < uvs.count; i++) {
                    uvs.setXY(
                        i,
                        uvs.getX(i) * uvScale.x,
                        uvs.getY(i) * uvScale.y
                    );
                }
                uvs.needsUpdate = true;
            }}
        />
    );
});

const RoomGenerative = () => {
    const { roomDimensions } = useSelectionStore();
    const { setSelectedObject, selectedObject, roomMaterials, addRoomMaterial, operationMode, selectedObjectType } = useSelectionStore();
    const clock = useMemo(() => new Clock(), []);

    // Create hover material
    const hoverMaterial = useMemo(() => {
        return new MeshStandardMaterial({ 
            color: "yellow",
            emissive: "yellow",
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
    }, []);

    useEffect(() => {
        addRoomMaterial('floor', materials.floor);
        addRoomMaterial('north', materials.wallNorth);
        addRoomMaterial('south', materials.wallSouth);
        addRoomMaterial('east', materials.wallEast);
        addRoomMaterial('west', materials.wallWest);
    }, [addRoomMaterial]);

    const handleClick = useCallback((e, wallId) => {
        e.stopPropagation(); // 防止事件冒泡到父級 group
        if (selectedObject === wallId && selectedObjectType === 'room') {
            setSelectedObject(null, null);
        } else {
            setSelectedObject(wallId, 'room');
        }
    }, [selectedObject, setSelectedObject, selectedObjectType]);

    const setHoverMaterial = useCallback((e) => {
        e.stopPropagation(); // 防止事件冒泡到父級 group
        if (operationMode === 'paint') {
            e.object.material = hoverMaterial;
        }
    }, [operationMode, hoverMaterial]);

    return (
        <group>
            {/* Floor */}
            <mesh
                receiveShadow
                position={[0, 0, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                material={roomMaterials.floor}
                onClick={(e) => handleClick(e, 'floor')}
                onPointerOver={(e) => {setHoverMaterial(e)}}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    e.object.material = roomMaterials.floor;
                }}
            >
                <UVScaledPlane width={roomDimensions.width} height={roomDimensions.depth} />
            </mesh>
            <mesh position={[0, -0.051, 0]}>
                <boxGeometry args={[roomDimensions.width, 0.1, roomDimensions.depth]} />
                <meshPhysicalMaterial color="darkgrey" />
            </mesh>

            {/* North Wall */}
            
            <mesh
                receiveShadow
                castShadow
                position={[0, 1.5, -roomDimensions.depth / 2]}
                rotation={[0, Math.PI, 0]}
                material={roomMaterials.north}
                onClick={(e) => handleClick(e, 'north')}
                onPointerOver={(e) => {setHoverMaterial(e)}}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    e.object.material = roomMaterials.north;
                }}
            >
                <UVScaledPlane width={roomDimensions.width} height={3} />
            </mesh>


            {/* South Wall */}
            <mesh
                receiveShadow
                castShadow
                position={[0, 1.5, roomDimensions.depth / 2]}
                material={roomMaterials.south}
                onClick={(e) => handleClick(e, 'south')}
                onPointerOver={(e) => {setHoverMaterial(e)}}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    e.object.material = roomMaterials.south;
                }}
            >
                <UVScaledPlane width={roomDimensions.width} height={3} />
            </mesh>

            {/* East Wall */}
            <mesh
                receiveShadow
                castShadow
                position={[roomDimensions.width / 2, 1.5, 0]}
                rotation={[0, -Math.PI / 2, 0]}
                material={roomMaterials.east}
                onClick={(e) => handleClick(e, 'east')}
                onPointerOver={(e) => {setHoverMaterial(e)}}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    e.object.material = roomMaterials.east;
                }}
            >
                <UVScaledPlane width={roomDimensions.depth} height={3} />
            </mesh>

            {/* West Wall */}
            <mesh
                receiveShadow
                castShadow
                position={[-roomDimensions.width / 2, 1.5, 0]}
                rotation={[0, Math.PI / 2, 0]}
                material={roomMaterials.west}
                onClick={(e) => handleClick(e, 'west')}
                onPointerOver={(e) => {setHoverMaterial(e)}}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    e.object.material = roomMaterials.west;
                }}
            >
                <UVScaledPlane width={roomDimensions.depth} height={3} />
            </mesh>
            
        </group>
    );
};

export default RoomGenerative;