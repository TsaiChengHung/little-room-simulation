import React, { useState, useEffect } from 'react';
import { processMCPCommand } from '../../services/MCPService';
import useSelectionStore from '../Store/Store';
import './MCPInterface.css';

/**
 * MCP 接口組件
 * 提供用戶界面來與 MCP 服務交互
 */
const MCPInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isResourcesLoaded } = useSelectionStore();
  
  // 在組件加載時檢查資源狀態
  useEffect(() => {
    const checkResources = async () => {
      try {
        const command = {
          type: 'query',
          target: 'resource'
        };
        
        const result = await processMCPCommand(command);
        
        setMessages([
          { 
            type: 'system', 
            content: `資源狀態: ${result.success ? '已加載' : '未加載'}, 模型數量: ${result.data?.modelCount || 0}, 貼圖數量: ${result.data?.textureCount || 0}` 
          }
        ]);
      } catch (error) {
        console.error("檢查資源狀態時出錯:", error);
        setMessages([
          { type: 'error', content: `檢查資源狀態時出錯: ${error.message}` }
        ]);
      }
    };
    
    checkResources();
  }, [isResourcesLoaded]);
  
  // 處理命令輸入
  const handleCommandInput = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // 嘗試解析 JSON 命令
      let command;
      try {
        command = JSON.parse(input);
      } catch (error) {
        // 如果不是有效的 JSON，則視為自然語言命令
        command = {
          type: 'query',
          target: 'resource',
          params: { text: input }
        };
      }
      
      // 添加命令到消息列表
      setMessages(prev => [
        ...prev, 
        { type: 'command', content: input }
      ]);
      
      // 處理命令
      const result = await processMCPCommand(command);
      
      // 添加結果到消息列表
      setMessages(prev => [
        ...prev, 
        { type: result.success ? 'result' : 'error', content: result }
      ]);
    } catch (error) {
      // 處理錯誤
      setMessages(prev => [
        ...prev, 
        { 
          type: 'error', 
          content: {
            success: false,
            error: `處理命令時出錯: ${error.message}`
          }
        }
      ]);
    } finally {
      setInput('');
      setIsProcessing(false);
    }
  };
  
  // 顯示幫助內容
  const showHelp = () => {
    setMessages(prev => [
      ...prev,
      {
        type: 'help',
        content: {
          title: 'MCP 命令格式',
          description: '您可以使用 JSON 格式發送命令，或者使用自然語言。',
          examples: [
            {
              description: '查詢資源狀態',
              command: JSON.stringify({ type: 'query', target: 'resource' }, null, 2)
            },
            {
              description: '查詢所有模型',
              command: JSON.stringify({ type: 'query', target: 'model' }, null, 2)
            },
            {
              description: '查詢所有貼圖',
              command: JSON.stringify({ type: 'query', target: 'texture' }, null, 2)
            },
            {
              description: '應用模型到場景',
              command: JSON.stringify({ 
                type: 'execute', 
                target: 'model',
                params: {
                  modelId: 'chair',
                  position: { x: 0, y: 0, z: 0 }
                }
              }, null, 2)
            },
            {
              description: '應用貼圖到表面',
              command: JSON.stringify({ 
                type: 'execute', 
                target: 'texture',
                params: {
                  textureId: 'wood',
                  target: 'floor'
                }
              }, null, 2)
            }
          ]
        }
      }
    ]);
  };
  
  // 顯示可用資源
  const showAvailableResources = async () => {
    setIsProcessing(true);
    
    try {
      const command = {
        type: 'query',
        target: 'resource'
      };
      
      const result = await processMCPCommand(command);
      
      // 添加結果到消息列表
      setMessages(prev => [
        ...prev, 
        { type: 'command', content: JSON.stringify(command, null, 2) },
        { type: 'result', content: result }
      ]);
      
      // 如果資源已加載，顯示模型和貼圖列表
      if (result.success && result.data.isLoaded) {
        // 查詢模型列表
        const modelsCommand = {
          type: 'query',
          target: 'model'
        };
        
        const modelsResult = await processMCPCommand(modelsCommand);
        
        // 查詢貼圖列表
        const texturesCommand = {
          type: 'query',
          target: 'texture'
        };
        
        const texturesResult = await processMCPCommand(texturesCommand);
        
        // 添加結果到消息列表
        setMessages(prev => [
          ...prev,
          { type: 'result', content: { models: modelsResult.data, textures: texturesResult.data } }
        ]);
      }
    } catch (error) {
      // 處理錯誤
      setMessages(prev => [
        ...prev, 
        { 
          type: 'error', 
          content: {
            success: false,
            error: `獲取資源時出錯: ${error.message}`
          }
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 格式化 JSON 結果
  const formatJsonResult = (content) => {
    return <pre>{JSON.stringify(content, null, 2)}</pre>;
  };
  
  return (
    <div className="mcp-interface">
      <div className="mcp-header">
        <h2>MCP 接口</h2>
        <div className="header-buttons">
          <button className="resource-button" onClick={showAvailableResources}>查看資源</button>
          <button className="help-button" onClick={showHelp}>幫助</button>
        </div>
      </div>
      
      <div className="mcp-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.type === 'command' && (
              <>
                <div className="message-header">命令:</div>
                <div className="message-content">{formatJsonResult(message.content)}</div>
              </>
            )}
            {message.type === 'result' && (
              <>
                <div className="message-header">結果:</div>
                <div className="message-content">{formatJsonResult(message.content)}</div>
              </>
            )}
            {message.type === 'error' && (
              <>
                <div className="message-header">錯誤:</div>
                <div className="message-content">{formatJsonResult(message.content)}</div>
              </>
            )}
            {message.type === 'system' && (
              <div className="message-content system">{message.content}</div>
            )}
            {message.type === 'help' && (
              <div className="message-content help">
                <h3>{message.content.title}</h3>
                <p>{message.content.description}</p>
                <div className="examples">
                  {message.content.examples.map((example, i) => (
                    <div key={i} className="example">
                      <div className="example-description">{example.description}:</div>
                      <pre className="example-command">{example.command}</pre>
                      <button 
                        className="copy-button"
                        onClick={() => setInput(example.command)}
                      >
                        使用
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mcp-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入 MCP 命令 (JSON 格式) 或自然語言..."
          disabled={isProcessing}
        />
        <button 
          onClick={handleCommandInput}
          disabled={isProcessing || !input.trim()}
        >
          {isProcessing ? '處理中...' : '發送'}
        </button>
      </div>
    </div>
  );
};

export default MCPInterface; 