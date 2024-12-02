import { useEffect } from "react";
import { cachedObjects } from "./ObjectsPreload";
import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
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
                        width: '20vw',
                        bgcolor: 'background.paper',
                        borderLeft: '1px solid #ddd',
                        overflowY: 'auto',
                    }}
                >
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