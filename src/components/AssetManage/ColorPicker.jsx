import React from 'react';
import { Stack } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import useSelectionStore from '../Store/Store';

export default function ColorPicker() {
    const { selectedObject, selectedObjectType, operationMode, paintMode, setMaterialColor } = useSelectionStore();

    const handleColorChange = (color) => {
        if (selectedObject && selectedObjectType === 'room') {
            setMaterialColor(selectedObject, color);
        }
    };

    return (
        <>
            {selectedObject && selectedObjectType === 'room' && operationMode === 'paint' && paintMode === 'color' && (
                <Stack
                    spacing={2}
                    sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: 3,
                    }}
                >
                    <HexColorPicker onChange={handleColorChange} />
                </Stack>
            )}
        </>
    );
}