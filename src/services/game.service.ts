import axios from "axios";
import {
  RawgGame,
  RawgListResponse,
  GameSummary,
  GameDetails,
} from "../models/game.model";

const RawgAPIKey = process.env.RAWG_API_KEY;

const rawgApi = axios.create({
  baseURL: "https://api.rawg.io/api",
  params: { key: RawgAPIKey },
});

export class GameService {
  private formatGameData(game: RawgGame): GameDetails {
    return {
      id: game.id,
      name: game.name,
      released: game.released,
      background_image: game.background_image,
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

  private handleError(message: string, error: unknown): never {
    console.error(message, error);
    throw new Error(message);
  }

  getGames = async (page = 1, pageSize = 10): Promise<GameSummary[]> => {
    try {
      const response = await rawgApi.get<RawgListResponse>("/games", {
        params: { page, page_size: pageSize },
      });

      return response.data.results.map(
        (game): GameSummary => ({
          id: game.id,
          name: game.name,
          released: game.released,
          background_image: game.background_image,
        })
      );
    } catch (error) {
      this.handleError("Erro ao obter jogos", error);
    }
  };

  searchGames = async (
    query: string,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> => {
    try {
      const response = await rawgApi.get<RawgListResponse>("/games", {
        params: { search: query, page, page_size: pageSize },
      });

      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get<RawgGame>(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get<RawgListResponse>(
            `/games/${game.id}/additions`
          );
          const details = detailsResp.data;
          const dlcs = dlcsResp.data.results;

          return this.formatGameData({ ...details, additions: dlcs });
        })
      );

      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos", error);
    }
  };

  searchGamesByPlatform = async (
    platformId: number,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> => {
    try {
      const response = await rawgApi.get<RawgListResponse>("/games", {
        params: { platforms: platformId, page, page_size: pageSize },
      });

      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get<RawgGame>(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get<RawgListResponse>(
            `/games/${game.id}/additions`
          );
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        })
      );

      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por plataforma", error);
    }
  };

  searchGamesByGenre = async (
    genreId: number,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> => {
    try {
      const response = await rawgApi.get<RawgListResponse>("/games", {
        params: { genres: genreId, page, page_size: pageSize },
      });

      const detailedGames = await Promise.all(
        response.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get<RawgGame>(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get<RawgListResponse>(
            `/games/${game.id}/additions`
          );
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        })
      );

      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por gênero", error);
    }
  };

  searchGamesByDlc = async (
    dlcId: number,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> => {
    try {
      const dlcResp = await rawgApi.get<RawgListResponse>(
        `/games/${dlcId}/additions`,
        {
          params: { page, page_size: pageSize },
        }
      );

      const detailedGames = await Promise.all(
        dlcResp.data.results.map(async (game) => {
          const detailsResp = await rawgApi.get<RawgGame>(`/games/${game.id}`);
          const dlcsResp = await rawgApi.get<RawgListResponse>(
            `/games/${game.id}/additions`
          );
          return this.formatGameData({
            ...detailsResp.data,
            additions: dlcsResp.data.results,
          });
        })
      );

      return detailedGames;
    } catch (error) {
      this.handleError("Erro ao buscar jogos por DLC", error);
    }
  };

  getGameDetails = async (gameId: number): Promise<GameDetails> => {
    try {
      const detailsResp = await rawgApi.get<RawgGame>(`/games/${gameId}`);
      const dlcsResp = await rawgApi.get<RawgListResponse>(
        `/games/${gameId}/additions`
      );
      return this.formatGameData({
        ...detailsResp.data,
        additions: dlcsResp.data.results,
      });
    } catch (error) {
      this.handleError("Erro ao buscar detalhes do jogo", error);
    }
  };
}
