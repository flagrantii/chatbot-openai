'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import { Message } from '@/types/chat';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto"
    >
      <div className="min-h-full flex flex-col">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          >
            <div className="text-center max-w-4xl w-full">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Welcome to AI Chat
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
                I'm here to help you with questions, coding, creative writing, analysis, and more. 
                Start a conversation below!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 text-left max-w-3xl mx-auto">
                {[
                  { icon: '💬', text: 'Ask me anything', desc: 'Get answers to your questions' },
                  { icon: '💻', text: 'Code assistance', desc: 'Debug, explain, or write code' },
                  { icon: '✍️', text: 'Creative writing', desc: 'Stories, essays, and more' },
                  { icon: '📊', text: 'Data analysis', desc: 'Insights and explanations' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center gap-4 p-5 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {item.text}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 py-6">
            <div className="max-w-4xl mx-auto px-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
            </div>
          </div>
        )}
        
        {isLoading && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">AI is thinking...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
} 