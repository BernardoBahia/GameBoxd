"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller_1 = require("../controllers/game.controller");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const router = (0, express_1.Router)();
router.get("/genres", game_controller_1.GameController.getGenres);
router.get("/games", game_controller_1.GameController.getGames);
// Frontend-friendly alias
router.get("/games/highlights", game_controller_1.GameController.getHighlights);
router.get("/games/trending", game_controller_1.GameController.getTrendingGames);
router.get("/games/recent", game_controller_1.GameController.getRecentGames);
router.get("/games/search", game_controller_1.GameController.searchGames);
router.get("/games/platform/:platformId", game_controller_1.GameController.searchGamesByPlatform);
router.get("/games/genre/:genreId", game_controller_1.GameController.searchGamesByGenre);
router.get("/games/dlc/:dlcId", game_controller_1.GameController.searchGamesByDlc);
router.get("/games/details/:gameId", game_controller_1.GameController.getGameDetails);
// Frontend-friendly aliases for details/reviews/dlcs (keep param routes last)
router.get("/games/:gameId/dlcs", game_controller_1.GameController.getGameDlcs);
router.get("/games/:gameId/reviews", game_controller_1.GameController.getGameReviews);
router.post("/games/like", AuthMiddleware_1.authMiddleware, game_controller_1.GameController.likeGame);
router.get("/games/liked", AuthMiddleware_1.authMiddleware, game_controller_1.GameController.getMyLikedGames);
router.get("/games/liked/:userId", AuthMiddleware_1.authMiddleware, game_controller_1.GameController.getUserLikedGames);
router.get("/games/:gameId", game_controller_1.GameController.getGameDetails);
router.post("/games/status", game_controller_1.GameController.setGameStatus);
router.delete("/games/status", game_controller_1.GameController.removeGameStatus);
router.get("/games/status/:userId", game_controller_1.GameController.getUserGamesByStatus);
exports.default = router;
