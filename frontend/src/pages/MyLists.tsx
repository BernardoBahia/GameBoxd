import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { listService } from "../services";
import type { List, GameSummary } from "../types";
import { Navbar, LoadingSpinner } from "../components";

export default function MyLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [listGames, setListGames] = useState<GameSummary[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);

  // Create list form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListIsPublic, setNewListIsPublic] = useState(false);
  const [creatingList, setCreatingList] = useState(false);

  // Edit list
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState("");

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user]);

  const fetchLists = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userLists = await listService.getListsByUserId(user.id);
      setLists(userLists);
    } catch (err) {
      console.error("Erro ao carregar listas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchListGames = async (listId: string) => {
    try {
      setLoadingGames(true);
      await listService.getListById(listId, user!.id);
      // Assumindo que a API retorna os jogos na lista
      // Por ora, vamos apenas mostrar IDs (você pode melhorar buscando detalhes)
      setListGames([]);
    } catch (err) {
      console.error("Erro ao carregar jogos da lista:", err);
    } finally {
      setLoadingGames(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newListName.trim()) return;

    try {
      setCreatingList(true);
      const newList = await listService.createList({
        userId: user.id,
        name: newListName,
      });
      // Depois fazer a lista pública se necessário
      if (newListIsPublic) {
        await listService.makeListPublic(newList.id, user.id);
        newList.isPublic = true;
      }
      setLists([...lists, newList]);
      setShowCreateForm(false);
      setNewListName("");
      setNewListIsPublic(false);
    } catch (err) {
      console.error("Erro ao criar lista:", err);
      alert("Erro ao criar lista");
    } finally {
      setCreatingList(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Deseja realmente deletar esta lista?")) return;

    try {
      await listService.deleteList(listId, user!.id);
      setLists(lists.filter((l) => l.id !== listId));
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
    } catch (err) {
      console.error("Erro ao deletar lista:", err);
      alert("Erro ao deletar lista");
    }
  };

  const handleRenameList = async (listId: string) => {
    if (!editListName.trim()) return;

    try {
      await listService.renameList(listId, user!.id, editListName);
      setLists(
        lists.map((l) => (l.id === listId ? { ...l, name: editListName } : l))
      );
      setEditingListId(null);
      setEditListName("");
      if (selectedList?.id === listId) {
        setSelectedList({ ...selectedList, name: editListName });
      }
    } catch (err) {
      console.error("Erro ao renomear lista:", err);
      alert("Erro ao renomear lista");
    }
  };

  const handleTogglePublic = async (listId: string, isPublic: boolean) => {
    try {
      if (isPublic) {
        await listService.makeListPrivate(listId, user!.id);
      } else {
        await listService.makeListPublic(listId, user!.id);
      }
      setLists(
        lists.map((l) => (l.id === listId ? { ...l, isPublic: !isPublic } : l))
      );
      if (selectedList?.id === listId) {
        setSelectedList({ ...selectedList, isPublic: !isPublic });
      }
    } catch (err) {
      console.error("Erro ao alterar privacidade:", err);
      alert("Erro ao alterar privacidade");
    }
  };

  const handleSelectList = (list: List) => {
    setSelectedList(list);
    fetchListGames(list.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Você precisa estar logado para ver suas listas
          </h1>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Minhas Listas</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Nova Lista
          </button>
        </div>

        {/* Create List Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Criar Nova Lista</h2>
              <form onSubmit={handleCreateList}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Nome da Lista
                  </label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Meus jogos favoritos"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newListIsPublic}
                      onChange={(e) => setNewListIsPublic(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Lista pública</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creatingList}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {creatingList ? "Criando..." : "Criar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName("");
                      setNewListIsPublic(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lists Grid */}
        {lists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-6">
              Você ainda não criou nenhuma lista
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Criar Primeira Lista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lists Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition ${
                    selectedList?.id === list.id
                      ? "ring-2 ring-indigo-600"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => handleSelectList(list)}
                >
                  {editingListId === list.id ? (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editListName}
                        onChange={(e) => setEditListName(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameList(list.id)}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingListId(null);
                          setEditListName("");
                        }}
                        className="px-2 py-1 bg-gray-300 rounded text-sm"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{list.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            list.isPublic
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {list.isPublic ? "Pública" : "Privada"}
                        </span>
                      </div>
                      <div
                        className="flex gap-2 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingListId(list.id);
                            setEditListName(list.name);
                          }}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Renomear
                        </button>
                        <button
                          onClick={() =>
                            handleTogglePublic(list.id, list.isPublic)
                          }
                          className="text-gray-600 hover:text-gray-800"
                        >
                          {list.isPublic ? "Tornar Privada" : "Tornar Pública"}
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Deletar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* List Details */}
            <div className="lg:col-span-2">
              {selectedList ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {selectedList.name}
                  </h2>

                  {loadingGames ? (
                    <div className="text-center py-8">
                      <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                  ) : listGames.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">
                        Esta lista ainda não tem jogos
                      </p>
                      <Link
                        to="/games"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Adicionar Jogos
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {listGames.map((game) => (
                        <Link
                          key={game.id}
                          to={`/games/${game.id}`}
                          className="group"
                        >
                          <img
                            src={
                              game.background_image || "/placeholder-game.jpg"
                            }
                            alt={game.name}
                            className="w-full h-40 object-cover rounded-lg shadow group-hover:shadow-lg transition"
                          />
                          <h3 className="mt-2 font-semibold text-sm group-hover:text-indigo-600 transition">
                            {game.name}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600">
                    Selecione uma lista para ver seus jogos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
