import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add"

export default function AddModelButton() {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <IconButton aria-label="add" size="large">
        <AddIcon fontSize="inherit" />
      </IconButton>
    </Stack>
  );
}
