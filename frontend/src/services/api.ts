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

// Helper function to define time period
export const defineTimePeriod = (timePeriod: TimePeriod, referenceDate: Date) => {
  // Get start of reference date
  referenceDate.setHours(0)
  referenceDate.setMinutes(0)
  referenceDate.setSeconds(0)
  referenceDate.setMilliseconds(0)
  
  let start_date = new Date(referenceDate)
  let end_date = new Date(referenceDate)

  switch (timePeriod) {
    case TIME_PERIODS.PAST_DAY:
      // Set start date to one day before reference date
      start_date.setDate(referenceDate.getDate() - 1)
      break
    case TIME_PERIODS.PAST_WEEK:
      // Set start date to 7 days before reference date
      start_date.setDate(referenceDate.getDate() - 7)
      break
    case TIME_PERIODS.PAST_MONTH:
      // Set start date to one month before reference date
      start_date.setMonth(referenceDate.getMonth() - 1)
      break
    case TIME_PERIODS.PAST_YEAR:
      // Set start date to one year before reference date
      start_date.setFullYear(referenceDate.getFullYear() - 1)
      break
    case TIME_PERIODS.LAST_WEEK:
      // Set date range to last full week before reference date
      const day = referenceDate.getDay() - 1
      end_date.setDate(referenceDate.getDate() - (day !== -1 ? day : 6))
      start_date.setDate(referenceDate.getDate() - 7 - (day !== -1 ? day : 6))
      break
    case TIME_PERIODS.LAST_MONTH:
      // Set date range to last full month before reference date
      end_date.setDate(1)
      start_date.setMonth(referenceDate.getMonth() - 1)
      start_date.setDate(1)
      break
    case TIME_PERIODS.LAST_YEAR:
      // Set date range to last full year before reference date
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

  getComparativeScoreboard: async (timePeriod: TimePeriod, sources_group_a: NewsSource[], sources_group_b: NewsSource[], scoreboardSize: number, referenceDate: Date) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('test_get_comparative_words_scoreboard', {
        start_date,
        end_date,
        sources_group_a,
        sources_group_b,
        size: scoreboardSize
      })
      .select('*')
  },

  getAssociatedScoreboard: async (timePeriod: TimePeriod, sources: NewsSource[], search_term: string, scoreboardSize: number, referenceDate: Date) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('get_associated_words_scoreboard', {
        start_date,
        end_date,
        sources,
        search_term,
        size: scoreboardSize
      })
      .select('*')
  },

  getComparativeAssociatedScoreboard: async (timePeriod: TimePeriod, sources_group_a: NewsSource[], sources_group_b: NewsSource[], search_term: string, scoreboardSize: number, referenceDate: Date) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('get_comparative_associated_words_scoreboard', {
        start_date,
        end_date,
        sources_group_a,
        sources_group_b,
        search_term,
        size: scoreboardSize
      })
      .select('*')
  },
}

// User API
export const userAPI = {
  createUser: async (user: User) => {
    return await supabase.from('users').insert(user)
  },

  getUser: async (userId: string) => {
    return await supabase.from('users').select('*').eq('id', userId)
  },

  getSingleUser: async (userId: string) => {
    return await supabase.from('users').select('*').eq('id', userId).single()
  },

  updateUser: async (user: User, userId: string) => {
    return await supabase.from('users').update(user).eq('id', userId)
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
