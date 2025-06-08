import React, { useState, useMemo, useCallback } from 'react';
import { Box, Stack, Button } from '@mui/material';
import useSelectionStore from '../Store/Store';

export default function MaterialSelector() {
  const {
    selectedObject,
    clearSelectedObject,
    setMaterialTexture,
    operationMode,
    paintMode,
    preloadedTextures,
  } = useSelectionStore();

  // 點擊材質時觸發的功能
  const handleMaterialClick = useCallback((textureName) => {
    if (preloadedTextures[textureName] && selectedObject && selectedObject.object) {
      setMaterialTexture(selectedObject.object, textureName);
    }
    clearSelectedObject(); // Clear selected object to prevent simultaneous object selection and material change
  }, [preloadedTextures, selectedObject, setMaterialTexture, clearSelectedObject]);

  // Memoize the texture buttons
  const textureButtons = useMemo(() => {
    if (!preloadedTextures) return null;

    return Object.entries(preloadedTextures).map(([textureName, textureData]) => {
      const imageSrc = textureData.textures.map?.image?.src || '/placeholder.png';
      return (
        <Button
          variant="contained"
          key={textureName}
          onClick={() => handleMaterialClick(textureName)}
          style={{
            fontSize: '9pt',
            backgroundImage: `url(${imageSrc})`,
            backgroundPosition: 'center',
            color: 'white',
            minWidth: '80px',
            height: '80px',
            backgroundSize: 'cover',
            margin: '4px',
            position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: '3px',
            right: '3px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '1px 3px',
            borderRadius: '2px',
            fontSize: '8pt',
            color: 'rgba(255,255,255,0.7)',
          }}>
            {textureData.price || '$0.00'}
          </div>
        </Button>
      );
    });
  }, [preloadedTextures, handleMaterialClick]); // Only re-render when textures or click handler changes

  // If preloadedTextures is not fully loaded, display loading prompt
  if (!preloadedTextures || Object.keys(preloadedTextures).length === 0) {
    return <div>Loading textures...</div>;
  }

  const scene = document.querySelector('canvas')?.['__r3f']?.scene;

  return (
    <>
      {selectedObject && selectedObject.type === 'room' && operationMode === 'paint' && paintMode === 'texture' && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            padding: 1,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            maxWidth: '80vw',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 1,
          }}
        >
          {textureButtons}
        </Stack>
      )}
    </>
  );
}