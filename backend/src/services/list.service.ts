import { List } from "../models/list.model";
import { GameService } from "./game.service";
import prisma from "../lib/prisma";
import { getCache, setCache } from "../lib/redis";

const gameService = new GameService();

export class ListService {
  private async enrichListWithGameDetails(list: any): Promise<List> {
    if (!list.listGames || list.listGames.length === 0) return list;

    const enrichedListGames = await Promise.all(
      list.listGames.map(async (listGame: any) => {
        const rawgId = listGame.game?.gameId;
        if (!rawgId) return listGame;

        const cacheKey = `list:game:${rawgId}`;
        try {
          const cached = await getCache<Record<string, unknown>>(cacheKey);
          if (cached) {
            return { ...listGame, game: { ...listGame.game, ...cached } };
          }

          const gameDetails = await gameService.getGameDetails(parseInt(rawgId));
          const enriched = {
            name: gameDetails.name,
            background_image: gameDetails.background_image,
            released: gameDetails.released,
            metacritic: gameDetails.metacritic,
            gameboxdRating: gameDetails.gameboxdRating,
            gameboxdRatingCount: gameDetails.gameboxdRatingCount,
            genres: gameDetails.genres,
          };

          await setCache(cacheKey, enriched, 600);
          return { ...listGame, game: { ...listGame.game, ...enriched } };
        } catch (error) {
          console.error(`Erro ao buscar detalhes do jogo ${rawgId}:`, error);
          return listGame;
        }
      }),
    );

    return { ...list, listGames: enrichedListGames };
  }

  async createList(name: string, userId: string): Promise<List> {
    try {
      const createdList = await prisma.list.create({
        data: {
          name,
          userId,
        },
      });

      return createdList;
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      throw new Error("Falha ao criar lista");
    }
  }

  async getListsByUserId(userId: string): Promise<List[]> {
    try {
      const lists = await prisma.list.findMany({
        where: { userId },
        include: {
          listGames: {
            include: {
              game: true,
            },
          },
        },
      });

      const enrichedLists = await Promise.all(
        lists.map((list) => this.enrichListWithGameDetails(list)),
      );

      return enrichedLists;
    } catch (error) {
      console.error("Erro ao buscar listas do usuário:", error);
      throw new Error("Falha ao buscar listas do usuário");
    }
  }

  async deleteList(listId: string, userId: string): Promise<void> {
    try {
      const result = await prisma.list.deleteMany({
        where: {
          id: listId,
          userId,
        },
      });

      if (result.count === 0) {
        throw new Error("Lista não encontrada ou sem permissão para deletar");
      }
    } catch (error) {
      console.error("Erro ao deletar lista:", error);

      if (
        error instanceof Error &&
        error.message === "Lista não encontrada ou sem permissão para deletar"
      ) {
        throw error;
      }

      throw new Error("Falha ao deletar lista");
    }
  }

  async renameList(
    listId: string,
    userId: string,
    newName: string,
  ): Promise<List> {
    try {
      const existingList = await prisma.list.findFirst({
        where: {
          id: listId,
          userId,
        },
      });

      if (!existingList) {
        throw new Error("Lista não encontrada ou sem permissão para editar");
      }

      const renamedList = await prisma.list.update({
        where: { id: listId },
        data: {
          name: newName,
        },
      });

      return renamedList;
    } catch (error) {
      console.error("Erro ao renomear lista:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        throw error;
      }
      throw new Error("Falha ao renomear lista");
    }
  }

  async getListById(listId: string, userId: string): Promise<List | null> {
    try {
      const list = await prisma.list.findFirst({
        where: {
          id: listId,
          userId,
        },
        include: {
          listGames: {
            include: {
              game: true,
            },
          },
        },
      });

      if (!list) return null;

      const enrichedList = await this.enrichListWithGameDetails(list);

      return enrichedList;
    } catch (error) {
      console.error("Erro ao buscar lista por ID:", error);
      throw new Error("Falha ao buscar lista por ID");
    }
  }

