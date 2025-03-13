import { create } from 'zustand';

interface SelectedUserState {
  selectedUser: string;
  setSelectedUser: (selectedUser: string) => void;
}

export const useSelectedUserStore = create<SelectedUserState>()(set => ({
  selectedUser: '',
  setSelectedUser: selectedUser => set(() => ({ selectedUser })),
}));
