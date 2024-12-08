import React, { useEffect } from "react";
import ObjectsManager from "../AssetManage/ObjectsManager";
import TextureSelector from "../AssetManage/TextureSelector";
import ToggleButtons from "./ModeToggleButton";
import "../../../src/style.css";
import DesignModeToggle from './DesignModeToggle';
import useSelectionStore from "../Store/Store";
import ColorPicker from "../AssetManage/ColorPicker";
import SunPositionSlider from "./SunPositionSlider";
import { Box, Stack } from '@mui/material';

export default function InteractiveUI() {
    const { designMode } = useSelectionStore();

    useEffect(() => {
        console.log('Current designMode:', designMode);
    }, [designMode]);

    return (
        <Box sx={{ 
            position: 'fixed', 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none',
            '& > *': { pointerEvents: 'auto' },
            zIndex: 1000
        }}>
            {/* Top Left - Design Mode Toggle and Sun Position */}
            <Stack 
                spacing={2} 
                sx={{ 
                    position: 'absolute', 
                    top: 20, 
                    left: 20 
                }}
            >
                <DesignModeToggle />
                {designMode === "roomSimulation" && (
                    <SunPositionSlider />
                )}
            </Stack>

            {designMode === "roomSimulation" && (
                <>
                    {/* Right Side - Objects Manager */}
                    <Box sx={{ 
                        position: 'absolute', 
                        right: 20, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <ObjectsManager />
                    </Box>

                    {/* Bottom Center - Color Picker and Toggle Buttons */}
                    <Box sx={{ 
                        position: 'absolute', 
                        bottom: 20, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        {/* Color Picker slightly above Toggle Buttons */}
                        <Box>
                            <ColorPicker />
                        </Box>
                        
                        {/* Texture Selector */}
                        <Box sx={{ mb: 2 }}>
                            <TextureSelector />
                        </Box>

                        {/* Toggle Buttons at the bottom */}
                        <Box>
                            <ToggleButtons />
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}