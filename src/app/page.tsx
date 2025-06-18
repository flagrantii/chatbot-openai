'use client';

import { useState, useEffect } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatContainer from './components/ChatContainer';
import ChatInput from './components/ChatInput';
import { useChat } from '@/hooks/useChat';
import { MessageSquare, Plus } from 'lucide-react';

export default function AIChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Show sidebar by default on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const {
    conversations,
    currentConversation,
    isLoading,
    error,
    createConversation,
    selectConversation,
    removeConversation,
    sendMessage,
  } = useChat();

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleCreateConversation = () => {
    createConversation();
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={handleCreateConversation}
        onDeleteConversation={removeConversation}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors lg:hidden"
                aria-label="Toggle sidebar"
              >
                <MessageSquare size={24} />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {currentConversation?.title || 'AI Chat Assistant'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Powered by AI • Ready to help
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateConversation}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              New Chat
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 relative">
          <ChatContainer
            messages={currentConversation?.messages || []}
            isLoading={isLoading}
          />
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={false}
        />

        {/* Error Display */}
        {error && (
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-3 rounded-xl shadow-lg z-50 max-w-md text-center">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
