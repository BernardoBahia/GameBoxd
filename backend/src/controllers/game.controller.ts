import { GameService } from "../services/game.service";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ReviewService } from "../services/review.service";
import type { AuthRequest } from "../middlewares/AuthMiddleware";

const gameService = new GameService();
const reviewService = new ReviewService();

async function getOrCreateGameEntityByRawgId(rawgGameId: string) {
  const existing = await prisma.game.findUnique({
    where: { gameId: rawgGameId },
  });
  if (existing) return existing;
  return prisma.game.create({ data: { gameId: rawgGameId } });
}

export const GameController = {
  getHighlights: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const games = await gameService.getTrendingGames(page, pageSize);
      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar destaques:", error);
      res.status(500).json({ error: "Erro ao buscar destaques" });
    }
  },
  getGames: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const filters: any = {};
      if (req.query.platforms) filters.platforms = String(req.query.platforms);
      if (req.query.genres) filters.genres = String(req.query.genres);
      if (req.query.dates) filters.dates = String(req.query.dates);
      if (req.query.ordering) filters.ordering = String(req.query.ordering);

      const games = await gameService.getGames(
        page,
        pageSize,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      res.status(500).json({ error: "Erro ao buscar jogos" });
    }
  },

  getTrendingGames: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const games = await gameService.getTrendingGames(page, pageSize);

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos em alta:", error);
      res.status(500).json({ error: "Erro ao buscar jogos em alta" });
    }
  },

  getRecentGames: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const games = await gameService.getRecentGames(page, pageSize);

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos recentes:", error);
      res.status(500).json({ error: "Erro ao buscar jogos recentes" });
    }
  },

  searchGames: async (req: Request, res: Response) => {
    try {
      const query = String(req.query.query || "");
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const ordering = req.query.ordering
        ? String(req.query.ordering)
        : undefined;
      const genres = req.query.genres ? String(req.query.genres) : undefined;
      const games = await gameService.searchGames(
        query,
        page,
        pageSize,
        ordering,
        genres
      );

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      res.status(500).json({ error: "Erro ao buscar jogos" });
    }
  },

  getGenres: async (_req: Request, res: Response) => {
    try {
      const genres = await gameService.getGenres();
      res.status(200).json(genres);
    } catch (error) {
      console.error("Erro ao buscar gêneros:", error);
      res.status(500).json({ error: "Erro ao buscar gêneros" });
    }
  },

  searchGamesByPlatform: async (req: Request, res: Response) => {
    try {
      const platformId = Number(req.params.platformId);
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const games = await gameService.searchGamesByPlatform(
        platformId,
        page,
        pageSize
      );

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos por plataforma:", error);
      res.status(500).json({ error: "Erro ao buscar jogos por plataforma" });
    }
  },

  searchGamesByGenre: async (req: Request, res: Response) => {
    try {
      const genreId = Number(req.params.genreId);
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const games = await gameService.searchGamesByGenre(
        genreId,
        page,
        pageSize
      );

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos por gênero:", error);
      res.status(500).json({ error: "Erro ao buscar jogos por gênero" });
    }
  },

  searchGamesByDlc: async (req: Request, res: Response) => {
    try {
      const dlcId = Number(req.params.dlcId);
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const games = await gameService.searchGamesByDlc(dlcId, page, pageSize);

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos por DLC:", error);
      res.status(500).json({ error: "Erro ao buscar jogos por DLC" });
    }
  },

  getGameDetails: async (req: Request, res: Response) => {
    try {
      const gameId = Number(req.params.gameId);
      const gameDetails = await gameService.getGameDetails(gameId);

      res.status(200).json(gameDetails);
    } catch (error) {
      console.error("Erro ao buscar detalhes do jogo:", error);
      res.status(500).json({ error: "Erro ao buscar detalhes do jogo" });
    }
  },

  getGameDlcs: async (req: Request, res: Response) => {
    try {
      const gameId = Number(req.params.gameId);
      const gameDetails = await gameService.getGameDetails(gameId);
      res.status(200).json(gameDetails.dlcs ?? []);
    } catch (error) {
      console.error("Erro ao buscar DLCs do jogo:", error);
      res.status(500).json({ error: "Erro ao buscar DLCs do jogo" });
    }
  },

  getGameReviews: async (req: Request, res: Response) => {
    try {
      const rawgGameId = String(req.params.gameId);
      if (!rawgGameId) {
        return res.status(400).json({ error: "gameId é obrigatório" });
      }

      const gameEntity = await getOrCreateGameEntityByRawgId(rawgGameId);
      const reviews = await reviewService.getReviewsByGameId(gameEntity.id);
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Erro ao buscar reviews do jogo:", error);
      res.status(500).json({ error: "Erro ao buscar reviews do jogo" });
    }
  },

  likeGame: async (req: AuthRequest, res: Response) => {
    try {
      const tokenUserId = req.user?.id;
      const bodyUserId = req.body?.userId as string | undefined;
      const gameId = req.body?.gameId as string | undefined;

      if (!gameId) {
        return res.status(400).json({ error: "gameId é obrigatório" });
      }

      if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
        return res
          .status(403)
          .json({ error: "userId não corresponde ao token" });
      }

      const resolvedUserId = tokenUserId ?? bodyUserId;
      if (!resolvedUserId) {
        return res.status(401).json({ error: "Token não fornecido" });
      }

      const result = await gameService.likeGame(resolvedUserId, gameId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao curtir jogo:", error);
      res.status(500).json({ error: "Erro ao curtir jogo" });
    }
  },

  getMyLikedGames: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Token não fornecido" });
      }

      const likedGames = await gameService.getUserLikedGames(userId);
      res.status(200).json(likedGames);
    } catch (error) {
      console.error("Erro ao buscar jogos curtidos:", error);
      res.status(500).json({ error: "Erro ao buscar jogos curtidos" });
    }
  },

  getUserLikedGames: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      const tokenUserId = req.user?.id;
      if (tokenUserId && userId && userId !== tokenUserId) {
        return res
          .status(403)
          .json({ error: "userId não corresponde ao token" });
      }

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const likedGames = await gameService.getUserLikedGames(userId);
      res.status(200).json(likedGames);
    } catch (error) {
      console.error("Erro ao buscar jogos curtidos:", error);
      res.status(500).json({ error: "Erro ao buscar jogos curtidos" });
    }
  },

  setGameStatus: async (req: Request, res: Response) => {
    try {
      const { userId, gameId, status } = req.body;

      if (!userId || !gameId || !status) {
        return res
          .status(400)
          .json({ error: "userId, gameId e status são obrigatórios" });
      }

      if (!["PLAYING", "COMPLETED", "WANT_TO_PLAY"].includes(status)) {
        return res.status(400).json({
          error: "Status deve ser PLAYING, COMPLETED ou WANT_TO_PLAY",
        });
      }

      const result = await gameService.setGameStatus(userId, gameId, status);
      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao definir status do jogo:", error);
      res.status(500).json({ error: "Erro ao definir status do jogo" });
    }
  },

  removeGameStatus: async (req: Request, res: Response) => {
    try {
      const { userId, gameId } = req.body;

      if (!userId || !gameId) {
        return res
          .status(400)
          .json({ error: "userId e gameId são obrigatórios" });
      }

      const result = await gameService.removeGameStatus(userId, gameId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao remover status do jogo:", error);
      res.status(500).json({ error: "Erro ao remover status do jogo" });
    }
  },

  getUserGamesByStatus: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const status = req.query.status as
        | "PLAYING"
        | "COMPLETED"
        | "WANT_TO_PLAY"
        | undefined;

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      if (
        status &&
        !["PLAYING", "COMPLETED", "WANT_TO_PLAY"].includes(status)
      ) {
        return res.status(400).json({
          error: "Status deve ser PLAYING, COMPLETED ou WANT_TO_PLAY",
        });
      }

      const games = await gameService.getUserGamesByStatus(userId, status);
      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos por status:", error);
      res.status(500).json({ error: "Erro ao buscar jogos por status" });
    }
  },
};
