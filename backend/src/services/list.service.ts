import { List } from "../models/list.model";
import { GameService } from "./game.service";
import prisma from "../lib/prisma";
const gameService = new GameService();

export class ListService {
  private async enrichListWithGameDetails(list: any): Promise<List> {
    if (list.listGames && list.listGames.length > 0) {
      const enrichedListGames = await Promise.all(
        list.listGames.map(async (listGame: any) => {
          try {
            const gameDetails = await gameService.getGameDetails(
              parseInt(listGame.game.gameId)
            );
            return {
              ...listGame,
              game: {
                ...listGame.game,
                name: gameDetails.name,
                background_image: gameDetails.background_image,
                released: gameDetails.released,
                genres: gameDetails.genres,
              },
            };
          } catch (error) {
            console.error(
              `Erro ao buscar detalhes do jogo ${listGame.game.gameId}:`,
              error
            );
            return listGame;
          }
        })
      );
      return { ...list, listGames: enrichedListGames };
    }
    return list;
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
        lists.map((list) => this.enrichListWithGameDetails(list))
      );

      return enrichedLists;
    } catch (error) {
      console.error("Erro ao buscar listas do usuário:", error);
      throw new Error("Falha ao buscar listas do usuário");
    }
  }

  async deleteList(listId: string, userId: string): Promise<void> {
    try {
      await prisma.list.deleteMany({
        where: {
          id: listId,
          userId,
        },
      });
    } catch (error) {
      console.error("Erro ao deletar lista:", error);
      throw new Error("Falha ao deletar lista");
    }
  }

  async renameList(
    listId: string,
    userId: string,
    newName: string
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
    gameId: string
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
    gameId: string
  ): Promise<void> {
    try {
      const list = await this.getListById(listId, userId);
      if (!list) {
        throw new Error("Lista não encontrada ou sem permissão para editar");
      }

      await prisma.listGame.deleteMany({
        where: {
          listId,
          gameId,
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
