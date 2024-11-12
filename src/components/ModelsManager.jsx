import React, { useState } from "react";
import { Box, Stack, Button, Collapse, Typography, IconButton, Drawer } from "@mui/material";
import { makeStyles } from "@mui/styles";
import AddIcon from '@mui/icons-material/Add';
import useSelectionStore from "./Store";
import { glbUrls, GetModel } from "./ModelLoader";

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
  } = useSelectionStore();
  
  const classes = useStyles();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // 類別清單
  const categories = Object.keys(glbUrls);
  
  // 點擊類別時展開對應的模型列表
  const handleCategoryClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // 點擊移除模型時觸發的功能
  const handleRemoveModelClick = () => {
    if (selectedObject && selectedObjectType === "customObject" && objects[selectedObject]) {
      removeModel(selectedObject);
    }
  };

  // 點擊模型時觸發的功能（可以根據需求修改行為）
  const handleModelClick = (model) => {
    console.log("Selected Model:", model);
    setSelectedModel(model); // 設定選中的模型，並將其傳遞給 ModelLoader
  };

  // 點擊加號按鈕時開啟或關閉 drawer
  const handleExpandAllClick = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 點擊新增模型按鈕時觸發的功能
  const handleAddModelClick = () => {
    console.log('Add model button clicked');
    // 在此處添加新增模型的邏輯
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
        {/* 彈出所有類別的按鈕 */}
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

      {/* 顯示類別的 Drawer */}
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
                  {Object.keys(glbUrls[category]).map((model) => (
                    <Button
                      key={model}
                      variant="outlined"
                      className={classes.modelButton}
                      onClick={() => handleModelClick(model)}
                      sx={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        '&:hover': {
                          backgroundColor: "#f0f0f0",
                        },
                      }}
                    >
                      {model}
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
      >
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

      {/* 新增模型的按鈕 */}
      <IconButton
        className={classes.addButton}
        onClick={handleAddModelClick}
      >
        <AddIcon />
      </IconButton>

      {/* 模型載入組件 */}
      {selectedModel && <GetModel model={selectedModel} />}
    </Box>
  );
}
