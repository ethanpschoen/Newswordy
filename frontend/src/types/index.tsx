import { ReactComponent as ABCNewsLogo } from '../components/logos/abcnews.svg'
import { ReactComponent as AlJazeeraLogo } from '../components/logos/aljazeera.svg'
import { ReactComponent as AxiosLogo } from '../components/logos/axios.svg'
import { ReactComponent as BBCNewsLogo } from '../components/logos/bbcnews.svg'
import { ReactComponent as CBSNewsLogo } from '../components/logos/cbsnews.svg'
import { ReactComponent as FoxNewsLogo } from '../components/logos/foxnews.svg'
import { ReactComponent as LosAngelesTimesLogo } from '../components/logos/latimes.svg'
import { ReactComponent as NBCNewsLogo } from '../components/logos/nbcnews.svg'
import { ReactComponent as NewYorkPostLogo } from '../components/logos/nypost.svg'
import { ReactComponent as NYTimesLogo } from '../components/logos/newyorktimes.svg'
import { ReactComponent as NewsmaxLogo } from '../components/logos/newsmax.svg'
import { ReactComponent as NPRLogo } from '../components/logos/npr.svg'
import { ReactComponent as GuardianLogo } from '../components/logos/theguardian.svg'
import { ReactComponent as WashingtonPostLogo } from '../components/logos/thewashingtonpost.svg'
import { ReactComponent as WallStreetJournalLogo } from '../components/logos/wsj.svg'
import { ReactComponent as YahooNewsLogo } from '../components/logos/yahoonews.svg'

// Color enum with RGB values for consistent theming
export enum Color {
  // Primary colors
  PRIMARY = 'rgb(59, 130, 246)', // Blue-500
  PRIMARY_DARK = 'rgb(37, 99, 235)', // Blue-600
  PRIMARY_LIGHT = 'rgb(147, 197, 253)', // Blue-300

  // Secondary colors
  SECONDARY = 'rgb(107, 114, 128)', // Gray-500
  SECONDARY_DARK = 'rgb(75, 85, 99)', // Gray-600
  SECONDARY_LIGHT = 'rgb(156, 163, 175)', // Gray-400

  // Accent colors
  ACCENT = 'rgb(168, 85, 247)', // Purple-500
  ACCENT_DARK = 'rgb(147, 51, 234)', // Purple-600
  ACCENT_LIGHT = 'rgb(196, 181, 253)', // Purple-300

  // Success colors
  SUCCESS = 'rgb(34, 197, 94)', // Green-500
  SUCCESS_DARK = 'rgb(22, 163, 74)', // Green-600
  SUCCESS_LIGHT = 'rgb(134, 239, 172)', // Green-300

  // Warning colors
  WARNING = 'rgb(245, 158, 11)', // Amber-500
  WARNING_DARK = 'rgb(217, 119, 6)', // Amber-600
  WARNING_LIGHT = 'rgb(252, 211, 77)', // Amber-300

  // Error colors
  ERROR = 'rgb(239, 68, 68)', // Red-500
  ERROR_DARK = 'rgb(220, 38, 38)', // Red-600
  ERROR_LIGHT = 'rgb(252, 165, 165)', // Red-300

  // Info colors
  INFO = 'rgb(59, 130, 246)', // Blue-500
  INFO_DARK = 'rgb(37, 99, 235)', // Blue-600
  INFO_LIGHT = 'rgb(147, 197, 253)', // Blue-300

  // Neutral colors
  WHITE = 'rgb(255, 255, 255)',
  BLACK = 'rgb(0, 0, 0)',
  GRAY_50 = 'rgb(249, 250, 251)',
  GRAY_100 = 'rgb(243, 244, 246)',
  GRAY_200 = 'rgb(229, 231, 235)',
  GRAY_300 = 'rgb(209, 213, 219)',
  GRAY_400 = 'rgb(156, 163, 175)',
  GRAY_500 = 'rgb(107, 114, 128)',
  GRAY_600 = 'rgb(75, 85, 99)',
  GRAY_700 = 'rgb(55, 65, 81)',
  GRAY_800 = 'rgb(31, 41, 55)',
  GRAY_900 = 'rgb(17, 24, 39)',

  // Background colors
  BACKGROUND_PRIMARY = 'rgb(255, 255, 255)',
  BACKGROUND_SECONDARY = 'rgb(249, 250, 251)',
  BACKGROUND_TERTIARY = 'rgb(243, 244, 246)',
  BACKGROUND_DARK = 'rgb(17, 24, 39)',

