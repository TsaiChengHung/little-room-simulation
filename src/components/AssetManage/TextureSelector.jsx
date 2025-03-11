import React, { useState, useMemo } from 'react';
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
  const handleMaterialClick = (textureName) => {
    if (preloadedTextures[textureName]) {
      setMaterialTexture(preloadedTextures[textureName]);
    }
    clearSelectedObject(); // 清除選中的物件以防止同時進行物件選擇和材質更改
  };

  // 如果 preloadedTextures 未載入完成，顯示載入提示
  if (!preloadedTextures || Object.keys(preloadedTextures).length === 0) {
    return <div>Loading textures...</div>;
  }

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
          }}
        >
          {/* Optional texture name */}
          {/* {textureName} */}
        </Button>
      );
    });
  }, [preloadedTextures, handleMaterialClick]); // Only re-render when textures or click handler changes

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