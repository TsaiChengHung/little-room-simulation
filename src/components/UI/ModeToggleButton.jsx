import * as React from 'react';
import { FormatPaint, Chair } from '@mui/icons-material';
import { Box, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import useSelectionStore from '../Store/Store';

const selectedButtonStyles  = {
    '&.Mui-selected': {
      backgroundColor: "#2196f3",
      color: "white",
      '&:hover': {
        backgroundColor: "#1976d2",
      },
    },
  }

export default function ToggleButtons() {
    const { setOperationMode, operationMode } = useSelectionStore();

    const handleMode = (event, newMode) => {
        setOperationMode(newMode); 
    };

    return (
        <Box sx={{ pb: 8 }}>
            <Stack
                direction="row"
                spacing={0.5}
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
                    sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)", borderRadius: 2 }}
                >
                    <ToggleButton value="paint" aria-label="material paint" sx={selectedButtonStyles}>
                        <FormatPaint />
                    </ToggleButton>
                    <ToggleButton value="item" aria-label="item decoration" sx={selectedButtonStyles}>
                        <Chair />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>
        </Box>
    );
}