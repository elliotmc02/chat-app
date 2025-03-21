import { create } from 'zustand';
import { Chat } from '@/types';

interface SelectedChatState {
  selectedChat: Chat;
  setSelectedChat: (selectedChat: Chat) => void;
}

export const useSelectedChatStore = create<SelectedChatState>()(set => ({
  selectedChat: { id: '', type: 'global' },
  setSelectedChat: selectedChat => set(() => ({ selectedChat })),
}));
