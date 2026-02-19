"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListController = void 0;
const list_service_1 = require("../services/list.service");
const listService = new list_service_1.ListService();
exports.ListController = {
    // Frontend-friendly alias: if userId isn't provided, try to read it from auth middleware
    getMyLists: async (req, res) => {
        try {
            const authReq = req;
            const userId = req.query.userId ?? authReq.user?.id;
            if (!userId) {
                return res.status(400).json({ error: "userId é obrigatório" });
            }
            const lists = await listService.getListsByUserId(userId);
            res.status(200).json(lists);
        }
        catch (error) {
            console.error("Erro ao buscar listas:", error);
            res.status(500).json({ error: "Erro ao buscar listas" });
        }
    },
    createList: async (req, res) => {
        try {
            const { name, userId } = req.body;
            if (!name || !userId) {
                return res
                    .status(400)
                    .json({ error: "Nome e userId são obrigatórios" });
            }
            const list = await listService.createList(name, userId);
            res.status(201).json(list);
        }
        catch (error) {
            console.error("Erro ao criar lista:", error);
            res.status(500).json({ error: "Erro ao criar lista" });
        }
    },
    getListsByUserId: async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({ error: "userId é obrigatório" });
            }
            const lists = await listService.getListsByUserId(userId);
            res.status(200).json(lists);
        }
        catch (error) {
            console.error("Erro ao buscar listas do usuário:", error);
            res.status(500).json({ error: "Erro ao buscar listas do usuário" });
        }
    },
    getListById: async (req, res) => {
        try {
            const { listId } = req.params;
            const { userId } = req.query;
            if (!listId || !userId) {
                return res
                    .status(400)
                    .json({ error: "listId e userId são obrigatórios" });
            }
            const list = await listService.getListById(listId, userId);
            if (!list) {
                return res.status(404).json({ error: "Lista não encontrada" });
            }
            res.status(200).json(list);
        }
        catch (error) {
            console.error("Erro ao buscar lista:", error);
            res.status(500).json({ error: "Erro ao buscar lista" });
        }
    },
    deleteList: async (req, res) => {
        try {
            const { listId } = req.params;
            const authReq = req;
            const tokenUserId = authReq.user?.id;
            const { userId: bodyUserId } = req.body;
            if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
                return res
                    .status(403)
                    .json({ error: "userId não corresponde ao token" });
            }
            const resolvedUserId = tokenUserId ?? bodyUserId;
            if (!listId || !resolvedUserId) {
                return res.status(400).json({ error: "listId é obrigatório" });
            }
            await listService.deleteList(listId, resolvedUserId);
            res.status(200).json({ message: "Lista deletada com sucesso" });
        }
        catch (error) {
            console.error("Erro ao deletar lista:", error);
            res.status(500).json({ error: "Erro ao deletar lista" });
        }
    },
    renameList: async (req, res) => {
        try {
            const { listId } = req.params;
            const authReq = req;
            const tokenUserId = authReq.user?.id;
            const { userId: bodyUserId, newName } = req.body;
            if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
                return res
                    .status(403)
                    .json({ error: "userId não corresponde ao token" });
            }
            const resolvedUserId = tokenUserId ?? bodyUserId;
            if (!listId || !resolvedUserId || !newName) {
                return res
                    .status(400)
                    .json({ error: "listId e newName são obrigatórios" });
            }
            const list = await listService.renameList(listId, resolvedUserId, newName);
            res.status(200).json(list);
        }
        catch (error) {
            console.error("Erro ao renomear lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro ao renomear lista" });
        }
    },
    addGameToList: async (req, res) => {
        try {
            const { listId } = req.params;
            const tokenUserId = req.user?.id;
            const { userId: bodyUserId, gameId } = req.body;
            if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
                return res
                    .status(403)
                    .json({ error: "userId não corresponde ao token" });
            }
            const resolvedUserId = tokenUserId ?? bodyUserId;
            if (!listId || !resolvedUserId || !gameId) {
                return res
                    .status(400)
                    .json({ error: "listId e gameId são obrigatórios" });
            }
            await listService.addGameToList(listId, resolvedUserId, gameId);
            res.status(200).json({ message: "Jogo adicionado à lista com sucesso" });
        }
        catch (error) {
            console.error("Erro ao adicionar jogo à lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro ao adicionar jogo à lista" });
        }
    },
    removeGameFromList: async (req, res) => {
        try {
            const { listId, gameId } = req.params;
            const authReq = req;
            const tokenUserId = authReq.user?.id;
            const { userId: bodyUserId } = req.body;
            if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
                return res
                    .status(403)
                    .json({ error: "userId não corresponde ao token" });
            }
            const resolvedUserId = tokenUserId ?? bodyUserId;
            if (!listId || !resolvedUserId || !gameId) {
                return res
                    .status(400)
                    .json({ error: "listId e gameId são obrigatórios" });
            }
            await listService.removeGameFromList(listId, resolvedUserId, gameId);
            res.status(200).json({ message: "Jogo removido da lista com sucesso" });
        }
        catch (error) {
            console.error("Erro ao remover jogo da lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro ao remover jogo da lista" });
        }
    },
    makeListPublic: async (req, res) => {
        try {
            const { listId } = req.params;
            const authReq = req;
            const tokenUserId = authReq.user?.id;
            const { userId: bodyUserId } = req.body;
            if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
                return res
                    .status(403)
                    .json({ error: "userId não corresponde ao token" });
            }
            const resolvedUserId = tokenUserId ?? bodyUserId;
            if (!listId || !resolvedUserId) {
                return res.status(400).json({ error: "listId é obrigatório" });
            }
            const list = await listService.makeListPublic(listId, resolvedUserId);
            res.status(200).json(list);
        }
        catch (error) {
            console.error("Erro ao tornar lista pública:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro ao tornar lista pública" });
        }
    },
    makeListPrivate: async (req, res) => {
        try {
            const { listId } = req.params;
            const authReq = req;
            const tokenUserId = authReq.user?.id;
            const { userId: bodyUserId } = req.body;
            if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
                return res
                    .status(403)
                    .json({ error: "userId não corresponde ao token" });
            }
            const resolvedUserId = tokenUserId ?? bodyUserId;
            if (!listId || !resolvedUserId) {
                return res.status(400).json({ error: "listId é obrigatório" });
            }
            const list = await listService.makeListPrivate(listId, resolvedUserId);
            res.status(200).json(list);
        }
        catch (error) {
            console.error("Erro ao tornar lista privada:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro ao tornar lista privada" });
        }
    },
    // Frontend-friendly alias: /lists/:listId without userId query when authorized
    getListByIdAutoUser: async (req, res) => {
        try {
            const authReq = req;
            const { listId } = req.params;
            const userId = req.query.userId ?? authReq.user?.id;
            if (!listId || !userId) {
                return res
                    .status(400)
                    .json({ error: "listId e userId são obrigatórios" });
            }
            const list = await listService.getListById(listId, userId);
            if (!list) {
                return res.status(404).json({ error: "Lista não encontrada" });
            }
            res.status(200).json(list);
        }
        catch (error) {
            console.error("Erro ao buscar lista:", error);
            res.status(500).json({ error: "Erro ao buscar lista" });
        }
    },
    updateList: async (req, res) => {
        try {
            const { listId } = req.params;
            const tokenUserId = req.user?.id;
            const { userId: bodyUserId, name, isPublic, } = req.body;
            if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
                return res
                    .status(403)
                    .json({ error: "userId não corresponde ao token" });
            }
            const resolvedUserId = tokenUserId ?? bodyUserId;
            if (!listId || !resolvedUserId) {
                return res.status(400).json({ error: "listId é obrigatório" });
            }
            if (typeof name !== "string" && typeof isPublic !== "boolean") {
                return res
                    .status(400)
                    .json({ error: "name ou isPublic é obrigatório" });
            }
            const list = await listService.updateList(listId, resolvedUserId, {
                name,
                isPublic,
            });
            res.status(200).json(list);
        }
        catch (error) {
            console.error("Erro ao atualizar lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro ao atualizar lista" });
        }
    },
    removeListGameItem: async (req, res) => {
        try {
            const { listId, listGameId } = req.params;
            const tokenUserId = req.user?.id;
            const { userId: bodyUserId } = req.body;
            if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
                return res
                    .status(403)
                    .json({ error: "userId não corresponde ao token" });
            }
            const resolvedUserId = tokenUserId ?? bodyUserId;
            if (!listId || !listGameId || !resolvedUserId) {
                return res
                    .status(400)
                    .json({ error: "listId e listGameId são obrigatórios" });
            }
            await listService.removeListGameItem(listId, resolvedUserId, listGameId);
            res.status(200).json({ message: "Jogo removido da lista com sucesso" });
        }
        catch (error) {
            console.error("Erro ao remover item da lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro ao remover item da lista" });
        }
    },
};
