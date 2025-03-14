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

  // 增加處理材質指令的功能
  const processTextureCommand = async (userMessage) => {
    setIsLoading(true);
    
    try {
      // 首先嘗試將用戶消息作為材質指令處理
      const result = await executeAITextureCommand(userMessage);
      
      if (result.success) {
        // 如果成功解析並執行了材質指令
        const successCount = result.details.filter(d => d.success).length;
        
        // 添加AI回覆到對話
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `我已成功應用了${successCount}個材質變更。${
              result.details.map(d => d.success ? 
                `將${d.target === 'floor' ? '地板' : d.target === 'ceiling' ? '天花板' : '牆壁'}改為${d.textureName}` : 
                '').filter(Boolean).join('，')
            }`
          }
        ]);
        
        return true; // 指令已處理
      }
      
      return false; // 不是有效的材質指令，交給通用AI處理
    } catch (error) {
      console.error("處理材質指令時出錯:", error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `處理材質指令時出錯: ${error.message}` 
        }
      ]);
      return true; // 出錯了，但我們已經處理了
    } finally {
      setIsLoading(false);
    }
  };

  // 修改發送消息的函數
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // 添加用戶消息到對話
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // 設置加載狀態
    setIsLoading(true);
    
    try {
      // 首先嘗試作為材質指令處理
      const commandProcessed = await processTextureCommand(userMessage);
      
      // 如果不是材質指令，交給通用AI處理
      if (!commandProcessed) {
        // 獲取可用材質列表，以便AI參考
        const availableTextures = getAvailableTextures();
        
        // 構建上下文
        const contextPrompt = `
用戶正在使用一個3D室內設計應用程序，以下是可用的材質列表：
${JSON.stringify(availableTextures, null, 2)}

如果用戶想要更改房間的材質，你應該指導他們使用如下格式的指令：
"將地板改為木地板" 或 "將牆壁改為白色磚塊" 等。

用戶的問題或請求是：${userMessage}
        `;
        
        // 發送請求到 Gemini
        const response = await chatWithGemini(contextPrompt);
        
        // 添加 AI 回覆到對話
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
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