import MaterialSelector from "../AssetManage/MaterialSelector";
import ModelManager from "../AssetManage/ModelsManager";
import ToggleButtons from "./ModeToggleButton";
import "../../../src/style.css";

export default function InteractiveUI(){
    return <>
    <ModelManager />
    <MaterialSelector />
    <ToggleButtons />
    </>
}