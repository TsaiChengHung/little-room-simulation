import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import useSelectionStore from "../Store/Store";

export default function DefaultObjects() {
    const { scene } = useGLTF("/cozy_home_items_t_b.glb");
    const {
        setSelectedObject,
        selectedObject,
        selectedObjectType,
        AddToDefaultObjects,
        defaultObjects,
        operationMode,
    } = useSelectionStore();

    useEffect(() => {
        const items = scene.children;

        items.forEach((item) => {
            const key = item.name
            if (item.type === 'Group') {
                item.children.forEach((child) => {
                    child.castShadow = true
                    child.receiveShadow = true
                })}
            if (item.type === 'Mesh') {
                item.castShadow = true
                item.receiveShadow = true
            }
            AddToDefaultObjects(key, item);
        });
    }, []);

    return (
        <>
            {Object.keys(defaultObjects).map((key, index) => {
                const object = defaultObjects[key]
                return (
                        <primitive key={key} object={object} onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            setSelectedObject(key, 'defaultObject'); // 更新選中的物件
                        }} />
                )
            })}
        </>
    )
}

useGLTF.preload("/cozy_home_items_t_b.glb");