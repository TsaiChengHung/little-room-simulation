import Room from "./Room";
import DefaultItems from "./DefaultItems";
import useSelectionStore from "../Store/Store";
import { RobinBird } from "../../items/RobinBird";

export function Scene(props) {
  const {
    setSelectedObject,
    selectedObject,
    selectedObjectType,
    AddToObjects,
    objects,
  } = useSelectionStore();

  return (
    <>
      <group
        {...props}
        dispose={null}
        onPointerMissed={() => setSelectedObject(null, null)}
      >
        <DefaultItems />
        <Room />
        <RobinBird position={[-0.2, 3, 0.2]} rotation={[0, -0.4, 0]} />
      </group>
    </>
  );
}
