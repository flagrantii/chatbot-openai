import { Conversation } from '@/types/chat';

const STORAGE_KEY = 'ai-chatbot-conversations';

export function getStoredConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading conversations from storage:', error);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations to storage:', error);
  }
}

export function addConversation(conversation: Conversation): void {
  const conversations = getStoredConversations();
  conversations.unshift(conversation);
  saveConversations(conversations);
}

export function updateConversation(updatedConversation: Conversation): void {
  const conversations = getStoredConversations();
  const index = conversations.findIndex(c => c.id === updatedConversation.id);
  
  if (index !== -1) {
    conversations[index] = updatedConversation;
    saveConversations(conversations);
  }
}

export function deleteConversation(conversationId: string): void {
  const conversations = getStoredConversations();
  const filtered = conversations.filter(c => c.id !== conversationId);
  saveConversations(filtered);
}

export function clearAllConversations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
} 