import React, { useState, useCallback, useEffect } from "react";
import { Box, Stack, Button, Collapse, Typography, IconButton, Drawer, CircularProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";
import AddIcon from '@mui/icons-material/Add';
import useSelectionStore from "./Store";
import { glbUrls, modelCache, preloadModel } from "./ModelLoader";
import Geometries from "three/src/renderers/common/Geometries.js";

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
  categoryButton: {
    width: "200px",
    height: "50px",
    margin: "10px",
    borderRadius: "8px",
    boxShadow: "0 3px 5px 2px rgba(0, 0, 0, 0.3)",
  },
  modelButton: {
    margin: "5px",
  },
});

// 模型管理 UI 組件
export default function ModelManagement() {
  const {
    selectedObject,
    selectedObjectType,
    removeModel,
    objects,
    addModel,
  } = useSelectionStore();
  
  const classes = useStyles();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 類別清單
  const categories = Object.keys(glbUrls);
  
  // 點擊類別時展開對應的模型列表
  const handleCategoryClick = useCallback((category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  }, [expandedCategory]);

  // 點擊移除模型時觸發的功能
  const handleRemoveModelClick = useCallback(() => {
    if (selectedObject && selectedObjectType === "customObject" && objects[selectedObject]) {
      removeModel(selectedObject);
    }
  }, [selectedObject, selectedObjectType, objects, removeModel]);

  // 點擊模型時觸發的功能
  const handleModelClick = useCallback((category, itemName) => {
    if (preloadModel(category, itemName) === "modelBeenCache") {
      const modelData = modelCache[category][itemName]
      console.log(modelData);
      console.log(objects)
    }
  }, []);

  // 點擊加號按鈕時開啟或關閉 drawer
  const handleExpandAllClick = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

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
        {/* 彈出所有類別的按鈕
        <IconButton
          onClick={handleExpandAllClick}
          sx={{
            backgroundColor: "#2196f3",
            color: "white",
            '&:hover': {
              backgroundColor: "#1976d2",
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Stack>

      顯示類別的 Drawer
      <Drawer anchor="right" open={drawerOpen} onClose={handleExpandAllClick}>
        <Box sx={{ width: 300, padding: 2 }}>
          <Typography variant="h6">選擇類別</Typography>
          {categories.map((category) => (
            <Box key={category}>
              <Button
                
                variant="contained"
                className={classes.categoryButton}
                onClick={() => handleCategoryClick(category)}
                sx={{
                  backgroundColor: "#2196f3",
                  color: "white",
                  '&:hover': {
                    backgroundColor: "#1976d2",
                  },
                  width: "100%",
                  marginBottom: 1,
                }}
              >
                {category}
              </Button>
              <Collapse in={expandedCategory === category}>
                <Stack direction="column">
                  {Object.keys(glbUrls[category]).map((itemName) => (
                    <Button
                      key={itemName}
                      variant="outlined"
                      className={classes.modelButton}
                      onClick={() => handleModelClick(category, itemName)}
                      sx={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        '&:hover': {
                          backgroundColor: "#f0f0f0",
                        },
                      }}
                    >
                      {itemName}
                    </Button>
                  ))}
                </Stack>
              </Collapse>
            </Box>
          ))}
        </Box>
      </Drawer>

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
      > */}
        {/* 移除模型的按鈕 */}
        {selectedObject && selectedObjectType === "customObject" && (
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
        )}
      </Stack>
    </Box>
  );
}
