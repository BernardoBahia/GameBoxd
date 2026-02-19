"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
exports.UserController = {
    createUser: async (req, res) => {
        const { email, name, password } = req.body;
        const userService = new user_service_1.UserService();
        const user = await userService.createUser(email, name, password);
        res.status(201).json(user);
    },
    getAllUsers: async (req, res) => {
        const userService = new user_service_1.UserService();
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    },
    getUserById: async (req, res) => {
        const { id } = req.params;
        const userService = new user_service_1.UserService();
        const user = await userService.getUserById(id);
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    },
    updateUser: async (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const userService = new user_service_1.UserService();
        const updatedUser = await userService.updateUser(id, data);
        res.status(200).json(updatedUser);
    },
    deleteUser: async (req, res) => {
        const { id } = req.params;
        const userService = new user_service_1.UserService();
        await userService.deleteUser(id);
        res.status(204).send();
    },
    getUserStats: async (req, res) => {
        const { id } = req.params;
        const userService = new user_service_1.UserService();
        const stats = await userService.getUserStats(id);
        res.status(200).json(stats);
    },
    getUserWithPublicData: async (req, res) => {
        const { id } = req.params;
        const userService = new user_service_1.UserService();
        const user = await userService.getUserWithPublicData(id);
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    },
};
