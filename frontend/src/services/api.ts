import axios, { AxiosInstance } from 'axios'
import {
  ApiResponse,
  User,
  Game,
  CompareGame,
  Guess,
  LeaderboardEntry,
  TimePeriod,
  NewsSource,
  TIME_PERIODS,
  AssociateGame,
  CompareAssociateGame,
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
  /**
   * Creates a new classic game in the database
   * @param game - The game object to create
   * @returns The game ID
   */
  createGame: async (game: Game) => {
    return await supabase.from('games').insert([game]).select('id').single()
  },

  // TODO: validate user with game?
  /**
   * Gets the classic game state from the database
   * @param gameId - The ID of the game to get the state of
   * @returns The game state
   */
  getGameState: async (gameId: string) => {
    return await supabase
      .from('games')
      .select(
        `
          *,
          guesses(*)
        `,
      )
      .eq('id', gameId)
      .maybeSingle()
  },

  // TODO: validate user with game?
  /**
   * Updates the classic game state in the database
   * @param game - The updated game object
   * @param gameId - The ID of the game to update
   */
  updateGameState: async (game: Game, gameId: string) => {
    return await supabase.from('games').update(game).eq('id', gameId)
  },

  /**
   * Submits a classic guess to the database
   * @param data - The guess object to submit
   */
  submitGuess: async (data: Guess) => {
    return await supabase.from('guesses').insert(data)
  },

  /**
   * Gets the top words scoreboard for a classic game from the database
   * This uses a PostgreSQL stored procedure to get the top words for a given time period, sources, and reference date
   * @param timePeriod - The time period to get the scoreboard for
   * @param sources - The sources to get the scoreboard for
   * @param scoreboardSize - The size of the scoreboard
   * @param referenceDate - The reference date to get the scoreboard for
   * @returns The scoreboard
   */
  getScoreboard: async (timePeriod: TimePeriod, sources: NewsSource[], scoreboardSize: number, referenceDate: Date) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('get_top_words_scoreboard', {
        start_date,
        end_date,
        sources,
        size: scoreboardSize,
      })
      .select('*')
  },

  /**
   * Creates a new comparative game in the database
   * @param game - The comparative game object to create
   * @returns The comparative game ID
   */
  createComparativeGame: async (game: CompareGame) => {
    return await supabase.from('compare_games').insert(game).select('id').single()
  },

  // TODO: validate user with game?
  /**
   * Gets the comparative game state from the database
   * @param gameId - The ID of the comparative game to get the state of
   * @returns The comparative game state
   */
  getComparativeGameState: async (gameId: string) => {
    return await supabase
      .from('compare_games')
      .select(
        `
          *,
          compare_guesses(*)
        `,
      )
      .eq('id', gameId)
      .maybeSingle()
  },

  // TODO: validate user with game?
  /**
   * Updates the comparative game state in the database
   * @param game - The updated comparative game object
   * @param gameId - The ID of the comparative game to update
   */
  updateComparativeGameState: async (game: CompareGame, gameId: string) => {
    return await supabase.from('compare_games').update(game).eq('id', gameId)
  },

  /**
   * Submits a comparative guess to the database
   * @param data - The comparative guess object to submit
   */
  submitComparativeGuess: async (data: Guess) => {
    return await supabase.from('compare_guesses').insert(data)
  },

  /**
   * Gets the top words scoreboard for a comparative game from the database
   * This uses a PostgreSQL stored procedure to get the top words for a given time period, sources, and reference date
   * @param timePeriod - The time period to get the scoreboard for
   * @param sources_group_a - The sources for group A
   * @param sources_group_b - The sources for group B
   * @param scoreboardSize - The size of the scoreboard
   * @param referenceDate - The reference date to get the scoreboard for
   * @returns The scoreboard
   */
  getComparativeScoreboard: async (
    timePeriod: TimePeriod,
    sources_group_a: NewsSource[],
    sources_group_b: NewsSource[],
    scoreboardSize: number,
    referenceDate: Date,
  ) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('get_comparative_words_scoreboard', {
        start_date,
        end_date,
        sources_group_a,
        sources_group_b,
        size: scoreboardSize,
      })
      .select('*')
  },

  /**
   * Gets the word count for a given time period, sources, and search term
   * This uses a PostgreSQL stored procedure to get the word count for a given time period, sources, and search term
   * @param timePeriod - The time period to get the word count for
   * @param sources - The sources to get the word count for
   * @param search_term - The search term to get the word count for
   * @param referenceDate - The reference date to get the word count for
   * @returns The word count
   */
  getWordCount: async (timePeriod: TimePeriod, sources: NewsSource[], search_term: string, referenceDate: Date) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('get_word_count', {
        start_date,
        end_date,
        sources,
        search_term,
      })
      .select('*')
  },

  /**
   * Creates a new associate game in the database
   * @param game - The associate game object to create
   * @returns The associate game ID
   */
  createAssociateGame: async (game: AssociateGame) => {
    return await supabase.from('associate_games').insert(game).select('id').single()
  },

  // TODO: validate user with game?
  /**
   * Gets the associate game state from the database
   * @param gameId - The ID of the associate game to get the state of
   * @returns The associate game state
   */
  getAssociateGameState: async (gameId: string) => {
    return await supabase
      .from('associate_games')
      .select(
        `
          *,
          associate_guesses(*)
        `,
      )
      .eq('id', gameId)
      .maybeSingle()
  },

  // TODO: validate user with game?
  /**
   * Updates the associate game state in the database
   * @param game - The updated associate game object
   * @param gameId - The ID of the associate game to update
   */
  updateAssociateGameState: async (game: AssociateGame, gameId: string) => {
    return await supabase.from('associate_games').update(game).eq('id', gameId)
  },

  /**
   * Submits an associate guess to the database
   * @param data - The associate guess object to submit
   */
  submitAssociateGuess: async (data: Guess) => {
    return await supabase.from('associate_guesses').insert(data)
  },

  /**
   * Gets the top words scoreboard for an associate game from the database
   * This uses a PostgreSQL stored procedure to get the top words for a given time period, sources, and reference date
   * @param timePeriod - The time period to get the scoreboard for
   * @param sources - The sources to get the scoreboard for
   * @param search_term - The search term to get the scoreboard for
   * @param scoreboardSize - The size of the scoreboard
   * @param referenceDate - The reference date to get the scoreboard for
   * @returns The scoreboard
   */
  getAssociatedScoreboard: async (
    timePeriod: TimePeriod,
    sources: NewsSource[],
    search_term: string,
    scoreboardSize: number,
    referenceDate: Date,
  ) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('get_associated_words_scoreboard', {
        start_date,
        end_date,
        sources,
        search_term,
        size: scoreboardSize,
      })
      .select('*')
  },

  /**
   * Creates a new comparative associated game in the database
   * @param game - The comparative associated game object to create
   * @returns The comparative associated game ID
   */
  createComparativeAssociatedGame: async (game: CompareAssociateGame) => {
    return await supabase.from('compare_associate_games').insert(game).select('id').single()
  },

  // TODO: validate user with game?
  /**
   * Gets the comparative associated game state from the database
   * @param gameId - The ID of the comparative associated game to get the state of
   * @returns The comparative associated game state
   */
  getComparativeAssociatedGameState: async (gameId: string) => {
    return await supabase
      .from('compare_associate_games')
      .select(
        `
          *,
          compare_associate_guesses(*)
        `,
      )
      .eq('id', gameId)
      .maybeSingle()
  },

  // TODO: validate user with game?
  /**
   * Updates the comparative associated game state in the database
   * @param game - The updated comparative associated game object
   * @param gameId - The ID of the comparative associated game to update
   */
  updateComparativeAssociatedGameState: async (game: CompareAssociateGame, gameId: string) => {
    return await supabase.from('compare_associate_games').update(game).eq('id', gameId)
  },

  /**
   * Submits a comparative associated guess to the database
   * @param data - The comparative associated guess object to submit
   */
  submitComparativeAssociatedGuess: async (data: Guess) => {
    return await supabase.from('compare_associate_guesses').insert(data)
  },

  /**
   * Gets the top words scoreboard for a comparative associated game from the database
   * This uses a PostgreSQL stored procedure to get the top words for a given time period, sources, and reference date
   * @param timePeriod - The time period to get the scoreboard for
   * @param sources_group_a - The sources for group A
   * @param sources_group_b - The sources for group B
   * @param search_term - The search term to get the scoreboard for
   * @param scoreboardSize - The size of the scoreboard
   * @param referenceDate - The reference date to get the scoreboard for
   * @returns The scoreboard
   */
  getComparativeAssociatedScoreboard: async (
    timePeriod: TimePeriod,
    sources_group_a: NewsSource[],
    sources_group_b: NewsSource[],
    search_term: string,
    scoreboardSize: number,
    referenceDate: Date,
  ) => {
    const { start_date, end_date } = defineTimePeriod(timePeriod, referenceDate)

    return await supabase
      .rpc('get_comparative_associated_words_scoreboard', {
        start_date,
        end_date,
        sources_group_a,
        sources_group_b,
        search_term,
        size: scoreboardSize,
      })
      .select('*')
  },
}

