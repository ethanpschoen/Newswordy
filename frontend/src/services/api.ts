import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  AuthResponse, 
  User, 
  Game, 
  GameState, 
  ScoreboardEntry, 
  CreateGameRequest, 
  SubmitGuessRequest,
  LeaderboardEntry,
  UserStats
} from '../types';
import { useAuth0 } from '@auth0/auth0-react';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from Auth0
    const { getAccessTokenSilently } = useAuth0();
    try {
      const token = await getAccessTokenSilently();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, username: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', { email, username, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Game API
export const gameAPI = {
  createGame: async (data: CreateGameRequest): Promise<ApiResponse<{ game: Game }>> => {
    const response = await api.post('/game/create', data);
    return response.data;
  },

  getGameState: async (gameId: string): Promise<ApiResponse<GameState>> => {
    const response = await api.get(`/game/${gameId}`);
    return response.data;
  },

  submitGuess: async (gameId: string, data: SubmitGuessRequest): Promise<ApiResponse<{
    guess: any;
    newScore: number;
    remainingGuesses: number;
  }>> => {
    const response = await api.post(`/game/${gameId}/guess`, data);
    return response.data;
  },

  getScoreboard: async (gameId: string): Promise<ApiResponse<{ scoreboard: ScoreboardEntry[] }>> => {
    const response = await api.get(`/game/${gameId}/scoreboard`);
    return response.data;
  },

  endGame: async (gameId: string): Promise<ApiResponse<{ game: Game }>> => {
    const response = await api.post(`/game/${gameId}/end`);
    return response.data;
  },
};

// User API
export const userAPI = {
  getUserStats: async (): Promise<ApiResponse<UserStats>> => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  updateProfile: async (username: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/user/profile', { username });
    return response.data;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobalLeaderboard: async (limit = 50, offset = 0): Promise<ApiResponse<{
    leaderboard: LeaderboardEntry[];
    userRank: number | null;
    total: number;
  }>> => {
    const response = await api.get(`/leaderboard/global?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getTimePeriodLeaderboard: async (timePeriod: string, limit = 50, offset = 0): Promise<ApiResponse<{
    timePeriod: string;
    leaderboard: LeaderboardEntry[];
    userRank: number | null;
    total: number;
  }>> => {
    const response = await api.get(`/leaderboard/time-period/${timePeriod}?limit=${limit}&offset=${offset}`);
    return response.data;
  },
};

export default api;
