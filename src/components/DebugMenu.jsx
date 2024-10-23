import { useControls, button } from 'leva'
import { useState, useEffect } from 'react'

export const DebugMenu = () => {
    const [transformMode, setTransformMode] = useState('translate')
    const [showPerf, setShowPerf] = useState(false)

    const sunControls = useControls('Sun Control', {
      sunPositionX: {
        value: 0,
        min: -100,
        max: 100,
        step: 1,
        label: 'Sun Position X (East to West)',
      },
      sunPositionY: {
        value: 50,
        min: 0,
        max: 100,
        step: 1,
        label: 'Sun Position Y (Height)',
      },
      sunPositionZ: {
        value: 0,
        min: -100,
        max: 100,
        step: 1,
        label: 'Sun Position Z (North to South)',
      },
    })

    const transformControls = useControls('Transform Controls', {
      mode: {
        value: transformMode,
        options: ['translate', 'rotate', 'scale'],
        onChange: (value) => setTransformMode(value),
      },
    })

    const [perfControls, setPerfControls] = useControls('Performance', () => ({
        togglePerf: button(() => setShowPerf(prev => !prev))
    }))
  
    return { ...sunControls, transformMode, showPerf }
}
