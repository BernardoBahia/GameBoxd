import { useState, useEffect } from "react";
import { listService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { List } from "../types";

interface AddToListModalProps {
  gameId: string;
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToListModal({
  gameId,
  gameName,
  isOpen,
  onClose,
}: AddToListModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>("");

  useEffect(() => {
    if (isOpen && user) {
      fetchLists();
    }
  }, [isOpen, user]);

  const fetchLists = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userLists = await listService.getListsByUserId(user.id);
      setLists(userLists);
    } catch (err) {
      showToast("Erro ao carregar listas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async () => {
    if (!user || !selectedListId) return;

    try {
      setAdding(true);
      await listService.addGameToList(selectedListId, {
        userId: user.id,
        gameId,
      });
      showToast(`${gameName} adicionado à lista!`, "success");
      onClose();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || "Erro ao adicionar jogo à lista";
      showToast(errorMsg, "error");
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Adicionar à Lista
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Selecione uma lista para adicionar <strong>{gameName}</strong>
        </p>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você ainda não tem listas
            </p>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/my-lists";
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Criar Primeira Lista
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    selectedListId === list.id
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {list.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        list.isPublic
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {list.isPublic ? "Pública" : "Privada"}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddToList}
                disabled={!selectedListId || adding}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
              >
                {adding ? "Adicionando..." : "Adicionar"}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
