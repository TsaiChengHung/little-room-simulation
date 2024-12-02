import useSelectionStore from "../Store/Store";
import CustomObjectControl from "../UI/CustomObjectControl";

export default function CustomObjects() {
    const { objects,selectedObject, selectedObjectType, operationMode, setSelectedObject } = useSelectionStore();

    return (
        <>
        {
            Object.keys(objects).map((key, index) => {
                const object = objects[key]
                return (
                    <CustomObjectControl
                        key={key}
                        isVisible={selectedObject === key && selectedObjectType === 'customObject' && operationMode === 'object'}
                    >
                        <primitive object={object} onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            setSelectedObject(key, 'customObject'); // 更新選中的物件
                            console.log(object);
                        }} />
                    </CustomObjectControl>
                )
            })
        }
        </>
    );
}