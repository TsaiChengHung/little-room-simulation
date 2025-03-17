import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatWithGemini, testGeminiConnection } from '../../services/AIService';
import { executeAITextureCommand, executeAIObjectCommand, getAvailableTextures, applyColdRoomStyle, applyRoomPreset } from '../../utils/AIModelContextProtocol';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  // Test Gemini connection
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      const result = await testGeminiConnection();
      setConnectionStatus(result.success ? 'connected' : 'failed');
      
      if (result.success) {
        setMessages([
          { 
            role: 'assistant', 
            content: 'AI Assistant connected. You can start asking questions about room design.' 
          }
        ]);
      } else {
        setMessages([
          { 
            role: 'assistant', 
            content: `Connection failed: ${result.message}. Please check API key and network connection.` 
          }
        ]);
      }
    };
    
    checkConnection();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to process texture commands
  const processTextureCommand = useCallback(async (userMessage) => {
    setIsLoading(true);
    
    try {
      console.log("Processing texture command:", userMessage);
      
      // Check for cold room command specifically
      const coldRoomKeywords = ['冷調', '冷色調', '冷色', '寒冷', '冷房', '讓房間更冷', '冷的房間'];
      const isColdRoomCommand = coldRoomKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword.toLowerCase())
      );
      
      let result;
      
      if (isColdRoomCommand) {
        // Apply cold room style directly
        result = await applyColdRoomStyle();
      } else {
        // First try to process the user message as a texture command
        result = await executeAITextureCommand(userMessage);
      }
      
      if (result.success) {
        // If successfully parsed and executed texture command
        const successCount = result.details.filter(d => d.success).length;
        const failCount = result.details.length - successCount;
        
        console.log("Command execution result:", result);
        
        // Construct detailed feedback message
        let feedbackMessage = `我已經`;
        
        if (result.style) {
          feedbackMessage += `套用了${result.style}風格，`;
        }
        
        feedbackMessage += `成功更改了${successCount}個材質`;
        
        if (failCount > 0) {
          feedbackMessage += `，但有${failCount}個材質變更失敗`;
        }
        
        // Add style description if available
        if (result.description) {
          feedbackMessage += `。\n\n${result.description}`;
        }
        
        // Add details about successful changes
        const successDetails = result.details
          .filter(d => d.success)
          .map(d => {
            const targetName = d.target === 'floor' ? '地板' : 
                            d.target === 'ceiling' ? '天花板' : 
                            d.target.startsWith('wall') ? '牆壁' : d.target;
            
            // Include description if available
            if (d.description) {
              return `${targetName}變更為${d.textureName}（${d.description}）`;
            } else {
              return `${targetName}變更為${d.textureName}`;
            }
          })
          .join('，\n');
        
        if (successDetails) {
          feedbackMessage += `。\n\n具體變更：\n${successDetails}`;
        }
        
        // Add AI response to conversation
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: feedbackMessage
          }
        ]);
        
        return true; // Command handled
      }
      
      console.log("Command not handled as texture command, result:", result);
      return false; // Not a valid texture command, pass to general AI handling
    } catch (error) {
      console.error("Error processing texture command:", error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `處理材質命令時發生錯誤：${error.message}。請再試一次或使用不同的表達方式。` 
        }
      ]);
      return true; // Error occurred, but we handled it
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to process object placement commands
  const processObjectCommand = useCallback(async (userMessage) => {
    setIsLoading(true);
    
    try {
      console.log("Processing object placement command:", userMessage);
      
      // Check for room preset keywords
      const presetKeywords = {
        "modern room": "現代簡約",
        "industrial room": "工業風格",
        "scandinavian room": "北歐風格",
        "現代房間": "現代簡約",
        "工業房間": "工業風格",
        "北歐房間": "北歐風格"
      };
      
      let isPresetCommand = false;
      let presetStyle = "";
      
      // Check if command matches any preset keywords
      for (const [keyword, style] of Object.entries(presetKeywords)) {
        if (userMessage.toLowerCase().includes(keyword.toLowerCase())) {
          isPresetCommand = true;
          presetStyle = style;
          break;
        }
      }
      
      let result;
      
      if (isPresetCommand) {
        // Apply room preset
        result = await applyRoomPreset(presetStyle);
      } else {
        // Process as regular object placement command
        result = await executeAIObjectCommand(userMessage);
      }
      
      if (result.success) {
        // If successfully parsed and executed object command
        const successCount = result.details.filter(d => d.success).length;
        const failCount = result.details.length - successCount;
        
        console.log("Command execution result:", result);
        
        // Construct detailed feedback message
        let feedbackMessage = `I have `;
        
        if (result.style) {
          feedbackMessage += `set up the room in ${result.style} style, `;
        }
        
        feedbackMessage += `successfully placed ${successCount} object${successCount !== 1 ? 's' : ''}`;
        
        if (failCount > 0) {
          feedbackMessage += `, but ${failCount} object placement${failCount !== 1 ? 's' : ''} failed`;
        }
        
        // Add details about successful placements
        const successDetails = result.details
          .filter(d => d.success)
          .map(d => `${d.objectName}`)
          .join(', ');
        
        if (successDetails) {
          feedbackMessage += `.\n\nPlaced objects: ${successDetails}`;
        }
        
        // Add AI response to conversation
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: feedbackMessage
          }
        ]);
        
        return true; // Command handled
      }
      
      console.log("Command not handled as object command, result:", result);
      return false; // Not a valid object command, pass to general AI handling
    } catch (error) {
      console.error("Error processing object command:", error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Error processing object placement command: ${error.message}. Please try again or use different wording.` 
        }
      ]);
      return true; // Error occurred, but we handled it
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Modified send message function
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to conversation
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // First try to process as texture command
      let commandProcessed = await processTextureCommand(userMessage);
      
      // If not a texture command, try to process as object placement command
      if (!commandProcessed) {
        commandProcessed = await processObjectCommand(userMessage);
      }
      
      // If not a texture or object command, pass to general AI handling
      if (!commandProcessed) {
        // Get available textures and objects for AI reference
        const availableTextures = getAvailableTextures();
        // Assume there's a similar function for objects
        // const availableObjects = getAvailableObjects();
        
        // Build context
        const contextPrompt = `
The user is using a 3D interior design application. Here is a list of available materials:
${JSON.stringify(availableTextures, null, 2)}

If the user wants to change room materials, they can use commands like:
"Change the floor to wood flooring" or "Change the wall to white brick"

If the user wants to place furniture, they can use commands like:
"Place a sofa in the center of the room" or "Put a lamp in the corner"

The user's question or request is: ${userMessage}
        `;
        
        // Send request to Gemini
        const response = await chatWithGemini(contextPrompt);
        
        // Add AI response to conversation
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      // Handle errors
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Error occurred: ${error.message}. Please try again later.` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key events (press Enter to send message)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h2>AI Design Assistant</h2>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'checking' && 'Checking connection...'}
          {connectionStatus === 'connected' && 'Connected'}
          {connectionStatus === 'failed' && 'Connection failed'}
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your question or command..."
          disabled={connectionStatus !== 'connected' || isLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || connectionStatus !== 'connected' || isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant; 