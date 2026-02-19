"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const RawgAPIKey = process.env.RAWG_API_KEY;
const rawgApi = axios_1.default.create({
  baseURL: "https://api.rawg.io/api",
  // Best-effort localization: RAWG supports `lang` for localized fields when available.
  params: { key: RawgAPIKey, lang: "pt-br" },
});
class GameService {
  clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }
  toGameboxdRating(avg10) {
    if (typeof avg10 !== "number" || !Number.isFinite(avg10)) return undefined;
    // Reviews are stored as 0..10; UI shows 0..5
    return this.clamp(avg10 / 2, 0, 5);
  }
  async getGameboxdRatingsByRawgIds(rawgIds) {
    const ids = Array.from(new Set(rawgIds.filter(Boolean)));
    if (ids.length === 0) return new Map();
    const games = await prisma_1.default.game.findMany({
      where: { gameId: { in: ids } },
      select: { id: true, gameId: true },
    });
    const internalIds = games.map((g) => g.id);
    if (internalIds.length === 0) return new Map();
    const idToRawgId = new Map(games.map((g) => [g.id, g.gameId]));
    const grouped = await prisma_1.default.review.groupBy({
      by: ["gameId"],
      where: { gameId: { in: internalIds } },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const out = new Map();
    for (const g of grouped) {
      const rawgId = idToRawgId.get(g.gameId);
      if (!rawgId) continue;
      out.set(rawgId, {
        avg10: g._avg.rating ?? null,
        count: g._count._all,
      });
    }
    return out;
  }
  async attachGameboxdRatings(items) {
    const rawgIds = items.map((g) => String(g.id));
    const byRawgId = await this.getGameboxdRatingsByRawgIds(rawgIds);
    return items.map((item) => {
      const entry = byRawgId.get(String(item.id));
      const gameboxdRating = this.toGameboxdRating(entry?.avg10);
      const gameboxdRatingCount = entry?.count ?? 0;
      return {
        ...item,
        ...(gameboxdRating !== undefined ? { gameboxdRating } : {}),
        ...(entry ? { gameboxdRatingCount } : {}),
      };
    });
  }
  stripHtml(html) {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?p\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
  normalizeDescription(raw) {
    if (!raw) return undefined;
    const text = String(raw).replace(/\r\n/g, "\n").trim();
    if (!text) return undefined;
    // Some descriptions may contain multiple language blocks. Keep the first block.
    // This is a safe fallback even when `lang` is ignored by the upstream.
    const cutMarkers = ["\n\nEspañol", "\n\nSpanish", "\n\nEspa1ol"];
    const cutIndexes = cutMarkers
      .map((m) => text.toLowerCase().indexOf(m.toLowerCase()))
      .filter((i) => i > 0)
      .sort((a, b) => a - b);
    if (cutIndexes.length > 0) return text.slice(0, cutIndexes[0]).trim();
    return text;
  }
  formatGameData(game) {
    const descriptionSource =
      typeof game.description === "string" && game.description.trim().length > 0
        ? this.stripHtml(game.description)
        : game.description_raw;
    return {
      id: game.id,
      name: game.name,
      released: game.released,
      background_image: game.background_image,
      rating: game.rating,
      metacritic: game.metacritic,
      description: this.normalizeDescription(descriptionSource),
      genres: game.genres?.map((g) => g.name) || [],
      developers: game.developers?.map((d) => d.name) || [],
      publishers: game.publishers?.map((p) => p.name) || [],
      platforms: game.platforms?.map((p) => p.platform.name) || [],
      dlcs:
        game.additions?.map((d) => ({
          id: d.id,
          name: d.name,
          released: d.released,
        })) || [],
    };
  }
  handleError(message, error) {
    console.error(message, error);
    throw new Error(message);
  }
  getGames = async (page = 1, pageSize = 10, filters) => {
    try {
      const params = { page, page_size: pageSize };
      if (filters?.platforms) params.platforms = filters.platforms;
      if (filters?.genres) params.genres = filters.genres;
      if (filters?.dates) params.dates = filters.dates;
      if (filters?.ordering) params.ordering = filters.ordering;
      const response = await rawgApi.get("/games", {
        params,
      });
      const summaries = response.data.results.map((game) => ({
        id: game.id,
        name: game.name,
        released: game.released,
        background_image: game.background_image,
        rating: game.rating,
        metacritic: game.metacritic,
        genres: game.genres?.map((g) => g.name) || [],
      }));
      const enriched = await this.attachGameboxdRatings(summaries);
      return {
        results: enriched,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      };
    } catch (error) {
      this.handleError("Erro ao obter jogos", error);
    }
  };
  getTrendingGames = async (page = 1, pageSize = 10) => {
    try {
      // Buscar jogos dos últimos 60 dias mais jogados/populares
      const currentDate = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setDate(currentDate.getDate() - 60);
      const dates = `${twoMonthsAgo.toISOString().split("T")[0]},${currentDate.toISOString().split("T")[0]}`;
      const response = await rawgApi.get("/games", {
        params: {
          page,
          page_size: pageSize,
          dates,
          ordering: "-added",
        },
      });
      const summaries = response.data.results.map((game) => ({
        id: game.id,
        name: game.name,
        released: game.released,
        background_image: game.background_image,
        rating: game.rating,
        metacritic: game.metacritic,
        genres: game.genres?.map((g) => g.name) || [],
      }));
      const enriched = await this.attachGameboxdRatings(summaries);
      return {
        results: enriched,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      };
    } catch (error) {
      this.handleError("Erro ao obter jogos em alta", error);
    }
  };
  getRecentGames = async (page = 1, pageSize = 10) => {
    try {
      const currentDate = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
      const dates = `${threeMonthsAgo.toISOString().split("T")[0]},${currentDate.toISOString().split("T")[0]}`;
      const response = await rawgApi.get("/games", {
        params: {
          page,
          page_size: pageSize,
          dates,
          ordering: "-rating,-added",
        },
      });
      const summaries = response.data.results.map((game) => ({
        id: game.id,
        name: game.name,
        released: game.released,
        background_image: game.background_image,
        rating: game.rating,
        metacritic: game.metacritic,
        genres: game.genres?.map((g) => g.name) || [],
      }));
      const enriched = await this.attachGameboxdRatings(summaries);
      return {
        results: enriched,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      };
    } catch (error) {
      this.handleError("Erro ao obter jogos recentes", error);
    }
  };
  searchGames = async (query, page = 1, pageSize = 10, ordering, genres) => {
    try {
      const response = await rawgApi.get("/games", {
        params: {
          search: query,
          page,
          page_size: pageSize,
          ...(ordering ? { ordering } : {}),
          ...(genres ? { genres } : {}),
        },
      });
      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get(`/games/${game.id}/additions`);
          const details = detailsResp.data;
          const dlcs = dlcsResp.data.results;
          return this.formatGameData({ ...details, additions: dlcs });
        }),
      );
      const enriched = await this.attachGameboxdRatings(detailedGames);
      return {
        results: enriched,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      };
    } catch (error) {
      this.handleError("Erro ao buscar jogos", error);
    }
  };
  getGenres = async () => {
    try {
      // RAWG typically caps `page_size` (often 40), so paginate to ensure we
      // return all available genres.
      const pageSize = 40;
      const maxPages = 25;
      let page = 1;
      let next = null;
      const collected = [];
      do {
        const response = await rawgApi.get("/genres", {
          params: {
            page,
            page_size: pageSize,
          },
        });
        const batch = (response.data.results ?? [])
          .map((g) => ({ id: g.id, name: g.name, slug: g.slug }))
          .filter((g) => Boolean(g.slug) && Boolean(g.name));
        collected.push(...batch);
        next = response.data.next;
        page += 1;
      } while (next && page <= maxPages);
      const uniqueBySlug = new Map();
      for (const g of collected) uniqueBySlug.set(g.slug, g);
      return Array.from(uniqueBySlug.values()).sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      );
    } catch (error) {
      this.handleError("Erro ao obter gêneros", error);
    }
  };
  searchGamesByPlatform = async (platformId, page = 1, pageSize = 10) => {
    try {
      const response = await rawgApi.get("/games", {
        params: { platforms: platformId, page, page_size: pageSize },
      });
      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get(`/games/${game.id}/additions`);
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        }),
      );
      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por plataforma", error);
    }
  };
  searchGamesByGenre = async (genreId, page = 1, pageSize = 10) => {
    try {
      const response = await rawgApi.get("/games", {
        params: { genres: genreId, page, page_size: pageSize },
      });
      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get(`/games/${game.id}/additions`);
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        }),
      );
      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por gênero", error);
    }
  };
  searchGamesByDlc = async (dlcId, page = 1, pageSize = 10) => {
    try {
      const dlcResp = await rawgApi.get(`/games/${dlcId}/additions`, {
        params: { page, page_size: pageSize },
      });
      const detailedGames = await Promise.all(
        dlcResp.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get(`/games/${game.id}/additions`);
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        }),
      );
      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por DLC", error);
    }
  };
  getGameDetails = async (gameId) => {
    try {
      const detailsResp = await rawgApi.get(`/games/${gameId}`);
      const dlcsResp = await rawgApi.get(`/games/${gameId}/additions`);
      const details = this.formatGameData({
        ...detailsResp.data,
        additions: dlcsResp.data.results,
      });
      const enriched = await this.attachGameboxdRatings([details]);
      return enriched[0];
    } catch (error) {
      this.handleError("Erro ao buscar detalhes do jogo", error);
    }
  };
  likeGame = async (userId, gameId) => {
    try {
      let game = await prisma_1.default.game.findUnique({
        where: { gameId },
      });
      if (!game) {
        game = await prisma_1.default.game.create({
          data: {
            gameId,
            isLiked: false,
          },
        });
      }
      const existingLike = await prisma_1.default.userLikedGame.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId: game.id,
          },
        },
      });
      if (existingLike) {
        await prisma_1.default.userLikedGame.delete({
          where: {
            id: existingLike.id,
          },
        });
        return { message: "Curtida removida com sucesso", liked: false };
      } else {
        await prisma_1.default.userLikedGame.create({
          data: {
            userId,
            gameId: game.id,
          },
        });
        return { message: "Jogo curtido com sucesso", liked: true };
      }
    } catch (error) {
      this.handleError("Erro ao curtir jogo", error);
    }
  };
  getUserLikedGames = async (userId) => {
    try {
      const likedGames = await prisma_1.default.userLikedGame.findMany({
        where: { userId },
        include: { game: true },
      });
      return likedGames.map((like) => like.game.gameId);
    } catch (error) {
      this.handleError("Erro ao buscar jogos curtidos", error);
    }
  };
  setGameStatus = async (userId, gameId, status) => {
    try {
      // Verifica se o jogo já existe no banco
      let game = await prisma_1.default.game.findUnique({
        where: { gameId },
      });
      if (!game) {
        game = await prisma_1.default.game.create({
          data: {
            gameId,
          },
        });
      }
      const existingStatus = await prisma_1.default.userGameStatus.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId: game.id,
          },
        },
      });
      if (existingStatus) {
        await prisma_1.default.userGameStatus.update({
          where: {
            id: existingStatus.id,
          },
          data: {
            status,
          },
        });
        return { message: "Status do jogo atualizado com sucesso", status };
      } else {
        // Cria novo status
        await prisma_1.default.userGameStatus.create({
          data: {
            userId,
            gameId: game.id,
            status,
          },
        });
        return { message: "Status do jogo definido com sucesso", status };
      }
    } catch (error) {
      this.handleError("Erro ao definir status do jogo", error);
    }
  };
  removeGameStatus = async (userId, gameId) => {
    try {
      const game = await prisma_1.default.game.findUnique({
        where: { gameId },
      });
      if (!game) {
        throw new Error("Jogo não encontrado");
      }
      await prisma_1.default.userGameStatus.deleteMany({
        where: {
          userId,
          gameId: game.id,
        },
      });
      return { message: "Status do jogo removido com sucesso" };
    } catch (error) {
      this.handleError("Erro ao remover status do jogo", error);
    }
  };
  getUserGamesByStatus = async (userId, status) => {
    try {
      const where = status ? { userId, status } : { userId };
      const games = await prisma_1.default.userGameStatus.findMany({
        where,
        include: { game: true },
        orderBy: { updatedAt: "desc" },
      });
      return games.map((gameStatus) => ({
        gameId: gameStatus.game.gameId,
        status: gameStatus.status,
        updatedAt: gameStatus.updatedAt,
      }));
    } catch (error) {
      this.handleError("Erro ao buscar jogos por status", error);
    }
  };
}
exports.GameService = GameService;