  // Text colors
  TEXT_PRIMARY = 'rgb(17, 24, 39)',
  TEXT_SECONDARY = 'rgb(75, 85, 99)',
  TEXT_TERTIARY = 'rgb(107, 114, 128)',
  TEXT_INVERSE = 'rgb(255, 255, 255)',

  // Border colors
  BORDER_PRIMARY = 'rgb(229, 231, 235)',
  BORDER_SECONDARY = 'rgb(209, 213, 219)',
  BORDER_FOCUS = 'rgb(59, 130, 246)',

  // Game-specific colors
  GAME_CORRECT = 'rgb(34, 197, 94)',
  GAME_INCORRECT = 'rgb(239, 68, 68)',
  GAME_PARTIAL = 'rgb(245, 158, 11)',
  GAME_NEUTRAL = 'rgb(107, 114, 128)',

  // Score colors
  SCORE_HIGH = 'rgb(34, 197, 94)',
  SCORE_MEDIUM = 'rgb(59, 130, 246)',
  SCORE_LOW = 'rgb(245, 158, 11)',
  SCORE_DEFAULT = 'rgb(75, 85, 99)',

  // Rank colors
  RANK_FIRST_BG = 'rgb(254, 243, 199)',
  RANK_FIRST_TEXT = 'rgb(146, 64, 14)',
  RANK_FIRST_BORDER = 'rgb(253, 224, 71)',
  RANK_SECOND_BG = 'rgb(243, 244, 246)',
  RANK_SECOND_TEXT = 'rgb(31, 41, 55)',
  RANK_SECOND_BORDER = 'rgb(229, 231, 235)',
  RANK_THIRD_BG = 'rgb(255, 237, 213)',
  RANK_THIRD_TEXT = 'rgb(154, 52, 18)',
  RANK_THIRD_BORDER = 'rgb(251, 146, 60)',
  RANK_DEFAULT_BG = 'rgb(219, 234, 254)',
  RANK_DEFAULT_TEXT = 'rgb(30, 64, 175)',
  RANK_DEFAULT_BORDER = 'rgb(147, 197, 253)',

  // Trophy color
  TROPHY = 'rgb(245, 158, 11)',

  // Gradient colors
  GRADIENT_BLUE_START = 'rgb(227, 242, 253)',
  GRADIENT_BLUE_END = 'rgb(187, 222, 251)',
  GRADIENT_GREEN_START = 'rgb(232, 245, 232)',
  GRADIENT_GREEN_END = 'rgb(200, 230, 201)',
  GRADIENT_PURPLE_START = 'rgb(243, 229, 245)',
  GRADIENT_PURPLE_END = 'rgb(225, 190, 231)',
  GRADIENT_ORANGE_START = 'rgb(255, 243, 224)',
  GRADIENT_ORANGE_END = 'rgb(255, 204, 128)',
}

// Frontend types for Newswordy

export interface User {
  id: string
  email: string
  username: string
  created_at: string
  updated_at: string
  total_games: number
  total_score: number
  average_score: number
  best_score: number
}

export interface Game {
  id?: string
  time_period: TimePeriod
  sources?: NewsSource[]
  score: number
  guessed_words: string[]
  remaining_guesses: number
  is_completed: boolean
  max_guesses: number
  scoreboard_size: number
  user_id?: string
  completed_at?: string
  created_at?: string
}

export interface GameState {
  id: string
  time_period: TimePeriod
  sources: NewsSource[]
  score: number
  guesses: Guess[]
  guessed_words: string[]
  remaining_guesses: number
  is_completed: boolean
  max_guesses: number
  scoreboard_size: number
}

export interface Guess {
  id: string
  game_id: string
  user_id: string
  word: string
  frequency?: number
  score: number
  rank?: number
  created_at: string
}

export interface ScoreboardEntry {
  word: string
  frequency?: number
  rank: number
  articles: Article[]
}

export interface Article {
  url: string
  source: NewsSource
  headline: string
  published_date: string
}

export interface AssociateGame {
  id?: string
  time_period: TimePeriod
  sources?: NewsSource[]
  word: string
  score: number
  guessed_words: string[]
  remaining_guesses: number
  is_completed: boolean
  max_guesses: number
  scoreboard_size: number
  user_id?: string
  completed_at?: string
  created_at?: string
}

export interface AssociateGameState {
  id: string
  time_period: TimePeriod
  sources: NewsSource[]
  word: string
  score: number
  associate_guesses: Guess[]
  guessed_words: string[]
  remaining_guesses: number
  is_completed: boolean
  max_guesses: number
  scoreboard_size: number
}

