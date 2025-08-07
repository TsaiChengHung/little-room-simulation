import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import useSelectionStore from '../Store/Store'

function SunPosition() {
  const sunPosition = useSelectionStore((state) => state.sunPosition)

  const calculateSunPosition = () => {
    const angle = THREE.MathUtils.lerp(-Math.PI / 2, Math.PI / 2, sunPosition)
    const radius = 10
    return [
      Math.sin(angle) * radius,
      Math.abs(Math.cos(angle)) * radius,
      -3
    ]
  }

  const calculateLightColor = () => {
    const timeOfDay = Math.abs(sunPosition - 0.5) * 2
    const noonColor = new THREE.Color(0xFFFFFF)
    const sunsetColor = new THREE.Color(0xFDB777) // Softer golden-orange color
    const currentColor = noonColor.lerp(sunsetColor, timeOfDay)
    return currentColor
  }

  const sunPos = calculateSunPosition()
  const lightColor = calculateLightColor()

  return (
    <>
      <Sky
        sunPosition={sunPos}
        turbidity={5.5}
        rayleigh={2.2}
        mieDirectionalG={0.8}
      />
      <directionalLight 
        position={sunPos}
        intensity={Math.max(1, Math.cos((sunPosition - 1) * Math.PI))}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color={lightColor}
      />
      <ambientLight 
        intensity={0.2} 
        color={lightColor} 
      />
    </>
  )
}

export default SunPosition