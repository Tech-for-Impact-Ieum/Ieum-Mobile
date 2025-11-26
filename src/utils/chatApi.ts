import { ApiClient } from '../services/apiClient';
import type { MediaItem } from '../types';

export const chatApi = {
  getChatRooms: async () => {
    return await ApiClient.get('/chat/rooms');
  },

  getChatRoom: async (roomId: string | number) => {
    return await ApiClient.get(`/chat/rooms/${roomId}`);
  },

  getMessages: async (roomId: string | number, currentUserId: number) => {
    return await ApiClient.get(
      `/chat/rooms/${roomId}/messages?currentUserId=${currentUserId}`
    );
  },

  sendMessage: async (
    roomId: string | number,
    text: string,
    media: MediaItem[] = []
  ) => {
    return await ApiClient.post(`/chat/rooms/${roomId}/messages`, {
      text,
      media,
    });
  },

  getSummary: async (roomId: string | number) => {
    return await ApiClient.get(`/chat/rooms/${roomId}/summary`);
  },

  generateSummary: async (roomId: string | number) => {
    return await ApiClient.post(`/chat/rooms/${roomId}/summary`);
  },

  getQuickReplies: async (roomId: string | number) => {
    return await ApiClient.get(`/chat/rooms/${roomId}/quick-replies`);
  },
};
