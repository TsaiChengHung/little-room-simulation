import { TransformControls } from '@react-three/drei';
import useSelectionStore from "../Store/Store";
import { useRef } from 'react';

const getObject = (objects, selectedObject) => {
  if (selectedObject && selectedObject.type === "customObject") {
    for (const key in objects) {
      const found = objects[key].find(item => item.id === selectedObject.objectId);
      if (found) return found.object;
    }
  }
  return null;
};

const CustomObjectControl = () => {
  const { objects, selectedObject, operationMode, transformMode, updateObjectTransform } = useSelectionStore();
  const isEnabled = (selectedObject && selectedObject.type === "customObject") && (operationMode === "object");
  
  const targetObject = getObject(objects, selectedObject);
  const isDragging = useRef(false);
  
  if (!isEnabled || !targetObject) return null;

  const handleObjectChange = (event) => {
    // 在拖曳過程中不執行任何store更新
  };

  const handleDraggingChange = (event) => {
    isDragging.current = event.value;
    
    if (!event.value) {
      const { position, rotation, scale } = targetObject;
      updateObjectTransform(selectedObject.objectId, {
        translate: [position.x, position.y, position.z],
        rotate: [rotation.x, rotation.y, rotation.z],
        scale: [scale.x, scale.y, scale.z]
      });
    }
  };

  return (
    <TransformControls
      object={targetObject}
      space='local'
      mode={transformMode}
      enabled={true}
      showX={isEnabled}
      showY={isEnabled}
      showZ={isEnabled}
      onObjectChange={handleObjectChange}
      onDraggingChange={handleDraggingChange}
    />
  );
};

export default CustomObjectControl;
