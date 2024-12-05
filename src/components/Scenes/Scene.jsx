import Room from "./Room";
import RoomGenerative from "./RoomGenerative";
import useSelectionStore from "../Store/Store";
import DefaultObjects from "./DefaultObjects";
import CustomObjects from "./CustomObjects";

export default function Scene(props) {
  const { setSelectedObject } = useSelectionStore();

  return (
    <>
      <group
        {...props}
        dispose={null}
        onPointerMissed={() => setSelectedObject(null)}
      >
        <CustomObjects />
        <DefaultObjects />
        <RoomGenerative />
      </group>
    </>
  );
}
