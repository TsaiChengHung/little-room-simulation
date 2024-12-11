import { TransformControls } from '@react-three/drei';
import useSelectionStore from "../Store/Store";

const getObject = (defaultObjects, objects, selectedObject, selectedObjectType) => {
  if (selectedObjectType === "customObject") {
    return objects[selectedObject];
  } else if (selectedObjectType === "defaultObject") {
    return defaultObjects[selectedObject];
  }
  return null;
};

const CustomObjectControl = () => {
  const { defaultObjects, objects, selectedObject, selectedObjectType, operationMode, transformMode } = useSelectionStore();
  const isEnabled = (selectedObjectType === "customObject" || selectedObjectType === "defaultObject") && (operationMode === "object");

  const targetObject = getObject(defaultObjects, objects, selectedObject, selectedObjectType);
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
