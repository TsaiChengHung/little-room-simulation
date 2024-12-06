import React, { useMemo, useEffect, useCallback } from 'react';
import useSelectionStore from '../Store/Store';
import * as THREE from 'three';
import { MeshPhysicalMaterial, Clock } from 'three';

// Define materials for all meshes
const materials = {
    floor: new MeshPhysicalMaterial({
        color: 0xcccccc,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.FrontSide
    }),
    wallBack: new MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.BackSide
    }),
    wallFront: new MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.FrontSide
    })
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

    useEffect(() => {
        addRoomMaterial('floor', materials.floor);
        addRoomMaterial('north', materials.wallBack);
        addRoomMaterial('south', materials.wallBack);
        addRoomMaterial('east', materials.wallFront);
        addRoomMaterial('west', materials.wallFront);
    }, [addRoomMaterial]);

    const handleClick = useCallback((e, wallId) => {
        e.stopPropagation(); // 防止事件冒泡到父級 group
        if (selectedObject === wallId && selectedObjectType === 'room') {
            setSelectedObject(null, null);
        } else {
            setSelectedObject(wallId, 'room');
        }
    }, [selectedObject, setSelectedObject, selectedObjectType]);

    return (
        <group>
            {/* Floor */}
            <mesh
                receiveShadow
                position={[0, 0, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                material={roomMaterials.floor}
                onClick={(e) => handleClick(e, 'floor')}
            >
                <UVScaledPlane width={roomDimensions.width} height={roomDimensions.depth} />
            </mesh>

            {/* North Wall */}
            
            <mesh
                receiveShadow
                castShadow
                position={[0, 1.5, -roomDimensions.depth / 2]}
                rotation={[0, Math.PI, 0]}
                material={roomMaterials.north}
                onClick={(e) => handleClick(e, 'north')}

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
            >
                <UVScaledPlane width={roomDimensions.depth} height={3} />
            </mesh>
            
        </group>
    );
};

export default RoomGenerative;