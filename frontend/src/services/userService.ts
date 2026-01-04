import api from "./api";
import type { UserStats, PublicUserProfile } from "../types";

export const userService = {
  getUserStats: async (userId: string): Promise<UserStats> => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  getUserPublicProfile: async (userId: string): Promise<PublicUserProfile> => {
    const response = await api.get(`/users/${userId}/public`);
    return response.data;
  },
};
