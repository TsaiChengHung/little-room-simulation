import { Slider, styled, Stack } from '@mui/material'
import useSelectionStore from '../Store/Store'
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const StyledSlider = styled(Slider)({
  width: 200,
  color: '#fff',
  '& .MuiSlider-thumb': {
    backgroundColor: '#fff',
  },
  '& .MuiSlider-track': {
    backgroundColor: '#fff',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
})

function SunPositionSlider() {
  const sunPosition = useSelectionStore((state) => state.sunPosition)
  const setSunPosition = useSelectionStore((state) => state.setSunPosition)

  return (
    <Stack 
      direction="row" 
      spacing={1} 
      alignItems="center"
      sx={{
        background: 'rgba(0,0,0,0.5)',
        padding: '3px 10px',
        borderRadius: '8px',
      }}
    >
      <WbSunnyIcon sx={{ 
        color: '#fff',
        fontSize: '1.2rem'
      }} />
      <StyledSlider
        value={sunPosition}
        onChange={(_, value) => setSunPosition(value)}
        min={0}
        max={1}
        step={0.001}
        aria-label="Sun position"
      />
    </Stack>
  )
}

export default SunPositionSlider
