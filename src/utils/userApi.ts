import { ApiClient } from '../services/apiClient';

export const userApi = {
  getFriends: async () => {
    return await ApiClient.get('/friends');
  },

  removeFriend: async (friendId: number) => {
    return await ApiClient.delete(`/friends/${friendId}`);
  },
};
