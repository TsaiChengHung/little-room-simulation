import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Architecture, ViewInAr } from '@mui/icons-material';
import useStore from '../Store/Store';

const DesignModeToggle = () => {
  const { designMode, setDesignMode } = useStore();

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setDesignMode(newMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={designMode}
      exclusive
      onChange={handleModeChange}
      aria-label="design mode"
      sx={{
        backgroundColor: "rgba(1, 0, 0, 0.2)", 
        borderRadius: 2,
        '& .MuiToggleButton-root': {
          padding: '4px 10px',
        },
      }}
    >
      <ToggleButton value="roomDesign" aria-label="room design">
        <Architecture sx={{ mr: 1 }} />
        Design
      </ToggleButton>
      <ToggleButton value="roomSimulation" aria-label="room simulation">
        <ViewInAr sx={{ mr: 1 }} />
        Simulation
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default DesignModeToggle;
