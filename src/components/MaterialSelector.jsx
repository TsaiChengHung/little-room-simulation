import React, { useState } from 'react';
import { Box, Stack, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { materialTextures, materials } from './Materials';
import useSelectionStore from './Store';



// App 主組件
export default function App() {
  const { selectedObject, selectedObjectType, clearSelectedObject, setMaterial, enableChangingRoomMaterial } = useSelectionStore();

  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // 點擊材質時觸發的功能
  const handleMaterialClick = (materialName) => {
    if (selectedMaterial === materialName) {
      setSelectedMaterial(null);
      setMaterial(null);
    } else {
      setSelectedMaterial(materialName);
      setMaterial(materials[materialName]);
      clearSelectedObject(); // 清除選中的物件以防止同時進行物件選擇和材質更改
      console.log('Selected Material:', materialName);
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* 檢查選中物件的類型是房間，並且允許更改房間材質時顯示材質選擇面板 */}
      {selectedObject && selectedObjectType === 'room' && enableChangingRoomMaterial && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: 1,
            overflowX: 'auto', // 使按鈕在寬度超過螢幕時可以滑動
            maxWidth: '100%',
          }}
        >
          {Object.entries(materialTextures).map(([name, texture]) => (
            <Button
              variant='contained'
              key={name}
              onClick={() => handleMaterialClick(name)}
              style={{
                fontSize: '9pt',
                backgroundImage: `url(${texture.baseColor})`,
                backgroundPosition: 'center',
                color: 'white',
                width: selectedMaterial === name ? '140px' : '130px',
                height: selectedMaterial === name ? '60px' : '50px',
                overflow: 'hidden', // 隱藏超出按鈕的內容
                whiteSpace: 'normal', // 允許文字換行
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center', // 讓文字在按鈕中居中
                filter: selectedMaterial === name ? 'brightness(1)' : 'brightness(0.7)',
                transition: 'all 0.1s',
              }}
            >
              <span style={{ wordBreak: 'break-word' }}>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
}
