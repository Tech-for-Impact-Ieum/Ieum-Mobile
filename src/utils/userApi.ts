import { ApiClient } from '../services/apiClient';

export const userApi = {
  getFriends: async () => {
    return await ApiClient.get('/friends');
  },

  removeFriend: async (friendId: number) => {
    return await ApiClient.delete(`/friends/${friendId}`);
  },

  searchUsers: async (query: string) => {
    return await ApiClient.get(`/friends/search?query=${encodeURIComponent(query)}`);
  },

  addFriend: async (friendId: number) => {
    return await ApiClient.post('/friends', { friendId });
  },
};
