import { Router } from "express";
import { ListController } from "../controllers/list.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middlewares/AuthMiddleware";

const router = Router();

router.post("/lists", ListController.createList);
// Frontend-friendly alias: /lists (uses token if provided; or accepts ?userId=)
router.get("/lists", optionalAuthMiddleware, ListController.getMyLists);
router.get("/lists/user/:userId", ListController.getListsByUserId);
// Frontend-friendly alias: /lists/:id without requiring ?userId= when authorized
router.get(
  "/lists/:listId",
  optionalAuthMiddleware,
  ListController.getListByIdAutoUser
);
router.patch("/lists/:listId", authMiddleware, ListController.updateList);
router.delete("/lists/:listId", authMiddleware, ListController.deleteList);
router.put("/lists/:listId/rename", authMiddleware, ListController.renameList);
router.post(
  "/lists/:listId/games",
  authMiddleware,
  ListController.addGameToList
);
router.delete(
  "/lists/:listId/games/:gameId",
  authMiddleware,
  ListController.removeGameFromList
);
router.delete(
  "/lists/:listId/items/:listGameId",
  authMiddleware,
  ListController.removeListGameItem
);
router.put(
  "/lists/:listId/public",
  authMiddleware,
  ListController.makeListPublic
);
router.put(
  "/lists/:listId/private",
  authMiddleware,
  ListController.makeListPrivate
);

export default router;
