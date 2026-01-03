import axios from "axios";
import {
  RawgGame,
  RawgListResponse,
  GameSummary,
  GameDetails,
} from "../models/game.model";
import prisma from "../lib/prisma";

const RawgAPIKey = process.env.RAWG_API_KEY;

const rawgApi = axios.create({
  baseURL: "https://api.rawg.io/api",
  params: { key: RawgAPIKey },
});

export class GameService {
  private formatGameData(game: RawgGame): GameDetails {
    return {
      id: game.id,
      name: game.name,
      released: game.released,
      background_image: game.background_image,
      genres: game.genres?.map((g) => g.name) || [],
      developers: game.developers?.map((d) => d.name) || [],
      publishers: game.publishers?.map((p) => p.name) || [],
      platforms: game.platforms?.map((p) => p.platform.name) || [],
      dlcs:
        game.additions?.map((d) => ({
          id: d.id,
          name: d.name,
          released: d.released,
        })) || [],
    };
  }

  private handleError(message: string, error: unknown): never {
    console.error(message, error);
    throw new Error(message);
  }

  getGames = async (
    page = 1,
    pageSize = 10
  ): Promise<{
    results: GameSummary[];
    count: number;
    next: string | null;
    previous: string | null;
  }> => {
    try {
      const response = await rawgApi.get<RawgListResponse>("/games", {
        params: { page, page_size: pageSize },
      });

      return {
        results: response.data.results.map(
          (game): GameSummary => ({
            id: game.id,
            name: game.name,
            released: game.released,
            background_image: game.background_image,
          })
        ),
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      };
    } catch (error) {
      this.handleError("Erro ao obter jogos", error);
    }
  };

  searchGames = async (
    query: string,
    page = 1,
    pageSize = 10
  ): Promise<{
    results: GameDetails[];
    count: number;
    next: string | null;
    previous: string | null;
  }> => {
    try {
      const response = await rawgApi.get<RawgListResponse>("/games", {
        params: { search: query, page, page_size: pageSize },
      });

      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get<RawgGame>(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get<RawgListResponse>(
            `/games/${game.id}/additions`
          );
          const details = detailsResp.data;
          const dlcs = dlcsResp.data.results;

          return this.formatGameData({ ...details, additions: dlcs });
        })
      );

      return {
        results: detailedGames,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      };
    } catch (error) {
      this.handleError("Erro ao buscar jogos", error);
    }
  };

  searchGamesByPlatform = async (
    platformId: number,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> => {
    try {
      const response = await rawgApi.get<RawgListResponse>("/games", {
        params: { platforms: platformId, page, page_size: pageSize },
      });

      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get<RawgGame>(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get<RawgListResponse>(
            `/games/${game.id}/additions`
          );
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        })
      );

      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por plataforma", error);
    }
  };

  searchGamesByGenre = async (
    genreId: number,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> => {
    try {
      const response = await rawgApi.get<RawgListResponse>("/games", {
        params: { genres: genreId, page, page_size: pageSize },
      });

      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get<RawgGame>(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get<RawgListResponse>(
            `/games/${game.id}/additions`
          );
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        })
      );

      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por gênero", error);
    }
  };

  searchGamesByDlc = async (
    dlcId: number,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> => {
    try {
      const dlcResp = await rawgApi.get<RawgListResponse>(
        `/games/${dlcId}/additions`,
        {
          params: { page, page_size: pageSize },
        }
      );

      const detailedGames = await Promise.all(
        dlcResp.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get<RawgGame>(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get<RawgListResponse>(
            `/games/${game.id}/additions`
          );
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        })
      );

      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por DLC", error);
    }
  };

  getGameDetails = async (gameId: number): Promise<GameDetails> => {
    try {
      const detailsResp = await rawgApi.get<RawgGame>(`/games/${gameId}`);
      const dlcsResp = await rawgApi.get<RawgListResponse>(
        `/games/${gameId}/additions`
      );
      return this.formatGameData({
        ...detailsResp.data,
        additions: dlcsResp.data.results,
      });
    } catch (error) {
      this.handleError("Erro ao buscar detalhes do jogo", error);
    }
  };

  likeGame = async (
    userId: string,
    gameId: string
  ): Promise<{ message: string; liked: boolean }> => {
    try {
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

      const existingLike = await prisma.userLikedGame.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId: game.id,
          },
        },
      });

      if (existingLike) {
        await prisma.userLikedGame.delete({
          where: {
            id: existingLike.id,
          },
        });
        return { message: "Curtida removida com sucesso", liked: false };
      } else {
        await prisma.userLikedGame.create({
          data: {
            userId,
            gameId: game.id,
          },
        });
        return { message: "Jogo curtido com sucesso", liked: true };
      }
    } catch (error) {
      this.handleError("Erro ao curtir jogo", error);
    }
  };

  getUserLikedGames = async (userId: string): Promise<string[]> => {
    try {
      const likedGames = await prisma.userLikedGame.findMany({
        where: { userId },
        include: { game: true },
      });

      return likedGames.map((like) => like.game.gameId);
    } catch (error) {
      this.handleError("Erro ao buscar jogos curtidos", error);
    }
  };

  setGameStatus = async (
    userId: string,
    gameId: string,
    status: "PLAYING" | "COMPLETED" | "WANT_TO_PLAY"
  ): Promise<{ message: string; status: string }> => {
    try {
      // Verifica se o jogo já existe no banco
      let game = await prisma.game.findUnique({
        where: { gameId },
      });

      if (!game) {
        game = await prisma.game.create({
          data: {
            gameId,
          },
        });
      }

      const existingStatus = await prisma.userGameStatus.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId: game.id,
          },
        },
      });

      if (existingStatus) {
        await prisma.userGameStatus.update({
          where: {
            id: existingStatus.id,
          },
          data: {
            status,
          },
        });
        return { message: "Status do jogo atualizado com sucesso", status };
      } else {
        // Cria novo status
        await prisma.userGameStatus.create({
          data: {
            userId,
            gameId: game.id,
            status,
          },
        });
        return { message: "Status do jogo definido com sucesso", status };
      }
    } catch (error) {
      this.handleError("Erro ao definir status do jogo", error);
    }
  };

  removeGameStatus = async (
    userId: string,
    gameId: string
  ): Promise<{ message: string }> => {
    try {
      const game = await prisma.game.findUnique({
        where: { gameId },
      });

      if (!game) {
        throw new Error("Jogo não encontrado");
      }

      await prisma.userGameStatus.deleteMany({
        where: {
          userId,
          gameId: game.id,
        },
      });

      return { message: "Status do jogo removido com sucesso" };
    } catch (error) {
      this.handleError("Erro ao remover status do jogo", error);
    }
  };

  getUserGamesByStatus = async (
    userId: string,
    status?: "PLAYING" | "COMPLETED" | "WANT_TO_PLAY"
  ): Promise<
    Array<{ gameId: string; status: string; updatedAt: Date | null }>
  > => {
    try {
      const where = status ? { userId, status } : { userId };

      const games = await prisma.userGameStatus.findMany({
        where,
        include: { game: true },
        orderBy: { updatedAt: "desc" },
      });

      return games.map((gameStatus) => ({
        gameId: gameStatus.game.gameId,
        status: gameStatus.status,
        updatedAt: gameStatus.updatedAt,
      }));
    } catch (error) {
      this.handleError("Erro ao buscar jogos por status", error);
    }
  };
}
