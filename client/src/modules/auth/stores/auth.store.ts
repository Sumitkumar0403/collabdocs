import { create } from 'zustand';
import { IUser } from '@/shared/types';

export interface IAuthUiState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, token: string) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('collabdocs_token');
const storedUser = localStorage.getItem('collabdocs_user');

export const useAuthStore = create<IAuthUiState>()((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  setAuth: (user, token) => {
    localStorage.setItem('collabdocs_token', token);
    localStorage.setItem('collabdocs_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('collabdocs_token');
    localStorage.removeItem('collabdocs_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
