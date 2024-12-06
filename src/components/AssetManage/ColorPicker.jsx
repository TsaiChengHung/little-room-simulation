import React from 'react';
import { Box, Stack } from '@mui/material';
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
                <Box sx={{ pb: 8 }}>
                    <Stack
                        spacing={2}
                        sx={{
                            position: 'fixed',
                            bottom: 80,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'white',
                            borderRadius: 2,
                            p: 2,
                            boxShadow: 3,
                            zIndex: 1000,
                        }}
                    >
                        <HexColorPicker onChange={handleColorChange} />
                    </Stack>
                </Box>
            )}
        </>
    );
}