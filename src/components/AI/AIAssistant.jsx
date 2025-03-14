import React, { useState, useEffect, useRef } from 'react';
import { chatWithGemini, testGeminiConnection } from '../../services/AIService';
import { executeAITextureCommand, getAvailableTextures } from '../../utils/AIModelContextProtocol';
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
  const processTextureCommand = async (userMessage) => {
    setIsLoading(true);
    
    try {
      // First try to process the user message as a texture command
      const result = await executeAITextureCommand(userMessage);
      
      if (result.success) {
        // If successfully parsed and executed texture command
        const successCount = result.details.filter(d => d.success).length;
        
        // Add AI response to conversation
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `I've successfully applied ${successCount} material changes. ${
              result.details.map(d => d.success ? 
                `Changed ${d.target === 'floor' ? 'floor' : d.target === 'ceiling' ? 'ceiling' : 'wall'} to ${d.textureName}` : 
                '').filter(Boolean).join(', ')
            }`
          }
        ]);
        
        return true; // Command handled
      }
      
      return false; // Not a valid texture command, pass to general AI handling
    } catch (error) {
      console.error("Error processing texture command:", error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Error processing texture command: ${error.message}` 
        }
      ]);
      return true; // Error occurred, but we handled it
    } finally {
      setIsLoading(false);
    }
  };

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
      const commandProcessed = await processTextureCommand(userMessage);
      
      // If not a texture command, pass to general AI handling
      if (!commandProcessed) {
        // Get available texture list for AI reference
        const availableTextures = getAvailableTextures();
        
        // Build context
        const contextPrompt = `
The user is using a 3D interior design application. Here is a list of available materials:
${JSON.stringify(availableTextures, null, 2)}

If the user wants to change room materials, you should guide them to use commands like:
"Change the floor to wood flooring" or "Change the wall to white brick" etc.

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