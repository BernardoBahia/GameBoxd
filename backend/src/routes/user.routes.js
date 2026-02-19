"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const router = (0, express_1.Router)();
router.post("/users", user_controller_1.UserController.createUser);
router.get("/users", user_controller_1.UserController.getAllUsers);
router.get("/users/profile", AuthMiddleware_1.authMiddleware, (req, res) => {
    res.json({
        message: "Acesso autorizado!",
        user: req.user,
    });
});
router.get("/users/:id", user_controller_1.UserController.getUserById);
router.get("/users/:id/stats", user_controller_1.UserController.getUserStats);
router.get("/users/:id/public", user_controller_1.UserController.getUserWithPublicData);
router.put("/users/:id", user_controller_1.UserController.updateUser);
router.delete("/users/:id", user_controller_1.UserController.deleteUser);
exports.default = router;
