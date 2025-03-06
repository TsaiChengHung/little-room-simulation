import { useMemo, useCallback } from 'react';
import useSelectionStore from '../Store/Store';

export default function CustomObjects() {
    const { objects, setSelectedObject } = useSelectionStore();

    const handleClick = useCallback((key, id) => (e) => {
        e.stopPropagation();
        setSelectedObject(key, id, 'customObject');
    }, [setSelectedObject]);

    const renderObject = useCallback((item, key) => {
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
                onClick={handleClick(key, item.id)}
            />
        );
    }, [handleClick]);

    const renderedObjects = useMemo(() => (
        Object.keys(objects).flatMap((key) =>
            objects[key].map((item) => renderObject(item, key))
        )
    ), [objects, renderObject]);

    return <>{renderedObjects}</>;
}
