import React from 'react';
import useSelectionStore from '../Store/Store';

const DebugButton = () => {
    const { objects, roomData } = useSelectionStore();

    const handleObjectsClick = () => {
        console.log('Current objects in store:', objects);
    };

    const handleRoomDataClick = () => {
        console.log('Current roomData:', roomData);
    };

    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleObjectsClick}>
                Print Objects
            </button>
            <button onClick={handleRoomDataClick}>
                Print RoomData
            </button>
        </div>
    );
};

export default DebugButton;