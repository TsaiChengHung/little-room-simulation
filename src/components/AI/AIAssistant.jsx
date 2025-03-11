import React, { useState, useEffect, useRef } from 'react';
import { chatWithGemini, testGeminiConnection } from '../../services/AIService';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  // 測試 Gemini 連接
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      const result = await testGeminiConnection();
      setConnectionStatus(result.success ? 'connected' : 'failed');
      
      if (result.success) {
        setMessages([
          { 
            role: 'assistant', 
            content: 'AI 助手已連接。您可以開始詢問有關房間設計的問題。' 
          }
        ]);
      } else {
        setMessages([
          { 
            role: 'assistant', 
            content: `連接失敗: ${result.message}。請檢查 API 密鑰和網絡連接。` 
          }
        ]);
      }
    };
    
    checkConnection();
  }, []);

  // 自動滾動到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 發送消息給 Gemini
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // 添加用戶消息到對話
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // 設置加載狀態
    setIsLoading(true);
    
    try {
      // 發送請求到 Gemini
      const response = await chatWithGemini(userMessage);
      
      // 添加 AI 回覆到對話
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      // 處理錯誤
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `發生錯誤: ${error.message}。請稍後再試。` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 處理按鍵事件 (按 Enter 發送消息)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h2>AI 設計助手</h2>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'checking' && '檢查連接...'}
          {connectionStatus === 'connected' && '已連接'}
          {connectionStatus === 'failed' && '連接失敗'}
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
          placeholder="輸入您的問題或指令..."
          disabled={connectionStatus !== 'connected' || isLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || connectionStatus !== 'connected' || isLoading}
        >
          {isLoading ? '發送中...' : '發送'}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant; 