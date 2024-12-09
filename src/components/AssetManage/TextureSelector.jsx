import React, { useState } from 'react';
import { Box, Stack, Button } from '@mui/material';
import { useTextureLoader } from './Textures';
import useSelectionStore from '../Store/Store';

// App 主組件
export default function MaterialSelector() {
  const { selectedObject, selectedObjectType, clearSelectedObject, roomMaterials, setMaterialTexture, operationMode, paintMode } = useSelectionStore();

  const [selectedTexture, setSelectedTexture] = useState(null);
  const textureBuffers = useTextureLoader();

  // 點擊材質時觸發的功能
  const handleMaterialClick = (textureName) => {
      setSelectedTexture(textureName);
      setMaterialTexture(roomMaterials[selectedObject], textureBuffers[textureName]);
      clearSelectedObject(); // 清除選中的物件以防止同時進行物件選擇和材質更改
      console.log('Selected Material:', textureName);
  };

  return (
    <>
      {selectedObject && selectedObjectType === 'room' && operationMode === 'paint' && paintMode === 'texture' && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            padding: 1,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 1
          }}
        >
          {Object.keys(textureBuffers).map((textureName) => (
            <Button
              variant='contained'
              key={textureName}
              onClick={() => handleMaterialClick(textureName)}
              style={{
                fontSize: '9pt',
                backgroundImage: `url(${textureBuffers[textureName].baseColor.image.src})`,
                backgroundPosition: 'center',
                color: 'white',
                minWidth: '80px',
                height: '80px',
                backgroundSize: 'cover',
                margin: '4px'
              }}
            >
              {textureName}
            </Button>
          ))}
        </Stack>
      )}
    </>
  );
}