export interface CompareGame {
  id?: string
  time_period: TimePeriod
  sources_group_a?: NewsSource[]
  sources_group_b?: NewsSource[]
  score: number
  guessed_words_group_a: string[]
  guessed_words_group_b: string[]
  remaining_guesses: number
  is_completed: boolean
  max_guesses: number
  scoreboard_size: number
  user_id?: string
  completed_at?: string
  created_at?: string
}

export interface CompareGameState {
  id: string
  time_period: TimePeriod
  sources_group_a: NewsSource[]
  sources_group_b: NewsSource[]
  score: number
  compare_guesses: Guess[]
  guessed_words_group_a: string[]
  guessed_words_group_b: string[]
  remaining_guesses: number
  is_completed: boolean
  max_guesses: number
  scoreboard_size: number
}

export interface CompareAssociateGame {
  id?: string
  time_period: TimePeriod
  sources_group_a?: NewsSource[]
  sources_group_b?: NewsSource[]
  word: string
  score: number
  guessed_words_group_a: string[]
  guessed_words_group_b: string[]
  remaining_guesses: number
  is_completed: boolean
  max_guesses: number
  scoreboard_size: number
  user_id?: string
  completed_at?: string
  created_at?: string
}

export interface CompareAssociateGameState {
  id: string
  time_period: TimePeriod
  sources_group_a: NewsSource[]
  sources_group_b: NewsSource[]
  word: string
  score: number
  compare_associate_guesses: Guess[]
  guessed_words_group_a: string[]
  guessed_words_group_b: string[]
  remaining_guesses: number
  is_completed: boolean
  max_guesses: number
  scoreboard_size: number
}

export interface ComparativeScoreboardEntry {
  group_name: ComparativeGroup
  word: string
  avg_rank_group_a: number
  avg_rank_group_b: number
  leaderboard_rank: number
  articles_group_a: Article[]
  articles_group_b: Article[]
}

export enum ComparativeGroup {
  GROUP_A = 'Group A',
  GROUP_B = 'Group B',
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  rank: number
}

// Time periods
export const TIME_PERIODS = {
  PAST_DAY: 'past_day',
  PAST_WEEK: 'past_week',
  PAST_MONTH: 'past_month',
  PAST_YEAR: 'past_year',
  LAST_WEEK: 'last_week',
  LAST_MONTH: 'last_month',
  LAST_YEAR: 'last_year',
} as const

export type TimePeriod = (typeof TIME_PERIODS)[keyof typeof TIME_PERIODS]

// News sources enum based on config.py
export enum NewsSource {
  ABC = 'abc',
  AL_JAZEERA = 'al_jazeera',
  AXIOS = 'axios',
  BBC = 'bbc',
  CBS = 'cbs',
  FOX_NEWS = 'fox_news',
  GUARDIAN = 'guardian',
  LOS_ANGELES_TIMES = 'los_angeles_times',
  NBC_NEWS = 'nbc_news',
  NEW_YORK_POST = 'new_york_post',
  NEWSMAX = 'newsmax',
  NPR = 'npr',
  NYT = 'nyt',
  WALL_STREET_JOURNAL = 'wall_street_journal',
  WASHINGTON_POST = 'washington_post',
  YAHOO = 'yahoo',
}

// Game settings
export const DEFAULT_MAX_GUESSES = 5
export const DEFAULT_SCOREBOARD_SIZE = 10
export const MAX_MAX_GUESSES = Infinity
export const MAX_SCOREBOARD_SIZE = 50

// Time period display names
export const TIME_PERIOD_NAMES: Record<TimePeriod, string> = {
  [TIME_PERIODS.PAST_DAY]: 'Past Day',
  [TIME_PERIODS.PAST_WEEK]: 'Past Week',
  [TIME_PERIODS.PAST_MONTH]: 'Past Month',
  [TIME_PERIODS.PAST_YEAR]: 'Past Year',
  [TIME_PERIODS.LAST_WEEK]: 'Last Week',
  [TIME_PERIODS.LAST_MONTH]: 'Last Month',
  [TIME_PERIODS.LAST_YEAR]: 'Last Year',
}

