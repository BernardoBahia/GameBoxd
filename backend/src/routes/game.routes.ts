import { Router, Request, Response } from "express";
import { GameController } from "../controllers/game.controller";
import { authMiddleware } from "../middlewares/AuthMiddleware";

const router = Router();

router.get("/genres", GameController.getGenres);
router.get("/games", GameController.getGames);
// Frontend-friendly alias
router.get("/games/highlights", GameController.getHighlights);
router.get("/games/trending", GameController.getTrendingGames);
router.get("/games/recent", GameController.getRecentGames);
router.get("/games/search", GameController.searchGames);
router.get("/games/platform/:platformId", GameController.searchGamesByPlatform);
router.get("/games/genre/:genreId", GameController.searchGamesByGenre);
router.get("/games/dlc/:dlcId", GameController.searchGamesByDlc);
router.get("/games/details/:gameId", GameController.getGameDetails);

// Frontend-friendly aliases for details/reviews/dlcs (keep param routes last)
router.get("/games/:gameId/dlcs", GameController.getGameDlcs);
router.get("/games/:gameId/reviews", GameController.getGameReviews);
router.post("/games/like", authMiddleware, GameController.likeGame);
router.get("/games/liked", authMiddleware, GameController.getMyLikedGames);
router.get(
  "/games/liked/:userId",
  authMiddleware,
  GameController.getUserLikedGames,
);
router.get("/games/:gameId", GameController.getGameDetails);
router.post("/games/status", GameController.setGameStatus);
router.delete("/games/status", GameController.removeGameStatus);
router.get("/games/status/:userId", GameController.getUserGamesByStatus);

export default router;
