import React, { useEffect } from 'react';
import { executeAIObjectCommand } from '../../utils/AIModelContextProtocol';
import useSelectionStore from '../Store/Store';

const TestAIPlacement = () => {
  // Add debug info on component mount
  useEffect(() => {
    const store = useSelectionStore.getState();
    console.log("Current design mode:", store.designMode);
    console.log("Room data initialized:", !!store.roomData);
    console.log("Preloaded models count:", Object.keys(store.preloadedModels || {}).length);
    console.log("Objects in room:", Object.keys(store.objects || {}).length);
  }, []);

  const handlePlaceSofa = async () => {
    try {
      const store = useSelectionStore.getState();
      console.log("Attempting to place a sofa...");
      console.log("Current design mode:", store.designMode);
      console.log("Room data initialized:", !!store.roomData);
      console.log("Room data:", store.roomData);
      console.log("Preloaded models:", store.preloadedModels);
      
      const result = await executeAIObjectCommand("Place a sofa in the center of the room");
      console.log("Result:", result);
      
      if (result.success) {
        console.log("Objects after placement:", useSelectionStore.getState().objects);
        alert("Successfully placed sofa! Check the console for details.");
      } else {
        alert(`Failed to place sofa: ${result.message}`);
      }
    } catch (error) {
      console.error("Error placing sofa:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handlePlaceLamp = async () => {
    try {
      console.log("Attempting to place a lamp...");
      const result = await executeAIObjectCommand("Put a lamp in the corner");
      console.log("Result:", result);
      
      if (result.success) {
        console.log("Objects after placement:", useSelectionStore.getState().objects);
        alert("Successfully placed lamp! Check the console for details.");
      } else {
        alert(`Failed to place lamp: ${result.message}`);
      }
    } catch (error) {
      console.error("Error placing lamp:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateModernRoom = async () => {
    try {
      console.log("Attempting to create a modern room...");
      const result = await executeAIObjectCommand("Create a modern room");
      console.log("Result:", result);
      
      if (result.success) {
        console.log("Objects after placement:", useSelectionStore.getState().objects);
        alert("Successfully created modern room! Check the console for details.");
      } else {
        alert(`Failed to create modern room: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating modern room:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSwitchToSimulationMode = () => {
    const store = useSelectionStore.getState();
    store.setDesignMode("roomSimulation");
    console.log("Switched to simulation mode");
    alert("Switched to room simulation mode");
  };

  const handleInitializeRoom = () => {
    const store = useSelectionStore.getState();
    if (!store.roomData) {
      // Create a simple room data object
      const roomData = {
        width: 10,
        length: 10,
        height: 3,
        floor: {
          area: 100,
          materialName: "default",
          textures: {}
        },
        ceiling: {
          area: 100,
          materialName: "default",
          textures: {}
        }
      };
      store.setRoomData(roomData);
      console.log("Room data initialized:", roomData);
      alert("Room data initialized");
    } else {
      console.log("Room data already exists:", store.roomData);
      alert("Room data already exists");
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px' }}>
      <h2>Test AI Furniture Placement</h2>
      <p>Click the buttons below to test placing furniture with AI commands:</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleSwitchToSimulationMode}
          style={{ padding: '10px 15px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Switch to Simulation Mode
        </button>
        
        <button 
          onClick={handleInitializeRoom}
          style={{ padding: '10px 15px', backgroundColor: '#673AB7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Initialize Room Data
        </button>
        
        <button 
          onClick={handlePlaceSofa}
          style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Place Sofa
        </button>
        
        <button 
          onClick={handlePlaceLamp}
          style={{ padding: '10px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Place Lamp
        </button>
        
        <button 
          onClick={handleCreateModernRoom}
          style={{ padding: '10px 15px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Create Modern Room
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Note: Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
};

export default TestAIPlacement; 