import { GameService } from "../services/game.service";
import { Request, Response } from "express";

const gameService = new GameService();

export const GameController = {
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
      const games = await gameService.searchGames(query, page, pageSize);

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      res.status(500).json({ error: "Erro ao buscar jogos" });
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

  likeGame: async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      const gameId = req.body.gameId;

      if (!userId || !gameId) {
        return res
          .status(400)
          .json({ error: "userId e gameId são obrigatórios" });
      }

      const result = await gameService.likeGame(userId, gameId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao curtir jogo:", error);
      res.status(500).json({ error: "Erro ao curtir jogo" });
    }
  },

  getUserLikedGames: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

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
