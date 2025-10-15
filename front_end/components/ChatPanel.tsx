'use client';

import { useState, useRef, useEffect } from 'react';
import { usePlanStore } from '../store/planStore';

export default function ChatPanel() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { messages, addMessage } = usePlanStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage = input;
    setInput('');
    
    // 添加用户消息
    addMessage({ role: 'user', text: userMessage });
    
    // 添加一个空的助手消息用于流式更新
    addMessage({ role: 'assistant', text: '' });
    
    setIsStreaming(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', text: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedText += chunk;
          
          // 更新最后一条消息（助手消息）- 直接更新最后一条
          usePlanStore.setState((state) => {
            const newMessages = [...state.messages];
            const lastIndex = newMessages.length - 1;
            if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
              newMessages[lastIndex] = {
                role: 'assistant',
                text: accumulatedText,
              };
            }
            return { messages: newMessages };
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // 更新消息显示错误
      usePlanStore.setState((state) => {
        const newMessages = [...state.messages];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
          newMessages[lastIndex] = {
            role: 'assistant',
            text: '抱歉，发生了错误。请稍后重试。',
          };
        }
        return { messages: newMessages };
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto mb-3 pb-20">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-1 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <span
              className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.text || (msg.role === 'assistant' && isStreaming ? '思考中...' : '')}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 md:right-1/2 p-4 bg-white border-t">
        <div className="relative">
          <input
            type="text"
            className="w-full border rounded-full px-4 py-3 pr-24"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isStreaming) sendMessage();
            }}
            placeholder="Ask AtlasOne..."
            disabled={isStreaming}
          />
          <button
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-full ${
              isStreaming
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            onClick={sendMessage}
            disabled={isStreaming}
          >
            {isStreaming ? '发送中...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}