// Not yet has this use case, preserver for future

import { cachedObjects } from "./ObjectsPreload";
import useSelectionStore from "../Store/Store";
import { useEffect } from "react";

export default function DefaultObjects() {
    const { addObject } = useSelectionStore();

    useEffect(() => {
        cachedObjects["arm_chair"].object.position.set(1, 0, 0);
        addObject("arm_chair", cachedObjects["arm_chair"]);

    }, []);

    return (
        <></>
    )
}
