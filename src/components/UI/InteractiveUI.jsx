import React from "react";
import ObjectsManager from "../AssetManage/ObjectsManager";
import MaterialSelector from "../AssetManage/MaterialSelector";
import ToggleButtons from "./ModeToggleButton";
import "../../../src/style.css";

import useSelectionStore from "../Store/Store";

export default function InteractiveUI() {
    const { currentScene } = useSelectionStore();

    return (
        <>
            {currentScene === "roomDesign" && (
                <>
                </>
            )}
            {currentScene === "roomSimulation" && (
                <>
                    <ObjectsManager />
                    <MaterialSelector />
                    <ToggleButtons />
                </>
            )}
        </>
    );
}