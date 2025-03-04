import React from 'react';
import useSelectionStore from '../Store/Store';

export default function CustomObjects() {
    const { objects, setSelectedObject, selectedObject } = useSelectionStore();

    return (
        <>
            {Object.keys(objects).map((key) => {
                return objects[key].map((item, index) => (
                    <primitive
                        key={`${key}-${index}`} // 使用 key 和 index 组合生成唯一的 key
                        object={item.object} // 获取对象
                        position={item.transform?.translate} // 使用 transform 中的位移
                        onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            setSelectedObject(key, item.id, 'customObject'); // 更新选中的物件
                        }}
                    />
                ));
            })}
        </>
    );
}
