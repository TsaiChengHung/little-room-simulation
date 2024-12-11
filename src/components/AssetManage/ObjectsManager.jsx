import React, { useEffect } from "react";
import { cachedObjects } from "./ObjectsPreload";
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Card, CardContent, CardMedia, CardActionArea, Button, Stack } from "@mui/material";
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
                        width: '30vw',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: 2,
                        backdropFilter: 'blur(3px)',
                        overflowY: 'auto',
                        maxHeight: '80vh',
                        padding: 1
                    }}
                >
                    <Stack direction={'column'}
                        spacing={1}>
                        {Object.entries(objects).map(([key, object]) => (
                            <Card key={key} sx={{ maxWidth: 345, backgroundColor: 'rgba(0, 0, 0, 0.1)' }} >
                                <CardActionArea onClick={() => handleObjectSelect(key, object)}>
                                    <CardMedia
                                        component="img"
                                        image={object.info.thumbnailUrl}
                                        alt="Item Image"
                                    />
                                    <CardContent sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                        <Typography sx ={{ color: 'white' }} gutterBottom variant="h6" component="div">
                                            {object.info.name}
                                        </Typography>
                                        <Typography sx={{ color: 'darkgray' }} variant="body2" >
                                            {object.info.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>

                        ))}
                    </Stack>
                </Box>

            )}
        </>
    )
}