import GeneratedRoom from "./GeneratedRoom";
import useSelectionStore from "../Store/Store";
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
        <GeneratedRoom />
      </group>
    </>
  );
}
