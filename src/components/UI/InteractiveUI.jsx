import ObjectsManager from "../AssetManage/ObjectsManager";
import MaterialSelector from "../AssetManage/MaterialSelector";
import ToggleButtons from "./ModeToggleButton";
import "../../../src/style.css";

export default function InteractiveUI() {
    return (
        <>
            <ObjectsManager />
            <MaterialSelector />
            <ToggleButtons />
        </>
    );
}