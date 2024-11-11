import React, { useState } from 'react';
import { Box, Stack, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { materialTextures, materials } from './Materials';
import useSelectionStore from './Store';

// 建立自定義樣式
const useStyles = makeStyles({
  colorThumbnail: {
    width: '100px',
    height: '100px',
    cursor: 'pointer',
    margin: '10px',
    borderRadius: '8px',
    boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.3)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  container: {
    padding: '20px',
  },
});

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
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: 1,
          }}
        >
          {Object.entries(materialTextures).map(([name, texture]) => (
            <Button
              variant='contained'
              key={name}
              onClick={() => handleMaterialClick(name)}
              style={{
                backgroundImage: `url(${texture.baseColor})`,
                backgroundPosition: 'center',
                color: 'white',
                width: selectedMaterial === name ? '140px' : '130px',
                height: selectedMaterial === name ? '60px' : '50px',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: "center",
                justifyContent: 'center',
                filter: selectedMaterial === name ? 'brightness(1)' : 'brightness(0.7)',
                transition: 'all 0.1s',
              }}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
}
