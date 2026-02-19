import { apiFetch } from "@/services/api";
import type { List } from "@/types/lists";

export const listsService = {
  getLists(token?: string) {
    return apiFetch<List[]>("/lists", {
      token,
    });
  },
  createList(params: { name: string; userId: string }, token?: string) {
    return apiFetch<List>("/lists", {
      method: "POST",
      body: JSON.stringify(params),
      token,
    });
  },
  getListById(listId: string, token?: string) {
    return apiFetch<List>(`/lists/${listId}`, {
      token,
    });
  },
  updateList(
    listId: string,
    params: { name?: string; isPublic?: boolean },
    token?: string
  ) {
    return apiFetch<List>(`/lists/${listId}`, {
      method: "PATCH",
      body: JSON.stringify(params),
      token,
    });
  },
  addGameToList(listId: string, gameId: string, token?: string) {
    return apiFetch<{ message: string }>(`/lists/${listId}/games`, {
      method: "POST",
      body: JSON.stringify({ gameId }),
      token,
    });
  },
  removeListGameItem(listId: string, listGameId: string, token?: string) {
    return apiFetch<{ message: string }>(
      `/lists/${listId}/items/${listGameId}`,
      {
        method: "DELETE",
        token,
      }
    );
  },
  deleteList(listId: string, token?: string) {
    return apiFetch<{ message: string }>(`/lists/${listId}`, {
      method: "DELETE",
      token,
    });
  },
};
