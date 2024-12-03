import { useEffect } from "react";
import { cachedObjects } from "./ObjectsPreload";
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import useSelectionStore from "../Store/Store";

export default function ObjectsManager() {

    const { operationMode, addObject } = useSelectionStore();

    let objects = cachedObjects

    useEffect(() => {
        objects = cachedObjects
        console.log("cachedObjects:", cachedObjects);
    }, [cachedObjects]);

    const handleObjectSelect = (key, object) => {
        addObject(key, object);
        console.log(key, object);
    };

    return (
        <>
            {operationMode === 'object' && (
                <Box
                    sx={{
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        height: '100vh',
                        width: '15vw',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(3px)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        overflowY: 'auto',
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary">
                            Click an item below to add it to your scene
                        </Typography>
                    </Box>
                    <List>
                        {Object.entries(objects).map(([key, object]) => (
                            <ListItem key={key} disablePadding>
                                <ListItemButton>
                                    <ListItemText primary={key} onClick={() => handleObjectSelect(key, object)} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

            )}
        </>
    )
}