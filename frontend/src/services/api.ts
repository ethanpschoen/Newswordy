import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  ApiResponse, 
  User, 
  Game, 
  GameState, 
  ScoreboardEntry, 
  CreateGameRequest, 
  SubmitGuessRequest,
  LeaderboardEntry,
  UserStats
} from '../types'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper function to set session ID for anonymous games
const setSessionId = (sessionId: string): void => {
  localStorage.setItem('newswordy_session_id', sessionId)
}

// Helper function to clear session ID
const clearSessionId = (): void => {
  localStorage.removeItem('newswordy_session_id')
}

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session ID on authentication error
      clearSessionId()
      // Redirect to home on authentication error
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Helper function to set Auth0 token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    // Clear session ID when authenticated
    clearSessionId()
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Helper function to set session ID for anonymous games
export const setAnonymousSession = (sessionId: string) => {
  setSessionId(sessionId)
  // Set session ID in headers for API calls
  api.defaults.headers.common['x-session-id'] = sessionId
}

// Auth API - only profile endpoint since Auth0 handles login/register
export const authAPI = {
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

// Game API
export const gameAPI = {
  createGame: async (data: CreateGameRequest): Promise<ApiResponse<{ game: Game }>> => {
    const response = await api.post('/game/create', data)
    
    // If this is an anonymous game, store the session ID
    if (response.data.success && response.data.data?.game?.session_id) {
      setAnonymousSession(response.data.data.game.session_id)
    }
    
    return response.data
  },

  getGameState: async (gameId: string): Promise<ApiResponse<GameState>> => {
    const response = await api.get(`/game/${gameId}`)
    return response.data
  },

  submitGuess: async (gameId: string, data: SubmitGuessRequest): Promise<ApiResponse<{
    guess: any
    newScore: number
    remainingGuesses: number
  }>> => {
    const response = await api.post(`/game/${gameId}/guess`, data)
    return response.data
  },

  getScoreboard: async (gameId: string): Promise<ApiResponse<{ scoreboard: ScoreboardEntry[] }>> => {
    const response = await api.get(`/game/${gameId}/scoreboard`)
    return response.data
  },

  endGame: async (gameId: string): Promise<ApiResponse<{ game: Game }>> => {
    const response = await api.post(`/game/${gameId}/end`)
    return response.data
  },
}

// User API
export const userAPI = {
  getUserStats: async (): Promise<ApiResponse<UserStats>> => {
    const response = await api.get('/user/stats')
    return response.data
  },

  updateProfile: async (username: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/user/profile', { username })
    return response.data
  },
}

// Leaderboard API
export const leaderboardAPI = {
  getGlobalLeaderboard: async (limit = 50, offset = 0): Promise<ApiResponse<{
    leaderboard: LeaderboardEntry[]
    userRank: number | null
    total: number
  }>> => {
    const response = await api.get(`/leaderboard/global?limit=${limit}&offset=${offset}`)
    return response.data
  },

  getTimePeriodLeaderboard: async (timePeriod: string, limit = 50, offset = 0): Promise<ApiResponse<{
    timePeriod: string
    leaderboard: LeaderboardEntry[]
    userRank: number | null
    total: number
  }>> => {
    const response = await api.get(`/leaderboard/time-period/${timePeriod}?limit=${limit}&offset=${offset}`)
    return response.data
  },
}

export default api
