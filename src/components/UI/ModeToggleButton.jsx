import * as React from 'react';
import { FormatPaint, Chair, OpenWith, RotateLeft, OpenInFull } from '@mui/icons-material';
import { Box, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import useSelectionStore from '../Store/Store';
import { CloseRounded } from '@mui/icons-material';

const selectedButtonStyles = {
    '&.Mui-selected': {
        backgroundColor: "#2196f3",
        color: "white",
        '&:hover': {
            backgroundColor: "#1976d2",
        },
    },
}

const subButtonStyles = {
    fontSize: '1.5rem'
}

export default function ToggleButtons() {
    const { removeObject, removeDefaultObject, selectedObject, selectedObjectType, setOperationMode, operationMode, transformMode, setTransformMode } = useSelectionStore();

    const handleMode = (event, newMode) => {
        setOperationMode(newMode);
    };

    const handleTransform = (event, newMode) => {
        setTransformMode(newMode);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        if (selectedObjectType === "customObject") {
            removeObject(selectedObject);
        }
        else if (selectedObjectType === "defaultObject") {
            removeDefaultObject(selectedObject);
        }
    };

    return (
        <Box sx={{ pb: 8 }}>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    alignItems: "center",
                    position: "fixed",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1000,
                }}
            >
                <ToggleButtonGroup
                    value={operationMode}
                    exclusive
                    onChange={handleMode}
                    aria-label="text alignment"
                    sx={{ 
                        backgroundColor: "rgba(0, 0, 0, 0.1)", 
                        borderRadius: 2,
                        position: 'relative'
                    }}
                >
                    <ToggleButton value="paint" aria-label="material paint" sx={selectedButtonStyles}>
                        <FormatPaint sx={subButtonStyles} />
                    </ToggleButton>
                    <ToggleButton value="object" aria-label="item decoration" sx={selectedButtonStyles}>
                        <Chair sx={subButtonStyles} />
                    </ToggleButton>
                </ToggleButtonGroup>

                {operationMode === "object" && (
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                            position: 'absolute',
                            left: '100%',
                            marginLeft: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    >
                        <ToggleButtonGroup
                            value={transformMode}
                            exclusive
                            onChange={handleTransform}
                            aria-label="transform mode"
                            size="small"
                            sx={{
                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                borderRadius: 2,
                                '& .MuiToggleButton-root': {
                                    padding: '4px',
                                    minWidth: '32px',
                                    minHeight: '32px'
                                }
                            }}
                        >
                            <ToggleButton value="translate" aria-label="translate" sx={selectedButtonStyles}>
                                <OpenWith sx={subButtonStyles} />
                            </ToggleButton>
                            <ToggleButton value="rotate" aria-label="rotate" sx={selectedButtonStyles}>
                                <RotateLeft sx={subButtonStyles} />
                            </ToggleButton>
                            <ToggleButton value="scale" aria-label="scale" sx={selectedButtonStyles}>
                                <OpenInFull sx={subButtonStyles} />
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <ToggleButton
                            value="remove"
                            aria-label="remove"
                            onClick={handleRemove}
                            sx={{
                                ...selectedButtonStyles,
                                padding: '4px',
                                minWidth: '32px',
                                minHeight: '32px'
                            }}
                        >
                            <CloseRounded sx={subButtonStyles} color='error' />
                        </ToggleButton>
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}