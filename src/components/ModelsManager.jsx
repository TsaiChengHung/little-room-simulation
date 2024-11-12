import React from "react";
import { Box, Stack, Button, IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import AddIcon from '@mui/icons-material/Add';
import useSelectionStore from "./Store";
import items from "./ModelLoader";

// 建立自定義樣式
const useStyles = makeStyles({
  button: {
    width: "130px",
    height: "50px",
    margin: "10px",
    borderRadius: "8px",
    boxShadow: "0 3px 5px 2px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.1s ease-in-out",
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  addButton: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    backgroundColor: '#4caf50',
    color: 'white',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
});

// 模型管理 UI 組件
export default function ModelManagement() {
  const {
    selectedObject,
    selectedObjectType,
    removeModel,
    objects,
  } = useSelectionStore();
  
  const classes = useStyles();

  console.log(items.item)

  // 點擊移除模型時觸發的功能
  const handleRemoveModelClick = () => {
    if (selectedObject && selectedObjectType === "customObject" && objects[selectedObject]) {
      removeModel(selectedObject);
    }
  };

  // 點擊新增模型按鈕時觸發的功能
  const handleAddModelClick = () => {
    // 在此處添加新增模型的邏輯
    console.log('Add model button clicked');
  };

  return (
    <Box sx={{ pb: 8 }}>
      {selectedObject && selectedObjectType === "customObject" && (
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
            padding: 1,
          }}
        >
          {/* 移除模型的按鈕 */}
          <Button
            variant="contained"
            className={classes.button}
            onClick={handleRemoveModelClick}
            sx={{
              backgroundColor: "#f44336",
              color: "white",
              '&:disabled': {
                backgroundColor: '#bdbdbd',
                color: '#ffffff',
              },
            }}
          >
            Remove
          </Button>
        </Stack>
      )}

      {/* 新增模型的按鈕 */}
      <IconButton
        className={classes.addButton}
        onClick={handleAddModelClick}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
}