// User API
export const userAPI = {
  /**
   * Creates a new user in the database
   * @param user - The user object to create
   * @returns The user ID
   */
  createUser: async (user: User) => {
    return await supabase.from('users').insert(user)
  },

  /**
   * Gets a user from the database
   * @param userId - The ID of the user to get
   * @returns The user
   */
  getUser: async (userId: string) => {
    return await supabase.from('users').select('*').eq('id', userId).single()
  },

  /**
   * Updates a user in the database
   * @param user - The user object to update
   * @param userId - The ID of the user to update
   * @returns The updated user
   */
  updateUser: async (user: User, userId: string) => {
    return await supabase.from('users').update(user).eq('id', userId)
  },

  /**
   * Gets the classic games for a user from the database
   * @param userId - The ID of the user to get the games for
   * @returns The games
   */
  getUserGames: async (userId: string) => {
    return await supabase.from('games').select('*').eq('user_id', userId)
  },

  /**
   * Gets the comparative games for a user from the database
   * @param userId - The ID of the user to get the games for
   * @returns The games
   */
  getUserComparativeGames: async (userId: string) => {
    return await supabase.from('compare_games').select('*').eq('user_id', userId)
  },

  /**
   * Gets the associate games for a user from the database
   * @param userId - The ID of the user to get the games for
   * @returns The games
   */
  getUserAssociateGames: async (userId: string) => {
    return await supabase.from('associate_games').select('*').eq('user_id', userId)
  },

  /**
   * Gets the comparative associated games for a user from the database
   * @param userId - The ID of the user to get the games for
   * @returns The games
   */
  getUserComparativeAssociatedGames: async (userId: string) => {
    return await supabase.from('compare_associate_games').select('*').eq('user_id', userId)
  },
}

// Leaderboard API
export const leaderboardAPI = {
  getGlobalLeaderboard: async (
    limit = 50,
    offset = 0,
  ): Promise<
    ApiResponse<{
      leaderboard: LeaderboardEntry[]
      userRank: number | null
      total: number
    }>
  > => {
    const response = await api.get(`/leaderboard/global?limit=${limit}&offset=${offset}`)
    return response.data
  },

  getTimePeriodLeaderboard: async (
    timePeriod: string,
    limit = 50,
    offset = 0,
  ): Promise<
    ApiResponse<{
      timePeriod: string
      leaderboard: LeaderboardEntry[]
      userRank: number | null
      total: number
    }>
  > => {
    const response = await api.get(`/leaderboard/time-period/${timePeriod}?limit=${limit}&offset=${offset}`)
    return response.data
  },
}

export default api
