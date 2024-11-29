import MaterialSelector from "../AssetManage/MaterialSelector";
import ItemManager from "../AssetManage/ItemManager";
import ToggleButtons from "./ModeToggleButton";
import "../../../src/style.css";

export default function InteractiveUI(){
    return <>
    <ItemManager />
    <MaterialSelector />
    <ToggleButtons />
    </>
}