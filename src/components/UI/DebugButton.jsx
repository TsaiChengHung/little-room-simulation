import React from 'react';
import useSelectionStore from '../Store/Store';

const DebugButton = () => {
    const { objects, roomData, preloadedModels } = useSelectionStore();

    const handleObjectsClick = () => {
        console.log('Current objects in store:', objects);
    };

    const handleRoomDataClick = () => {
        console.log('Current roomData:', roomData);
    };

    const handlePreloadObjectClick = () => {
        console.log('Current preload objects:', preloadedModels)
    }

    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleObjectsClick}>
                Print Objects
            </button>
            <button onClick={handleRoomDataClick}>
                Print RoomData
            </button>
            <button onClick={handlePreloadObjectClick}>
                Print Preload Objects
            </button>
        </div>
    );
};

export default DebugButton;