export const NewsSourceConfig: Record<NewsSource, { name: string; logo: React.ReactNode }> = {
  [NewsSource.ABC]: { name: 'ABC News', logo: <ABCNewsLogo /> },
  [NewsSource.AL_JAZEERA]: { name: 'Al Jazeera', logo: <AlJazeeraLogo /> },
  [NewsSource.AXIOS]: { name: 'Axios', logo: <AxiosLogo /> },
  [NewsSource.BBC]: { name: 'BBC News', logo: <BBCNewsLogo /> },
  [NewsSource.CBS]: { name: 'CBS News', logo: <CBSNewsLogo /> },
  [NewsSource.FOX_NEWS]: { name: 'Fox News', logo: <FoxNewsLogo /> },
  [NewsSource.GUARDIAN]: { name: 'The Guardian', logo: <GuardianLogo /> },
  [NewsSource.LOS_ANGELES_TIMES]: { name: 'Los Angeles Times', logo: <LosAngelesTimesLogo /> },
  [NewsSource.NEW_YORK_POST]: { name: 'New York Post', logo: <NewYorkPostLogo /> },
  [NewsSource.NBC_NEWS]: { name: 'NBC News', logo: <NBCNewsLogo /> },
  [NewsSource.NEWSMAX]: { name: 'Newsmax', logo: <NewsmaxLogo /> },
  [NewsSource.NPR]: { name: 'NPR', logo: <NPRLogo /> },
  [NewsSource.NYT]: { name: 'The New York Times', logo: <NYTimesLogo /> },
  [NewsSource.WALL_STREET_JOURNAL]: { name: 'The Wall Street Journal', logo: <WallStreetJournalLogo /> },
  [NewsSource.WASHINGTON_POST]: { name: 'The Washington Post', logo: <WashingtonPostLogo /> },
  [NewsSource.YAHOO]: { name: 'Yahoo News', logo: <YahooNewsLogo /> },
}

export enum GameMode {
  GAME = 'game',
  COMPARE = 'compare',
  ASSOCIATE = 'associate',
  COMPARE_ASSOCIATE = 'compare-associate',
}

export const GAME_MODE_NAMES: Record<GameMode, string> = {
  [GameMode.GAME]: 'Classic',
  [GameMode.COMPARE]: 'Comparative',
  [GameMode.ASSOCIATE]: 'Associative',
  [GameMode.COMPARE_ASSOCIATE]: 'Comparative Associative',
}

export enum HintType {
  FILL_BLANK = 'fill-blank',
  FIRST_LETTER = 'first-letter',
}

export const HINT_TYPE_NAMES: Record<HintType, string> = {
  [HintType.FILL_BLANK]: 'Fill in the Blank',
  [HintType.FIRST_LETTER]: 'First Letter',
}

export type ComparePreset = {
  id: string
  label: string
  description: string
  groupALabel: string
  groupBLabel: string
  groupASources: NewsSource[]
  groupBSources: NewsSource[]
}

export const COMPARE_PRESETS: ComparePreset[] = [
  {
    id: 'left-vs-right',
    label: 'Left vs Right Leaning',
    description: 'See how coverage from progressive versus conservative outlets differs.',
    groupALabel: 'Progressive / Left-Leaning',
    groupBLabel: 'Conservative / Right-Leaning',
    groupASources: [NewsSource.NYT, NewsSource.GUARDIAN, NewsSource.NPR, NewsSource.WASHINGTON_POST],
    groupBSources: [NewsSource.FOX_NEWS, NewsSource.WALL_STREET_JOURNAL, NewsSource.NEWSMAX, NewsSource.NEW_YORK_POST],
  },
  {
    id: 'us-vs-world',
    label: 'US vs World Focused',
    description: 'Compare coverage from domestic US outlets with international coverage.',
    groupALabel: 'US-Focused Outlets',
    groupBLabel: 'Global / International Outlets',
    groupASources: [
      NewsSource.ABC,
      NewsSource.CBS,
      NewsSource.NBC_NEWS,
      NewsSource.NPR,
      NewsSource.NYT,
      NewsSource.WASHINGTON_POST,
      NewsSource.LOS_ANGELES_TIMES,
    ],
    groupBSources: [NewsSource.BBC, NewsSource.GUARDIAN, NewsSource.AL_JAZEERA],
  },
  {
    id: 'opinion-vs-fact',
    label: 'Opinion vs Fact Reporting',
    description: 'Contrast coverage from analysis-heavy outlets with straight-reporting news desks.',
    groupALabel: 'Opinion / Analysis Heavy',
    groupBLabel: 'Straight Reporting',
    groupASources: [NewsSource.WALL_STREET_JOURNAL, NewsSource.GUARDIAN, NewsSource.FOX_NEWS],
    groupBSources: [NewsSource.ABC, NewsSource.CBS, NewsSource.NPR, NewsSource.BBC, NewsSource.AXIOS],
  },
]
