'use client';

import { Conversation } from '@/types/chat';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  isOpen,
  onToggle
}: ChatSidebarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === conversationId) {
      onDeleteConversation(conversationId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(conversationId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed left-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-50 lg:static lg:w-72 lg:flex lg:flex-col lg:h-full ${
          isOpen ? 'lg:translate-x-0' : 'lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  AI Chat
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your conversations
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={onCreateConversation}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              <span className="font-medium">New Chat</span>
            </motion.button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-3">
            <AnimatePresence>
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`group relative mb-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    conversation.id === currentConversationId
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-md'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-2 border-transparent'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mt-0.5">
                      <MessageSquare size={14} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm mb-1">
                        {conversation.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span>{conversation.messages.length} messages</span>
                        <span>•</span>
                        <span>{formatRelativeTime(conversation.updatedAt)}</span>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={(e) => handleDelete(conversation.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${
                        deleteConfirm === conversation.id
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 opacity-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                  
                  {deleteConfirm === conversation.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-red-200 dark:border-red-800"
                    >
                      <div className="text-xs text-red-600 dark:text-red-400 text-center">
                        Click again to confirm deletion
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {conversations.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-12 px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} className="opacity-50" />
                </div>
                <p className="font-medium mb-1">No conversations yet</p>
                <p className="text-sm opacity-75">Start your first chat above</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
} 