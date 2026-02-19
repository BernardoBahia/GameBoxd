"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const list_controller_1 = require("../controllers/list.controller");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const router = (0, express_1.Router)();
router.post("/lists", list_controller_1.ListController.createList);
// Frontend-friendly alias: /lists (uses token if provided; or accepts ?userId=)
router.get("/lists", AuthMiddleware_1.optionalAuthMiddleware, list_controller_1.ListController.getMyLists);
router.get("/lists/user/:userId", list_controller_1.ListController.getListsByUserId);
// Frontend-friendly alias: /lists/:id without requiring ?userId= when authorized
router.get("/lists/:listId", AuthMiddleware_1.optionalAuthMiddleware, list_controller_1.ListController.getListByIdAutoUser);
router.patch("/lists/:listId", AuthMiddleware_1.authMiddleware, list_controller_1.ListController.updateList);
router.delete("/lists/:listId", AuthMiddleware_1.authMiddleware, list_controller_1.ListController.deleteList);
router.put("/lists/:listId/rename", AuthMiddleware_1.authMiddleware, list_controller_1.ListController.renameList);
router.post("/lists/:listId/games", AuthMiddleware_1.authMiddleware, list_controller_1.ListController.addGameToList);
router.delete("/lists/:listId/games/:gameId", AuthMiddleware_1.authMiddleware, list_controller_1.ListController.removeGameFromList);
router.delete("/lists/:listId/items/:listGameId", AuthMiddleware_1.authMiddleware, list_controller_1.ListController.removeListGameItem);
router.put("/lists/:listId/public", AuthMiddleware_1.authMiddleware, list_controller_1.ListController.makeListPublic);
router.put("/lists/:listId/private", AuthMiddleware_1.authMiddleware, list_controller_1.ListController.makeListPrivate);
exports.default = router;
