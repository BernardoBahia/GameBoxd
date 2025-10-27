import axios from "axios";

const RawgAPIKey = process.env.RAWG_API_KEY;

const rawgApi = axios.create({
  baseURL: "https://api.rawg.io/api",
  params: {
    key: RawgAPIKey,
  },
});

export class GameService {
  getGames = async (page: number = 1, pageSize: number = 10) => {
    try {
      const response = await rawgApi.get("/games", {
        params: {
          page,
          page_size: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao obter jogos:", error);
      throw new Error("Falha ao obter jogos");
    }
  };

  searchGames = async (
    query: string,
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      const response = await rawgApi.get("/games", {
        params: {
          search: query,
          page,
          page_size: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      throw new Error("Falha ao buscar jogos");
    }
  };

  searchGamesByPlatform = async (
    platformId: number,
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      const response = await rawgApi.get("/games", {
        params: {
          platforms: platformId,
          page,
          page_size: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar jogos por plataforma:", error);
      throw new Error("Falha ao buscar jogos por plataforma");
    }
  };

  searchGamesByGenre = async (
    genreId: string,
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      const response = await rawgApi.get("/games", {
        params: {
          genres: genreId,
          page,
          page_size: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar jogos por gênero:", error);
      throw new Error("Falha ao buscar jogos por gênero");
    }
  };

  searchGamesByDlc = async (
    dlcId: number,
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      const response = await rawgApi.get("/games", {
        params: {
          dlc: dlcId,
          page,
          page_size: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar jogos por DLC:", error);
      throw new Error("Falha ao buscar jogos por DLC");
    }
  };

  getGameDetails = async (gameId: string) => {
    const response = await rawgApi.get(`/games/${gameId}`);
    return response.data;
  };
}
