import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, CardMedia, CardActionArea, Stack } from "@mui/material";
import useSelectionStore from "../Store/Store";

export default function ObjectsManager() {
    const { operationMode, addObject, preloadedModels } = useSelectionStore();
    const [objectsList, setObjectsList] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 當 preloadedModels 更新時，更新本地狀態
        if (preloadedModels && Object.keys(preloadedModels).length > 0) {
            console.log("preloadedModels 已更新:", Object.keys(preloadedModels).length);
            
            // 將 preloadedModels 轉換為 UI 可用的格式
            const formattedObjects = {};
            Object.entries(preloadedModels).forEach(([key, modelData]) => {
                formattedObjects[key] = {
                    name: modelData.info?.name || key,
                    description: modelData.info?.description || '',
                    thumbnailUrl: modelData.info?.thumbnailUrl || '/placeholder.png',
                    object: modelData.object,
                    info: modelData.info
                };
            });
            
            setObjectsList(formattedObjects);
            setIsLoading(false);
        }
    }, [preloadedModels]);

    const handleObjectSelect = (key, objectData) => {
        // 添加物件到場景
        addObject('furniture', {
            name: objectData.name,
            object: objectData.object,
            description: objectData.description || '',
            transform: {
                translate: [0, 0, 0],
                rotate: [0, 0, 0],
                scale: [1, 1, 1]
            }
        });
        console.log("已添加物件:", key, objectData);
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
                            正在加載物件...
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
                        可用物件 ({Object.keys(objectsList).length})
                    </Typography>
                    
                    {Object.keys(objectsList).length === 0 ? (
                        <Typography sx={{ color: 'white', padding: 1 }}>
                            沒有可用的物件
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
                                            <Typography sx={{ color: 'darkgray' }} variant="body2" >
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