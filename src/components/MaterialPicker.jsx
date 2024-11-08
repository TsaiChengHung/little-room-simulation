// src/components/MaterialPicker.jsx
import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import useSelectionStore from "./Store";
import { materials } from "./Materials";

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
  const { selectedObject, setMaterial, clearSelectedObject, isChangingRoomMaterial } =
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
      open={!!selectedObject && isChangingRoomMaterial}
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
          onClick={() => handleApplyMaterial(materials.brick)}
          fullWidth
          sx={{ mb: 1 }}
        >
          Brick
        </Button>
        <Button
          variant="contained"
          onClick={() => handleApplyMaterial(materials.concrete)}
          fullWidth
          sx={{ mb: 1 }}
        >
          Concrete
        </Button>
        <Button
          variant="contained"
          onClick={() => handleApplyMaterial(materials.dry)}
          fullWidth
          sx={{ mb: 1 }}
        >
          Dry
        </Button>
        <Button
          variant="contained"
          onClick={() => handleApplyMaterial(materials.wallpapper)}
          fullWidth
          sx={{ mb: 1 }}
        >
          Wall Papper
        </Button>
      </Box>
    </Modal>
  );
};

export default MaterialPicker;
