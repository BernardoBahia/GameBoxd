import api from "./api";
import type { List, CreateListRequest, AddGameToListRequest } from "../types";

export const listService = {
  async createList(data: CreateListRequest): Promise<List> {
    const response = await api.post("/lists", data);
    return response.data;
  },

  async getListsByUserId(userId: string): Promise<List[]> {
    const response = await api.get(`/lists/user/${userId}`);
    return response.data;
  },

  async getListById(listId: string, userId: string): Promise<List> {
    const response = await api.get(`/lists/${listId}`, {
      params: { userId },
    });
    return response.data;
  },

  async deleteList(
    listId: string,
    userId: string
  ): Promise<{ message: string }> {
    const response = await api.delete(`/lists/${listId}`, {
      data: { userId },
    });
    return response.data;
  },

  async renameList(
    listId: string,
    userId: string,
    newName: string
  ): Promise<List> {
    const response = await api.put(`/lists/${listId}/rename`, {
      userId,
      newName,
    });
    return response.data;
  },

  async addGameToList(
    listId: string,
    data: AddGameToListRequest
  ): Promise<{ message: string }> {
    const response = await api.post(`/lists/${listId}/games`, data);
    return response.data;
  },

  async removeGameFromList(
    listId: string,
    gameId: string,
    userId: string
  ): Promise<{ message: string }> {
    const response = await api.delete(`/lists/${listId}/games/${gameId}`, {
      data: { userId },
    });
    return response.data;
  },

  async makeListPublic(listId: string, userId: string): Promise<List> {
    const response = await api.put(`/lists/${listId}/public`, {
      userId,
    });
    return response.data;
  },

  async makeListPrivate(listId: string, userId: string): Promise<List> {
    const response = await api.put(`/lists/${listId}/private`, {
      userId,
    });
    return response.data;
  },
};
