import * as React from 'react';
import { FormatPaint, Chair, OpenWith, RotateLeft, OpenInFull } from '@mui/icons-material';
import { Box, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import useSelectionStore from '../Store/Store';
import { CloseRounded, Palette, TextureRounded } from '@mui/icons-material';

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
    const { removeObject, removeDefaultObject, selectedObject, selectedObjectType, setOperationMode, operationMode, transformMode, setTransformMode, setPaintMode, paintMode } = useSelectionStore();

    const handleMode = (event, newMode) => {
        setOperationMode(newMode);
    };

    const handlePaintMode = (event, newMode) => {
        setPaintMode(newMode);
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
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                    p: 1
                }}
            >
                {operationMode === "paint" && (
                    <ToggleButtonGroup
                        value={paintMode}
                        exclusive
                        onChange={handlePaintMode}
                        aria-label="paint mode"
                        size='small'
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
                        <ToggleButton
                            value="color"
                            aria-label="color palette"
                            sx={selectedButtonStyles}
                        >
                            <Palette sx={subButtonStyles} />
                        </ToggleButton>
                        <ToggleButton
                            value="texture"
                            aria-label="texture"
                            sx={selectedButtonStyles}
                        >
                            <TextureRounded sx={subButtonStyles} />
                        </ToggleButton>
                    </ToggleButtonGroup>
                )}

                <ToggleButtonGroup
                    value={operationMode}
                    exclusive
                    onChange={handleMode}
                    aria-label="text alignment"
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
                    <ToggleButton
                        value="paint"
                        aria-label="material paint"
                        sx={selectedButtonStyles}
                    >
                        <FormatPaint sx={subButtonStyles} />
                    </ToggleButton>
                    <ToggleButton
                        value="object"
                        aria-label="item decoration"
                        sx={selectedButtonStyles}
                    >
                        <Chair sx={subButtonStyles} />
                    </ToggleButton>
                </ToggleButtonGroup>

                {operationMode === "object" && (
                    <Stack
                        direction="row"
                        spacing={0.5}
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