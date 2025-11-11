import axios, { AxiosInstance } from 'axios'
import { 
  ApiResponse,
  User,
  Game,
  Guess,
  LeaderboardEntry,
  TimePeriod,
  NewsSource,
  TIME_PERIODS
} from '../types'
import { supabase } from './supabaseClient'

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

export const defineTimePeriod = (timePeriod: TimePeriod, referenceDate: Date) => {
  referenceDate.setHours(0)
  referenceDate.setMinutes(0)
  referenceDate.setSeconds(0)
  referenceDate.setMilliseconds(0)
  let start_date = new Date(referenceDate)
  let end_date = new Date(referenceDate)
  switch (timePeriod) {
    case TIME_PERIODS.PAST_DAY:
      start_date.setDate(referenceDate.getDate() - 1)
      break
    case TIME_PERIODS.PAST_WEEK:
      start_date.setDate(referenceDate.getDate() - 7)
      break
    case TIME_PERIODS.PAST_MONTH:
      start_date.setMonth(referenceDate.getMonth() - 1)
      break
    case TIME_PERIODS.PAST_YEAR:
      start_date.setFullYear(referenceDate.getFullYear() - 1)
      break
    case TIME_PERIODS.LAST_WEEK:
      const day = referenceDate.getDay() - 1
      end_date.setDate(referenceDate.getDate() - (day !== -1 ? day : 6))
      start_date.setDate(referenceDate.getDate() - 7 - (day !== -1 ? day : 6))
      break
    case TIME_PERIODS.LAST_MONTH:
      end_date.setDate(1)
      start_date.setMonth(referenceDate.getMonth() - 1)
      start_date.setDate(1)
      break
    case TIME_PERIODS.LAST_YEAR:
      end_date.setMonth(0)
      end_date.setDate(1)
      start_date.setFullYear(referenceDate.getFullYear() - 1)
      start_date.setMonth(0)
      start_date.setDate(1)
      break
  }
  return { start_date: start_date.toISOString(), end_date: end_date.toISOString() }
}

// Game API
export const gameAPI = {
  createGame: async (game: Game) => {
    return await supabase
      .from('games')
      .insert([game])
      .select('id')
      .single()
  },

  // TODO: validate user with game?
  getGameState: async (gameId: string) => {
    return await supabase
      .from('games')
      .select(`
        *,
        guesses(*)
      `)
      .eq('id', gameId)
      .maybeSingle()
  },

  // TODO: validate user with game?
  updateGameState: async (game: Game, gameId: string) => {
    return await supabase.from('games').update(game).eq('id', gameId)
  },

  submitGuess: async (data: Guess) => {
    return await supabase.from('guesses').insert(data)
  },

  getScoreboard: async (timePeriod: TimePeriod, sources: NewsSource[], scoreboardSize: number, referenceDate: Date) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('get_top_words_scoreboard', {
        start_date,
        end_date,
        sources,
        size: scoreboardSize
      })
      .select('*')
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
