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
        <Box sx={{ pb: 8 }}>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
              position: 'fixed',
              bottom: 50,
              left: 0,
              right: 0,
              zIndex: 1000,
              padding: 1,
              overflowX: 'auto', // 使按鈕在寬度超過螢幕時可以滑動
              whiteSpace: 'nowrap',
              maxWidth: '100%',
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
                  width: '130px',
                  height: '50px',
                  overflow: 'hidden', // 隱藏超出按鈕的內容
                  whiteSpace: 'normal', // 允許文字換行
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center', // 讓文字在按鈕中居中
                  transition: 'all 0.1s',
                }}
              >
                <span>{textureName}</span>
              </Button>
            ))}
          </Stack>

        </Box>
      )}
    </>
  );
}
