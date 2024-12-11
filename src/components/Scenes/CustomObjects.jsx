import useSelectionStore from "../Store/Store";

export default function CustomObjects() {
    const { objects, selectedObject, selectedObjectType, operationMode, setSelectedObject } = useSelectionStore();

    return (
        <>
            {
                Object.keys(objects).map((key, index) => {
                    const object = objects[key].object
                    return (
                        <primitive key={key} object={object} onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            setSelectedObject(key, 'customObject'); // 更新選中的物件
                            console.log(object);
                        }} />

                    )
                })
            }
        </>
    )
}
