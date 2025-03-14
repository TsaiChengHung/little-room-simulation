import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, CardMedia, CardActionArea, Stack } from "@mui/material";
import useSelectionStore from "../Store/Store";

export default function ObjectsManager() {
    const { operationMode, addObject, preloadedModels } = useSelectionStore();
    const [objectsList, setObjectsList] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // When preloadedModels updates, update local state
        if (preloadedModels && Object.keys(preloadedModels).length > 0) {
            console.log("preloadedModels updated:", Object.keys(preloadedModels).length);
            
            // Convert preloadedModels to UI-friendly format
            const formattedObjects = {};
            Object.entries(preloadedModels).forEach(([key, modelData]) => {
                formattedObjects[key] = {
                    name: modelData.info?.name || key,
                    description: modelData.info?.description || '',
                    thumbnailUrl: modelData.info?.thumbnailUrl || '/placeholder.png',
                    price: modelData.info?.price || 'N/A',
                    object: modelData.object,
                    info: modelData.info
                };
            });
            
            setObjectsList(formattedObjects);
            setIsLoading(false);
        }
    }, [preloadedModels]);

    const handleObjectSelect = (key, objectData) => {
        // Add object to scene
        addObject('furniture', {
            name: objectData.name,
            object: objectData.object,
            glbFile: objectData.glbFile,
            price: objectData.price,
            thumbnailUrl: objectData.thumbnailUrl,
            description: objectData.description || '',
            transform: {
                translate: [0, 0, 0],
                rotate: [0, 0, 0],
                scale: [1, 1, 1]
            }
        });
        console.log("Object added:", key, objectData);
    };

    if (isLoading) {
        return (
            <>
                {operationMode === 'object' && (
                    <Box
                        sx={{
                            minWidth: "15vw",
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                            backdropFilter: 'blur(3px)',
                            padding: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Typography sx={{ color: 'white' }}>
                            Loading objects...
                        </Typography>
                    </Box>
                )}
            </>
        );
    }

    return (
        <>
            {operationMode === 'object' && (
                <Box
                    sx={{
                        minWidth: "15vw",
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: 2,
                        backdropFilter: 'blur(3px)',
                        overflowY: 'auto',
                        maxHeight: '80vh',
                        padding: 1
                    }}
                >
                    <Typography sx={{ color: 'white', padding: 1, marginBottom: 1 }} variant="h6">
                        Furnitures: ({Object.keys(objectsList).length})
                    </Typography>
                    
                    {Object.keys(objectsList).length === 0 ? (
                        <Typography sx={{ color: 'white', padding: 1 }}>
                            No Furnitures
                        </Typography>
                    ) : (
                        <Stack direction={'column'} spacing={1}>
                            {Object.entries(objectsList).map(([key, objectData]) => (
                                <Card key={key} sx={{ maxWidth: 345, backgroundColor: 'rgba(0, 0, 0, 0.1)' }} >
                                    <CardActionArea onClick={() => handleObjectSelect(key, objectData)}>
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={objectData.thumbnailUrl}
                                            alt={objectData.name}
                                            sx={{ objectFit: 'contain', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                                        />
                                        <CardContent sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                            <Typography sx={{ color: 'white' }} gutterBottom variant="h6" component="div">
                                                {objectData.name}
                                            </Typography>
                                            <Typography sx={{ color: 'white', fontWeight: 'bold' }} variant="body2">
                                                Price: {objectData.price}
                                            </Typography>
                                            <Typography 
                                                sx={{ 
                                                    color: 'darkgray', 
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }} 
                                                variant="body2"
                                            >
                                                {objectData.description}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Box>
            )}
        </>
    );
}