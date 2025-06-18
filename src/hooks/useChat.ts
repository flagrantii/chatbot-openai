import { useState, useCallback, useEffect } from 'react';
import { Conversation, Message, ChatState } from '@/types/chat';
import { 
  getStoredConversations, 
  addConversation, 
  updateConversation,
  deleteConversation 
} from '@/lib/storage';
import { generateId } from '@/lib/utils';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const stored = getStoredConversations();
    setState(prev => ({
      ...prev,
      conversations: stored,
      currentConversationId: stored.length > 0 ? stored[0].id : null,
    }));
  }, []);

  const currentConversation = state.conversations.find(
    c => c.id === state.currentConversationId
  );

  const createConversation = useCallback((title?: string) => {
    const newConversation: Conversation = {
      id: generateId(),
      title: title || 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      conversations: [newConversation, ...prev.conversations],
      currentConversationId: newConversation.id,
    }));

    addConversation(newConversation);
    return newConversation.id;
  }, []);

  const selectConversation = useCallback((conversationId: string) => {
    setState(prev => ({
      ...prev,
      currentConversationId: conversationId,
    }));
  }, []);

  const removeConversation = useCallback((conversationId: string) => {
    setState(prev => {
      const filtered = prev.conversations.filter(c => c.id !== conversationId);
      const newCurrentId = filtered.length > 0 
        ? (conversationId === prev.currentConversationId ? filtered[0].id : prev.currentConversationId)
        : null;

      return {
        ...prev,
        conversations: filtered,
        currentConversationId: newCurrentId,
      };
    });

    deleteConversation(conversationId);
  }, []);

  const addMessage = useCallback((conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };

    setState(prev => {
      const updated = prev.conversations.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, newMessage],
            updatedAt: Date.now(),
          };
          updateConversation(updatedConv);
          return updatedConv;
        }
        return conv;
      });

      return {
        ...prev,
        conversations: updated,
      };
    });

    return newMessage.id;
  }, []);

  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<Message>) => {
    setState(prev => {
      const updated = prev.conversations.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            updatedAt: Date.now(),
          };
          updateConversation(updatedConv);
          return updatedConv;
        }
        return conv;
      });

      return {
        ...prev,
        conversations: updated,
      };
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    let conversationId = state.currentConversationId;
    
    if (!conversationId) {
      conversationId = createConversation();
    }

    // Get current conversation
    const currentConv = state.conversations.find(c => c.id === conversationId);
    const existingMessages = currentConv?.messages || [];

    // Create the new user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Add user message to state
    addMessage(conversationId, {
      role: 'user',
      content: content.trim(),
    });

    // Update conversation title if this is the first message
    if (existingMessages.length === 0) {
      setState(prev => {
        const updated = prev.conversations.map(conv => {
          if (conv.id === conversationId) {
            const title = content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : '');
            const updatedConv = { ...conv, title, updatedAt: Date.now() };
            updateConversation(updatedConv);
            return updatedConv;
          }
          return conv;
        });
        return { ...prev, conversations: updated };
      });
    }

    // Add assistant message placeholder
    const assistantMessageId = addMessage(conversationId, {
      role: 'assistant',
      content: '',
      isStreaming: true,
    });

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Build the complete message history including the new user message
      const messagesToSend = [...existingMessages, userMessage];
      
      // Debug logging
      console.log('Sending messages to API:', messagesToSend.map(m => ({ role: m.role, content: m.content })));
      
      let fullResponse = '';
      
      // Send request to the API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
            
            const jsonStr = trimmedLine.slice(6);
            
            try {
              const data = JSON.parse(jsonStr);
              console.log('Received SSE data:', data);
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.done) {
                console.log('Stream completed');
                break;
              }
              
              if (data.content) {
                console.log('Received content chunk:', data.content);
                fullResponse += data.content;
                updateMessage(conversationId, assistantMessageId, {
                  content: fullResponse,
                  isStreaming: true,
                });
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE chunk:', jsonStr);
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Mark as complete
      updateMessage(conversationId, assistantMessageId, {
        content: fullResponse,
        isStreaming: false,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      console.error('OpenAI API Error:', error);
      
      updateMessage(conversationId, assistantMessageId, {
        content: `Error: ${errorMessage}`,
        isStreaming: false,
      });

      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.currentConversationId, state.isLoading, state.conversations, createConversation, addMessage, updateMessage]);

  return {
    conversations: state.conversations,
    currentConversation,
    isLoading: state.isLoading,
    error: state.error,
    createConversation,
    selectConversation,
    removeConversation,
    sendMessage,
  };
} 