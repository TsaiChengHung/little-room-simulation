import useSelectionStore from "../Store/Store";
import RoomPointsTemplate from "../RoomSelector/RoomAttributes";
import Room from "../RoomSelector/RoomGenerator";

const GeneratedRoom = () => {
  const { roomType, roomData } = useSelectionStore();
  const floorPoints = RoomPointsTemplate(roomType);

  return (
    <Room
      floorPoints={floorPoints}
      wallHeight={3.6}
      useRoomData={true}
    />
  );
};

export default GeneratedRoom;
