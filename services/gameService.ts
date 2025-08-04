import api from './api';

const API_BASE_URL = 'http://localhost:3000/api';

export interface GameState {
  isOver: boolean;
  winner: string | null;
  isDraw: boolean;
  _id: string;
}

export interface GameSession {
  id: string;
  board: string[][];
  currentPlayer: string;
  gameState: GameState;
  isComputerFirst: boolean;
}

export interface GameResponse {
  gameSession: GameSession;
}

export interface StartGamePayload {
  isComputerFirst: boolean;
}

export interface MovePayload {
  row: number;
  col: number;
}

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  _id: string;
}

export interface GameStatsResponse {
  stats: GameStats;
}

export const gameService = {
  startGame: async (isComputerFirst: boolean): Promise<GameResponse> => {
    try {
      const response = await api.post<GameResponse>(`${API_BASE_URL}/game/start`, {
        isComputerFirst,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to start game"
      );
    }
  },

  getCurrentGame: async (): Promise<GameResponse> => {
    try {
      const response = await api.get<GameResponse>(`${API_BASE_URL}/game/current`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to get current game"
      );
    }
  },

  makeMove: async (row: number, col: number): Promise<GameResponse> => {
    try {
      const response = await api.post<GameResponse>(`${API_BASE_URL}/game/move`, {
        row,
        col,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Invalid move"
      );
    }
  },

  getUserStats: async (): Promise<GameStatsResponse> => {
    try {
      const response = await api.get<GameStatsResponse>(`${API_BASE_URL}/game/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to get user stats"
      );
    }
  },
}; 