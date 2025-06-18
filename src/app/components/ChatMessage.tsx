'use client';

import { Message } from '@/types/chat';
import { formatTime } from '@/lib/utils';
import MessageContent from './MessageContent';
import { motion } from 'framer-motion';

// Modern icons
const UserIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const BotIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM20 9V7L12 2L3 7V9C3 10.1 3.9 11 5 11V16C5 17.1 5.9 18 7 18H9C10.1 18 11 17.1 11 16V13H13V16C13 17.1 13.9 18 15 18H17C18.1 18 19 17.1 19 16V11C20.1 11 21 10.1 21 9Z"/>
  </svg>
);

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export default function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group mb-6 ${isLast ? 'mb-8' : ''}`}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
            : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
        }`}>
          {isUser ? <UserIcon size={18} /> : <BotIcon size={18} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-3 max-w-none ${
            isUser 
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50' 
              : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50'
          }`}>
            <div className="text-gray-800 dark:text-gray-200">
              {!isUser ? (
                <MessageContent 
                  content={message.content} 
                  isStreaming={message.isStreaming}
                />
              ) : (
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 