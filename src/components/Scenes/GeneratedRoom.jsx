import useSelectionStore from "../Store/Store";
import Room from "../RoomSelector/RoomGenerator";

const GeneratedRoom = () => {
  const { currentFloorPoints } = useSelectionStore();
  
  return (
    <Room
      floorPoints={currentFloorPoints}
      wallHeight={3.6}
      useRoomData={true}
    />
  );
};

export default GeneratedRoom;
