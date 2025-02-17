import { Root, Container } from "@react-three/uikit";
import { OrbitControls } from "@react-three/drei";

export default function RoomSelector() {
  return (
    <>
    <OrbitControls />
    <Root backgroundColor="red" sizeX={4} sizeY={4} flexDirection="row">
      <Container flexGrow={1} margin={32} backgroundColor="green" />
      <Container flexGrow={1} margin={32} backgroundColor="blue" />
    </Root>
    </>
  );
}
