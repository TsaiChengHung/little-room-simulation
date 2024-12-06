import React from "react";
import ObjectsManager from "../AssetManage/ObjectsManager";
import TextureSelector from "../AssetManage/TextureSelector";
import ToggleButtons from "./ModeToggleButton";
import "../../../src/style.css";
import DesignModeToggle from './DesignModeToggle';
import useSelectionStore from "../Store/Store";

export default function InteractiveUI() {
    const { designMode } = useSelectionStore();

    return (
        <>
            {designMode === "roomDesign" && (
                <>
                    <DesignModeToggle />
                </>
            )}
            {designMode === "roomSimulation" && (
                <>
                    <DesignModeToggle />
                    <ObjectsManager />
                    <TextureSelector />
                    <ToggleButtons />
                </>
            )}
        </>
    );
}