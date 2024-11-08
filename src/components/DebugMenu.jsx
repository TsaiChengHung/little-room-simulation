import { useControls, button } from 'leva'
import { useState, useEffect } from 'react'
import useSelectionStore from './Store'

export const DebugMenu = () => {
    const [showPerf, setShowPerf] = useState(false)
    const {isChangingRoomMaterial, setIsChangingRoomMaterial, clearSelectedObject} = useSelectionStore()

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
    })

    useControls('Performance', () => ({
        active: button(() => setShowPerf(prev => !prev))
    }))


    const materialControls = useControls('Room Material', {
      enableChangingMaterial: {
          value: isChangingRoomMaterial, // 從 Zustand 獲取當前的狀態
          label: 'Enable Changing Room Material',
          onChange: (value) => {setIsChangingRoomMaterial(value), clearSelectedObject()} // 更新 Zustand 的狀態
      },
  });
  

    // New Environment Control
    const environmentControls = useControls('Environment', {
        preset: {
            options: ['dawn', 'city', 'night', 'apartment', 'forest', 'lobby', 'park', 'studio', 'sunset', 'warehouse'], // Add more presets as needed
            value: 'dawn', // Default value
            label: 'Environment Preset',
        },
    });

    return { ...sunControls, showPerf, materialControls, environmentControls }
}