  async addGameToList(
    listId: string,
    userId: string,
    gameId: string,
  ): Promise<void> {
    try {
      const list = await this.getListById(listId, userId);
      if (!list) {
        throw new Error("Lista não encontrada ou sem permissão para editar");
      }

      let game = await prisma.game.findUnique({
        where: { gameId },
      });

      if (!game) {
        game = await prisma.game.create({
          data: {
            gameId,
            isLiked: false,
          },
        });
      }

      await prisma.listGame.create({
        data: {
          listId,
          gameId: game.id,
        },
      });
    } catch (error) {
      console.error("Erro ao adicionar jogo à lista:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        throw error;
      }
      throw new Error("Falha ao adicionar jogo à lista");
    }
  }

  async removeGameFromList(
    listId: string,
    userId: string,
    gameId: string,
  ): Promise<void> {
    try {
      const list = await this.getListById(listId, userId);
      if (!list) {
        throw new Error("Lista não encontrada ou sem permissão para editar");
      }

      const game = await prisma.game.findFirst({
        where: {
          OR: [{ id: gameId }, { gameId }],
        },
      });

      const resolvedGameId = game?.id ?? gameId;

      await prisma.listGame.deleteMany({
        where: {
          listId,
          gameId: resolvedGameId,
        },
      });
    } catch (error) {
      console.error("Erro ao remover jogo da lista:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        throw error;
      }
      throw new Error("Falha ao remover jogo da lista");
    }
  }

  async updateList(
    listId: string,
    userId: string,
    data: { name?: string; isPublic?: boolean },
  ): Promise<List> {
    try {
      const existingList = await prisma.list.findFirst({
        where: {
          id: listId,
          userId,
        },
      });

      if (!existingList) {
        throw new Error("Lista não encontrada ou sem permissão para editar");
      }

      const updated = await prisma.list.update({
        where: { id: listId },
        data: {
          ...(typeof data.name === "string" ? { name: data.name } : {}),
          ...(typeof data.isPublic === "boolean"
            ? { isPublic: data.isPublic }
            : {}),
        },
      });

      return updated;
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        throw error;
      }
      throw new Error("Falha ao atualizar lista");
    }
  }

  async removeListGameItem(
    listId: string,
    userId: string,
    listGameId: string,
  ): Promise<void> {
    try {
      const list = await this.getListById(listId, userId);
      if (!list) {
        throw new Error("Lista não encontrada ou sem permissão para editar");
      }

      const existing = await prisma.listGame.findFirst({
        where: {
          id: listGameId,
          listId,
        },
      });

      if (!existing) {
        throw new Error("Item da lista não encontrado");
      }

      await prisma.listGame.delete({
        where: { id: listGameId },
      });
    } catch (error) {
      console.error("Erro ao remover item da lista:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        throw error;
      }
      throw new Error("Falha ao remover item da lista");
    }
  }

  async makeListPublic(listId: string, userId: string): Promise<List> {
    try {
      const existingList = await prisma.list.findFirst({
        where: {
          id: listId,
          userId,
        },
      });

      if (!existingList) {
        throw new Error("Lista não encontrada ou sem permissão para editar");
      }

      const updatedList = await prisma.list.update({
        where: { id: listId },
        data: {
          isPublic: true,
        },
      });

      return updatedList;
    } catch (error) {
      console.error("Erro ao tornar lista pública:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        throw error;
      }
      throw new Error("Falha ao tornar lista pública");
    }
  }

  async makeListPrivate(listId: string, userId: string): Promise<List> {
    try {
      const existingList = await prisma.list.findFirst({
        where: {
          id: listId,
          userId,
        },
      });

      if (!existingList) {
        throw new Error("Lista não encontrada ou sem permissão para editar");
      }

      const updatedList = await prisma.list.update({
        where: { id: listId },
        data: {
          isPublic: false,
        },
      });

      return updatedList;
    } catch (error) {
      console.error("Erro ao tornar lista privada:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        throw error;
      }
      throw new Error("Falha ao tornar lista privada");
    }
  }
}
