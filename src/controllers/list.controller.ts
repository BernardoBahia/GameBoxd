import { Request, Response } from "express";
import { ListService } from "../services/list.service";

const listService = new ListService();

export const ListController = {
  createList: async (req: Request, res: Response) => {
    try {
      const { name, userId } = req.body;

      if (!name || !userId) {
        return res
          .status(400)
          .json({ error: "Nome e userId são obrigatórios" });
      }

      const list = await listService.createList(name, userId);
      res.status(201).json(list);
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      res.status(500).json({ error: "Erro ao criar lista" });
    }
  },

  getListsByUserId: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const lists = await listService.getListsByUserId(userId);
      res.status(200).json(lists);
    } catch (error) {
      console.error("Erro ao buscar listas do usuário:", error);
      res.status(500).json({ error: "Erro ao buscar listas do usuário" });
    }
  },

  getListById: async (req: Request, res: Response) => {
    try {
      const { listId } = req.params;
      const { userId } = req.query;

      if (!listId || !userId) {
        return res
          .status(400)
          .json({ error: "listId e userId são obrigatórios" });
      }

      const list = await listService.getListById(listId, userId as string);

      if (!list) {
        return res.status(404).json({ error: "Lista não encontrada" });
      }

      res.status(200).json(list);
    } catch (error) {
      console.error("Erro ao buscar lista:", error);
      res.status(500).json({ error: "Erro ao buscar lista" });
    }
  },

  deleteList: async (req: Request, res: Response) => {
    try {
      const { listId } = req.params;
      const { userId } = req.body;

      if (!listId || !userId) {
        return res
          .status(400)
          .json({ error: "listId e userId são obrigatórios" });
      }

      await listService.deleteList(listId, userId);
      res.status(200).json({ message: "Lista deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar lista:", error);
      res.status(500).json({ error: "Erro ao deletar lista" });
    }
  },

  renameList: async (req: Request, res: Response) => {
    try {
      const { listId } = req.params;
      const { userId, newName } = req.body;

      if (!listId || !userId || !newName) {
        return res
          .status(400)
          .json({ error: "listId, userId e newName são obrigatórios" });
      }

      const list = await listService.renameList(listId, userId, newName);
      res.status(200).json(list);
    } catch (error) {
      console.error("Erro ao renomear lista:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro ao renomear lista" });
    }
  },

  addGameToList: async (req: Request, res: Response) => {
    try {
      const { listId } = req.params;
      const { userId, gameId } = req.body;

      if (!listId || !userId || !gameId) {
        return res
          .status(400)
          .json({ error: "listId, userId e gameId são obrigatórios" });
      }

      await listService.addGameToList(listId, userId, gameId);
      res.status(200).json({ message: "Jogo adicionado à lista com sucesso" });
    } catch (error) {
      console.error("Erro ao adicionar jogo à lista:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro ao adicionar jogo à lista" });
    }
  },

  removeGameFromList: async (req: Request, res: Response) => {
    try {
      const { listId, gameId } = req.params;
      const { userId } = req.body;

      if (!listId || !userId || !gameId) {
        return res
          .status(400)
          .json({ error: "listId, userId e gameId são obrigatórios" });
      }

      await listService.removeGameFromList(listId, userId, gameId);
      res.status(200).json({ message: "Jogo removido da lista com sucesso" });
    } catch (error) {
      console.error("Erro ao remover jogo da lista:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro ao remover jogo da lista" });
    }
  },

  makeListPublic: async (req: Request, res: Response) => {
    try {
      const { listId } = req.params;
      const { userId } = req.body;

      if (!listId || !userId) {
        return res
          .status(400)
          .json({ error: "listId e userId são obrigatórios" });
      }

      const list = await listService.makeListPublic(listId, userId);
      res.status(200).json(list);
    } catch (error) {
      console.error("Erro ao tornar lista pública:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro ao tornar lista pública" });
    }
  },

  makeListPrivate: async (req: Request, res: Response) => {
    try {
      const { listId } = req.params;
      const { userId } = req.body;

      if (!listId || !userId) {
        return res
          .status(400)
          .json({ error: "listId e userId são obrigatórios" });
      }

      const list = await listService.makeListPrivate(listId, userId);
      res.status(200).json(list);
    } catch (error) {
      console.error("Erro ao tornar lista privada:", error);
      if (error instanceof Error && error.message.includes("não encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro ao tornar lista privada" });
    }
  },
};
