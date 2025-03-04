import React from 'react';
import useSelectionStore from '../Store/Store';

const DebugButton = () => {
    const { objects } = useSelectionStore();

    const handleClick = () => {
        console.log('Current objects in store:', objects);
    };

    return (
        <button onClick={handleClick}>
            Print Objects
        </button>
    );
};

export default DebugButton;