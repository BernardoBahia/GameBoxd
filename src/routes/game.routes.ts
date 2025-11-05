import { Router, Request, Response } from "express";
import { GameController } from "../controllers/game.controller";

const router = Router();

router.get("/games", GameController.getGames);
router.get("/games/search", GameController.searchGames);
router.get("/games/platform/:platformId", GameController.searchGamesByPlatform);
router.get("/games/genre/:genreId", GameController.searchGamesByGenre);
router.get("/games/dlc/:dlcId", GameController.searchGamesByDlc);
router.get("/games/details/:gameId", GameController.getGameDetails);
router.post("/games/like", GameController.likeGame);
router.get("/games/liked/:userId", GameController.getUserLikedGames);

export default router;
