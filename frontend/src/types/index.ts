// Frontend types for Newswordy

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
  totalGames: number
  totalScore: number
  averageScore: number
  bestScore: number
}

export interface Game {
  id: string
  userId: string
  timePeriod: string
  score: number
  maxGuesses: number
  scoreboardSize: number
  createdAt: string
  completedAt?: string
}

export interface Guess {
  id: string
  gameId: string
  userId: string
  word: string
  frequency: number
  score: number
  rank?: number
  createdAt: string
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
  isCompleted: boolean
  maxGuesses: number
  scoreboardSize: number
  user: {
    id: string
    username: string
  }
}

export interface CreateGameRequest {
  timePeriod: string
  maxGuesses?: number
  scoreboardSize?: number
}

export interface SubmitGuessRequest {
  word: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  rank: number
}

export interface UserStats {
  totalGames: number
  totalScore: number
  averageScore: number
  bestScore: number
  recentGames: Game[]
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

// Time period display names
export const TIME_PERIOD_NAMES: Record<TimePeriod, string> = {
  [TIME_PERIODS.PAST_DAY]: 'Past Day',
  [TIME_PERIODS.PAST_WEEK]: 'Past Week',
  [TIME_PERIODS.PAST_MONTH]: 'Past Month',
  [TIME_PERIODS.PAST_YEAR]: 'Past Year',
  [TIME_PERIODS.LAST_WEEK]: 'Last Week',
  [TIME_PERIODS.LAST_MONTH]: 'Last Month',
  [TIME_PERIODS.LAST_YEAR]: 'Last Year'
}
