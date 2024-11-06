// src/components/MaterialPicker.jsx
import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import useSelectionStore from "./Store";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

const MaterialPicker = () => {
  const { selectedObject, setMaterial, clearSelectedObject, material1, material2, material3 } =
    useSelectionStore();

  const handleApplyMaterial = (material) => {
    setMaterial(material);
    clearSelectedObject(); // 關閉 UI
    console.log(`Applied material ${material} to ${selectedObject}`);
  };

  const handleClose = () => {
    clearSelectedObject(); // 關閉 UI
    console.log("MaterialPicker closed");
  };

  return (
    <Modal
      open={!!selectedObject}
      onClose={handleClose}
      aria-labelledby="material-picker-title"
      aria-describedby="material-picker-description"
    >
      <Box sx={style}>
        <Typography
          id="material-picker-title"
          variant="h6"
          component="h2"
          gutterBottom
        >
          Choose Material
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleApplyMaterial(material1)}
          fullWidth
          sx={{ mb: 1 }}
        >
          Material1
        </Button>
        <Button
          variant="contained"
          onClick={() => handleApplyMaterial(material2)}
          fullWidth
          sx={{ mb: 1 }}
        >
          Material2
        </Button>
        <Button
          variant="contained"
          onClick={() => handleApplyMaterial(material3)}
          fullWidth
        >
          Material3
        </Button>
      </Box>
    </Modal>
  );
};

export default MaterialPicker;
