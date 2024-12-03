import React from 'react';
import { PivotControls, Html } from '@react-three/drei';
import { IconButton } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import useSelectionStore from "../Store/Store";

const CustomObjectControl = ({
  isVisible,
  scale = 0.5,
  children,
}) => {
  const { removeObject, removeDefaultObject, selectedObject, selectedObjectType } = useSelectionStore();
  const object = children.props.object;
  const key = object.name;

  const handleRemove  = (e) => {
    e.stopPropagation();
    if (selectedObjectType === "customObject") {
      removeObject(selectedObject);
    }
    else if (selectedObjectType === "defaultObject") {
      removeDefaultObject(selectedObject);
    }
  };

  return (
    <PivotControls
      visible={isVisible}
      enabled={isVisible}
      anchor={[0, 0, 0]}
      scale={scale}
      autoTransform
      //disableScaling
      annotations
      depthTest={false}
    >
      {children}
      {isVisible && (
        <Html position={object.position}>
          <IconButton
            onClick={handleRemove}
            sx={{
              backgroundColor: 'red',
              color: 'white',
              width: '24px',
              height: '24px',
              minWidth: '24px',
              padding: '2px',
              '&:hover': {
                backgroundColor: '#ff3333',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '16px',
              }
            }}
          >
            <CloseRounded />
          </IconButton>
        </Html>
      )}
    </PivotControls>
  );
};

export default CustomObjectControl;
