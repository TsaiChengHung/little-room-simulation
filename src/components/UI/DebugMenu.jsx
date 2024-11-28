import { useControls, button } from 'leva'
import { useState, useEffect } from 'react'
import useSelectionStore from '../Store/Store'

export const DebugMenu = () => {
    const [showPerf, setShowPerf] = useState(false)
    const {operationMode, clearSelectedObject} = useSelectionStore()

    const sunControls = useControls('Sun Control', {
      sunPositionX: {
        value: 0,
        min: -180,
        max: 180,
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
    }, {collapsed: true});

    useControls('Performance', () => ({
        active: button(() => setShowPerf(prev => !prev))
    }), {collapsed: true})

    // New Environment Control
    const environmentControls = useControls('Environment', {
        preset: {
            options: ['dawn', 'city', 'night', 'apartment', 'forest', 'lobby', 'park', 'studio', 'sunset', 'warehouse'], // Add more presets as needed
            value: 'dawn', // Default value
            label: 'Environment Preset',
        },
    }, {collapsed: true});

    return { ...sunControls, showPerf, environmentControls }
}
