import { useGLTF } from "@react-three/drei";
import CustomPivotControls from "../UI/CustomPivotcontrol";
import { useEffect } from "react";
import useSelectionStore from "../Store/Store";

export default function DefaultItems() {
    const { scene } = useGLTF("/cozy_home_items_t_b.glb");
    const {
        setSelectedObject,
        selectedObject,
        selectedObjectType,
        AddToObjects,
        objects,
    } = useSelectionStore();

    useEffect(() => {
        const items = scene.children;

        items.forEach((item) => {
            const key = item.name
            AddToObjects(key, item);
        });
    }, []);

    return (
        <>
            {Object.keys(objects).map((key, index) => {
                const object = objects[key]
                return (
                    <CustomPivotControls
                        key={key}
                        isVisible={selectedObject === key && selectedObjectType === 'customObject'}
                    >
                        <primitive object={object} onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            setSelectedObject(key, 'customObject'); // 更新選中的物件
                        }} />
                    </CustomPivotControls>
                )
            })}
        </>
    )
}

useGLTF.preload("/cozy_home_items_t_b.glb");