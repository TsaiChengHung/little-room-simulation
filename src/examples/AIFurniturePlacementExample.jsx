import React, { useState } from 'react';
import { executeAIObjectCommand } from '../utils/AIModelContextProtocol';

/**
 * Example component demonstrating how to use AI for furniture placement
 */
const AIFurniturePlacementExample = () => {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Example commands for quick testing
  const exampleCommands = {
    english: [
      "Place a sofa in the center of the room",
      "Put a coffee table near the sofa",
      "Add a lamp in the corner",
      "Place a bookshelf against the wall",
      "Put a dining table by the window"
    ],
    chinese: [
      "在房間中央放一張沙發",
      "把一張咖啡桌放在沙發前面",
      "在角落放一盞落地燈",
      "靠牆放一個書櫃",
      "在窗邊放一張餐桌"
    ]
  };
  
  // Handle command execution
  const handleExecuteCommand = async () => {
    if (!command.trim()) return;
    
    setIsLoading(true);
    try {
      // Execute the AI command
      const response = await executeAIObjectCommand(command);
      setResult(response);
      console.log('AI Command Result:', response);
    } catch (error) {
      console.error('Error executing AI command:', error);
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set an example command
  const setExampleCommand = (exampleCommand) => {
    setCommand(exampleCommand);
  };
  
  return (
    <div className="ai-furniture-example">
      <h1>AI Furniture Placement Example</h1>
      
      <div className="command-input">
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter a furniture placement command..."
          rows={3}
          style={{ width: '100%', padding: '10px' }}
        />
        
        <button 
          onClick={handleExecuteCommand}
          disabled={isLoading || !command.trim()}
          style={{ 
            padding: '10px 20px', 
            margin: '10px 0',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !command.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Processing...' : 'Place Furniture'}
        </button>
      </div>
      
      <div className="example-commands">
        <h3>Example Commands:</h3>
        
        <div className="command-sections">
          <div className="english-commands">
            <h4>English:</h4>
            <ul>
              {exampleCommands.english.map((cmd, index) => (
                <li key={`en-${index}`}>
                  <button 
                    onClick={() => setExampleCommand(cmd)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'blue', 
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    {cmd}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="chinese-commands">
            <h4>中文:</h4>
            <ul>
              {exampleCommands.chinese.map((cmd, index) => (
                <li key={`zh-${index}`}>
                  <button 
                    onClick={() => setExampleCommand(cmd)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'blue', 
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    {cmd}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {result && (
        <div className="result-section" style={{ marginTop: '20px' }}>
          <h3>Result:</h3>
          <div 
            className={`result-box ${result.success ? 'success' : 'error'}`}
            style={{ 
              padding: '15px', 
              backgroundColor: result.success ? '#e7f7e7' : '#f7e7e7',
              border: `1px solid ${result.success ? '#c3e6c3' : '#e6c3c3'}`,
              borderRadius: '4px'
            }}
          >
            <p><strong>Status:</strong> {result.success ? 'Success' : 'Error'}</p>
            <p><strong>Message:</strong> {result.message}</p>
            
            {result.success && result.details && (
              <div className="details">
                <h4>Placed Items:</h4>
                <ul>
                  {result.details.map((item, index) => (
                    <li key={index}>
                      {item.success ? (
                        <span>
                          Placed <strong>{item.objectName || item.objectId}</strong> at position: 
                          X: {item.position.x.toFixed(2)}, 
                          Y: {item.position.y.toFixed(2)}, 
                          Z: {item.position.z.toFixed(2)}
                        </span>
                      ) : (
                        <span className="error">
                          Failed to place {item.objectId}: {item.reason}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="code-example" style={{ marginTop: '30px' }}>
        <h3>Code Example:</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`// Import the executeAIObjectCommand function
import { executeAIObjectCommand } from '../utils/AIModelContextProtocol';

// Example of using the AI to place furniture
async function placeFurnitureWithAI() {
  try {
    // Execute an AI command to place furniture
    const result = await executeAIObjectCommand("Place a sofa in the center of the room");
    
    if (result.success) {
      console.log("Furniture placed successfully!");
      console.log("Placed items:", result.details);
    } else {
      console.error("Failed to place furniture:", result.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default AIFurniturePlacementExample; 