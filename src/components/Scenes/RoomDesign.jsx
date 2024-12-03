import { Grid } from '@react-three/drei';
import { useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export default function RoomDesign() {
    const [points, setPoints] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const { camera, scene } = useThree();

    const handleGridClick = useCallback((e) => {
        // If shape is already closed, don't add more points
        if (isClosed) return;

        e.stopPropagation();
        console.log(e.point);

        const point = e.point.clone();
        // Snap to grid (0.5 units)
        point.x = Math.round(point.x * 2) / 2;
        point.z = Math.round(point.z * 2) / 2;
        point.y = 0;

        // Check if clicking near the first point to close the shape
        if (points.length >= 3) {
            const firstPoint = points[0];
            const distance = point.distanceTo(firstPoint);
            
            if (distance < 0.5) {
                setIsClosed(true);
                setIsDrawing(false);
                return;
            }
        }

        setPoints(prev => [...prev, point]);
        setIsDrawing(true);
    }, [points, isClosed]);

    // Create shape geometry for the filled area
    const geometry = useMemo(() => {
        if (!isClosed || points.length < 3) return null;

        // Create a shape from the points
        const shape = new THREE.Shape();
        shape.moveTo(points[0].x, points[0].z);
        
        for (let i = 1; i < points.length; i++) {
            shape.lineTo(points[i].x, points[i].z);
        }
        
        // Close the shape
        shape.lineTo(points[0].x, points[0].z);

        // Extrude settings
        const extrudeSettings = {
            steps: 1,
            depth: 0.01,
            bevelEnabled: false,
        };

        // Create extruded geometry
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }, [points, isClosed]);

    return (
        <>
            <Grid 
                cellColor="white" 
                args={[20, 20]} 
                cellSize={0.5} 
                position={[0, 0, 0]} 
            />
            {/* Only show clickable plane when not closed */}
            {!isClosed && (
                <mesh position={[0, 0, 0]} onClick={handleGridClick}>
                    <boxGeometry args={[20, 0.01, 20]} />
                    <meshBasicMaterial color="grey" transparent opacity={0.0} />
                </mesh>
            )}

            {/* Draw lines between points */}
            {points.length >= 2 && points.map((point, index) => {
                if (index === points.length - 1) {
                    if (isClosed) {
                        // Draw closing line
                        return (
                            <line key="closing-line">
                                <bufferGeometry>
                                    <bufferAttribute
                                        attach="attributes-position"
                                        count={2}
                                        array={new Float32Array([
                                            point.x, 0, point.z,
                                            points[0].x, 0, points[0].z
                                        ])}
                                        itemSize={3}
                                    />
                                </bufferGeometry>
                                <lineBasicMaterial color="red" linewidth={2} />
                            </line>
                        );
                    }
                    return null;
                }
                const nextPoint = points[index + 1];
                
                return (
                    <line key={index}>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                count={2}
                                array={new Float32Array([
                                    point.x, 0, point.z,
                                    nextPoint.x, 0, nextPoint.z
                                ])}
                                itemSize={3}
                            />
                        </bufferGeometry>
                        <lineBasicMaterial color="red" linewidth={2} />
                    </line>
                );
            })}

            {/* Show current points */}
            {points.map((point, index) => (
                <mesh key={`point-${index}`} position={[point.x, 0, point.z]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color="red" />
                </mesh>
            ))}

            {/* Render filled shape when closed */}
            {isClosed && geometry && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                    <primitive object={geometry} attach="geometry" />
                    <meshBasicMaterial color="red" side={THREE.DoubleSide} transparent opacity={0.3} />
                </mesh>
            )}
        </>
    );
}