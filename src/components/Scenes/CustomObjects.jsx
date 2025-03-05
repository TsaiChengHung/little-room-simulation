import React, { useRef } from 'react';
import useSelectionStore from '../Store/Store';

export default function CustomObjects() {
    const { objects, setSelectedObject } = useSelectionStore();

    const renderObject = (item, key) => {
        const position = item.transform?.translate || [0, 0, 0];
        const rotation = item.transform?.rotate || [0, 0, 0];
        const scale = item.transform?.scale || [1, 1, 1];

        return (
            <primitive
                key={item.id}
                object={item.object}
                position={position}
                rotation={rotation}
                scale={scale}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedObject(key, item.id, 'customObject');
                }}
            />
        );
    };

    return (
        <>
            {Object.keys(objects).flatMap((key) =>
                objects[key].map((item) => renderObject(item, key))
            )}
        </>
    );
}
