import React from "react";
import { Box, Stack, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import useSelectionStore from "./Store";

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
});

// 模型管理 UI 組件
export default function ModelManagement() {
  const {
    selectedObject,
    selectedObjectType,
    removeModel,
    objects,
    setObjects,
  } = useSelectionStore();
  
  const classes = useStyles();

  // 點擊移除模型時觸發的功能
  const handleRemoveModelClick = () => {
    if (!selectedObject || selectedObjectType !== "customObject") return;
    if (objects[selectedObject]) {
      removeModel(selectedObject);
      console.log("Removed Model:", selectedObject);
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
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
          disabled={!selectedObject || selectedObjectType !== "customObject"}
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
    </Box>
  );
}
