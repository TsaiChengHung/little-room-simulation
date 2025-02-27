import useSelectionStore from "../Store/Store";
import RoomPointsTemplate from "../RoomSelector/RoomAttributes";
import Room from "../RoomSelector/RoomGenerator";

const GeneratedRoom = () => {
  const { roomType } = useSelectionStore();
  const floorPoints = RoomPointsTemplate(roomType);
  const { roomData } = useSelectionStore();

  const floorMaterial =  roomData?.floor?.material

  return (
    <Room
      floorPoints={floorPoints}
      wallHeight={3.6}
      floorMaterial={floorMaterial}
    />
  );
};

export default GeneratedRoom;
