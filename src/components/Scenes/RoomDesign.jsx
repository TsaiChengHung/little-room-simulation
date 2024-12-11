import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Group, Text, Label, Tag, Shape } from 'react-konva';
import { Box, TextField, Stack, Typography } from '@mui/material';
import useSelectionStore from '../Store/Store';

const RoomDesign = () => {
  const { roomDimensions, setRoomDimensions } = useSelectionStore();
  const [areaSize, setAreaSize] = useState(roomDimensions.width * roomDimensions.depth);
  
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Update area whenever dimensions change
    setAreaSize(roomDimensions.width * roomDimensions.depth);
  }, [roomDimensions.width, roomDimensions.depth]);

  const handleDimensionChange = (dimension) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setRoomDimensions({ ...roomDimensions, [dimension]: value });
  };

  const createFrame = (frameWidth, frameDepth, scale) => {
    // Convert meters to mm for internal calculations
    const widthMm = frameWidth * 1000;
    const depthMm = frameDepth * 1000;
    
    return (
      <Group>
        {/* Room outline */}
        <Line
          points={[0, 0, widthMm, 0, widthMm, depthMm, 0, depthMm, 0, 0]}
          stroke="black"
          strokeWidth={3}
        />
        {/* Room interior */}
        <Rect
          width={widthMm}
          height={depthMm}
          fill="lightgrey"
        />
      </Group>
    );
  };

  const createRuler = (frameWidth, frameDepth) => {
    const offset = 20;
    const arrowOffset = offset / 2;
    const arrowSize = 5;

    return (
      <Group>
        {/* Ruler lines */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(-offset, 0);
            context.moveTo(0, frameDepth);
            context.lineTo(-offset, frameDepth);
            context.moveTo(0, frameDepth);
            context.lineTo(0, frameDepth + offset);
            context.moveTo(frameWidth, frameDepth);
            context.lineTo(frameWidth, frameDepth + offset);
            context.strokeStyle = 'grey';
            context.lineWidth = 0.5;
            context.stroke();
          }}
        />

        {/* Depth arrow */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.moveTo(-arrowOffset - arrowSize, arrowSize);
            context.lineTo(-arrowOffset, 0);
            context.lineTo(-arrowOffset + arrowSize, arrowSize);
            context.moveTo(-arrowOffset, 0);
            context.lineTo(-arrowOffset, frameDepth);
            context.moveTo(-arrowOffset - arrowSize, frameDepth - arrowSize);
            context.lineTo(-arrowOffset, frameDepth);
            context.lineTo(-arrowOffset + arrowSize, frameDepth - arrowSize);
            context.strokeStyle = 'grey';
            context.lineWidth = 0.5;
            context.stroke();
          }}
        />

        {/* Width arrow */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.translate(0, frameDepth + arrowOffset);
            context.moveTo(arrowSize, -arrowSize);
            context.lineTo(0, 0);
            context.lineTo(arrowSize, arrowSize);
            context.moveTo(0, 0);
            context.lineTo(frameWidth, 0);
            context.moveTo(frameWidth - arrowSize, -arrowSize);
            context.lineTo(frameWidth, 0);
            context.lineTo(frameWidth - arrowSize, arrowSize);
            context.strokeStyle = 'grey';
            context.lineWidth = 0.5;
            context.stroke();
          }}
        />

        {/* Depth label */}
        <Label x={-arrowOffset - 40} y={frameDepth / 2}>
          <Tag fill="white" stroke="grey" />
          <Text text={`${roomDimensions.depth.toFixed(2)}m`} padding={2} fill="black" />
        </Label>

        {/* Width label */}
        <Label x={frameWidth / 2 - 20} y={frameDepth + arrowOffset}>
          <Tag fill="white" stroke="grey" />
          <Text text={`${roomDimensions.width.toFixed(2)}m`} padding={2} fill="black" />
        </Label>

        {/* Area labels */}
        <Label x={frameWidth / 2 - 40} y={frameDepth / 2 - 20}>
          <Tag fill="white" stroke="grey" />
          <Text text={`Area: ${areaSize.toFixed(2)}m²`} padding={2} fill="black" />
        </Label>
      </Group>
    );
  };

  // Calculate scale and position
  const mmWidth = roomDimensions.width * 1000;
  const mmDepth = roomDimensions.depth * 1000;
  const ratio = Math.min(stageSize.width / mmWidth, stageSize.height / mmDepth) * 0.8;
  const frameOnScreenWidth = mmWidth * ratio;
  const frameOnScreenDepth = mmDepth * ratio;
  const centerX = Math.round(stageSize.width / 2 - frameOnScreenWidth / 2) + 0.5;
  const centerY = Math.round(stageSize.height / 2 - frameOnScreenDepth / 2) + 0.5;

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Stack 
        spacing={2} 
        sx={{ 
          position: 'absolute', 
          top: 20, 
          right: 20, 
          zIndex: 1,
          backgroundColor: 'white',
          maxWidth: '40vw',
          padding: 2,
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <TextField
          type="number"
          label="Width (m)"
          value={roomDimensions.width}
          onChange={handleDimensionChange('width')}
          size="small"
          inputProps={{   
            min: 1,
            step: 0.1
          }}
        />
        <TextField
          type="number"
          label="Depth (m)"
          value={roomDimensions.depth}
          onChange={handleDimensionChange('depth')}
          size="small"
          inputProps={{ 
            min: 1,
            step: 0.1
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Area: {areaSize.toFixed(2)}m²
        </Typography>
      </Stack>
      
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          <Group x={centerX} y={centerY}>
            <Group scale={{ x: ratio, y: ratio }}>
              {createFrame(roomDimensions.width, roomDimensions.depth)}
            </Group>
            {createRuler(frameOnScreenWidth, frameOnScreenDepth)}
          </Group>
        </Layer>
      </Stage>
    </Box>
  );
};

export default RoomDesign;