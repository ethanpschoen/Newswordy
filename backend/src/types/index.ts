// Type definitions for the Newswordy backend

// Extend Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string
        email?: string
        [key: string]: any
      }
      user?: {
        userId: string
        email: string
        username: string
      }
    }
  }
}

// News sources enum based on config.py
export enum NewsSource {
  ABC = 'abc',
  AL_JAZEERA = 'al_jazeera',
  AXIOS = 'axios',
  BBC = 'bbc',
  CBS = 'cbs',
  CNN = 'cnn',
  FOX_NEWS = 'fox_news',
  GUARDIAN = 'guardian',
  LOS_ANGELES_TIMES = 'los_angeles_times',
  NBC_NEWS = 'nbc_news',
  NPR = 'npr',
  NYT = 'nyt',
  POLITICO = 'politico',
  WALL_STREET_JOURNAL = 'wall_street_journal',
  WASHINGTON_POST = 'washington_post',
  YAHOO = 'yahoo'
}

// Time period date range interface
export interface TimePeriodRange {
  startDate: Date
  endDate: Date
}

export interface User {
  id: string
  auth0Id?: string
  email: string
  username: string
  createdAt: Date
  updatedAt: Date
  totalGames: number
  totalScore: number
  averageScore: number
  bestScore: number
}

export interface Game {
  id: string
  userId: string
  timePeriod: string
  sources: NewsSource[]
  score: number
  maxGuesses: number
  scoreboardSize: number
  createdAt: Date
  completedAt?: Date
}

export interface CreateGameRequest {
  timePeriod: string
  maxGuesses?: number
  scoreboardSize?: number
}

export interface Guess {
  id: string
  gameId: string
  userId: string
  word: string
  frequency: number
  score: number
  rank?: number
  createdAt: Date
}

export interface SubmitGuessRequest {
  word: string
}

export interface WordFrequency {
  id: string
  word: string
  frequency: number
  timePeriod: string
  startDate: Date
  endDate: Date
  createdAt: Date
}

export interface ScoreboardEntry {
  word: string
  frequency: number
  rank: number
}

export interface GameState {
  gameId: string
  timePeriod: string
  score: number
  guesses: Guess[]
  remainingGuesses: number
  scoreboard: ScoreboardEntry[]
}

export interface UserStats {
  totalGames: number
  totalScore: number
  averageScore: number
  bestScore: number
  recentGames: Game[]
}

export interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  rank: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Time periods
export const TIME_PERIODS = {
  PAST_DAY: 'past_day',
  PAST_WEEK: 'past_week',
  PAST_MONTH: 'past_month',
  PAST_YEAR: 'past_year',
  LAST_WEEK: 'last_week',
  LAST_MONTH: 'last_month',
  LAST_YEAR: 'last_year'
} as const

export type TimePeriod = typeof TIME_PERIODS[keyof typeof TIME_PERIODS]

// Game settings
export const DEFAULT_MAX_GUESSES = 3
export const DEFAULT_SCOREBOARD_SIZE = 10
export const MAX_GUESSES = 10
export const MAX_SCOREBOARD_SIZE = 50
