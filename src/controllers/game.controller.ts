import { GameService } from "../services/game.service";
import { Request, Response } from "express";

const gameService = new GameService();

export const GameController = {
  getGames: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const games = await gameService.getGames(page, pageSize);

      res.status(200).json(games);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      res.status(500).json({ error: "Erro ao buscar jogos" });
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
};
