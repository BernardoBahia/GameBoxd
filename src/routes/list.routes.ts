import { Router } from "express";
import { ListController } from "../controllers/list.controller";

const router = Router();

router.post("/lists", ListController.createList);
router.get("/lists/user/:userId", ListController.getListsByUserId);
router.get("/lists/:listId", ListController.getListById);
router.delete("/lists/:listId", ListController.deleteList);
router.put("/lists/:listId/rename", ListController.renameList);
router.post("/lists/:listId/games", ListController.addGameToList);
router.delete(
  "/lists/:listId/games/:gameId",
  ListController.removeGameFromList
);
router.put("/lists/:listId/public", ListController.makeListPublic);
router.put("/lists/:listId/private", ListController.makeListPrivate);

export default router;
