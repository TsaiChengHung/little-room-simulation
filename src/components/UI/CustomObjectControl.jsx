import { TransformControls } from '@react-three/drei';
import useSelectionStore from "../Store/Store";

const getObject = (objects, selectedObject) => {
  if (selectedObject && selectedObject.type === "customObject") {
    const objectArray = objects[selectedObject.object];
    return objectArray ? objectArray[objectArray.length - 1] : null;
  }
  return null;
};

const CustomObjectControl = () => {
  const { objects, selectedObject, operationMode, transformMode } = useSelectionStore();
  const isEnabled = (selectedObject && selectedObject.type === "customObject") && (operationMode === "object");

  const targetObject = getObject(objects, selectedObject);
  if (!isEnabled || !targetObject) return null;

  return (
    <TransformControls
      object={targetObject.object}
      space='local'
      mode={transformMode}
      enabled={isEnabled}
      showX={isEnabled}
      showY={isEnabled}
      showZ={isEnabled}
    />
  );
};

export default CustomObjectControl;
