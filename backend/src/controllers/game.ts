import { Request, Response } from 'express'
import { prisma } from '../utils/database'
import { CreateGameRequest, SubmitGuessRequest, DEFAULT_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE, TIME_PERIODS, TimePeriodRange } from '../types'
import { v4 as uuidv4 } from 'uuid'

// Utility function to convert time period to date range
function getTimePeriodRange(timePeriod: string): TimePeriodRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (timePeriod) {
    case TIME_PERIODS.PAST_DAY:
      // Last calendar day (not including today)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        startDate: yesterday,
        endDate: new Date(today.getTime() - 1) // End of yesterday
      }
      
    case TIME_PERIODS.PAST_WEEK:
      // Last 7 calendar days (not including today)
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return {
        startDate: weekAgo,
        endDate: new Date(today.getTime() - 1) // End of yesterday
      }
      
    case TIME_PERIODS.PAST_MONTH:
      // Last 30 calendar days (not including today)
      const monthAgo = new Date(today)
      monthAgo.setDate(monthAgo.getDate() - 30)
      return {
        startDate: monthAgo,
        endDate: new Date(today.getTime() - 1) // End of yesterday
      }
      
    case TIME_PERIODS.PAST_YEAR:
      // Last 365 calendar days (not including today)
      const yearAgo = new Date(today)
      yearAgo.setDate(yearAgo.getDate() - 365)
      return {
        startDate: yearAgo,
        endDate: new Date(today.getTime() - 1) // End of yesterday
      }
      
    case TIME_PERIODS.LAST_WEEK:
      // Last full Monday-Sunday week
      const lastMonday = new Date(today)
      const dayOfWeek = lastMonday.getDay()
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      lastMonday.setDate(lastMonday.getDate() - daysToSubtract - 7)
      const lastSunday = new Date(lastMonday)
      lastSunday.setDate(lastSunday.getDate() + 6)
      return {
        startDate: lastMonday,
        endDate: new Date(lastSunday.getTime() + 24 * 60 * 60 * 1000 - 1) // End of Sunday
      }
      
    case TIME_PERIODS.LAST_MONTH:
      // Last full month
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        startDate: lastMonth,
        endDate: new Date(lastMonthEnd.getTime() + 24 * 60 * 60 * 1000 - 1) // End of last month
      }
      
    case TIME_PERIODS.LAST_YEAR:
      // Last full year (Jan 1 - Dec 31)
      const lastYear = new Date(today.getFullYear() - 1, 0, 1)
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)
      return {
        startDate: lastYear,
        endDate: new Date(lastYearEnd.getTime() + 24 * 60 * 60 * 1000 - 1) // End of Dec 31
      }
      
    default:
      // Default to past week if unknown time period
      const defaultWeekAgo = new Date(today)
      defaultWeekAgo.setDate(defaultWeekAgo.getDate() - 7)
      return {
        startDate: defaultWeekAgo,
        endDate: new Date(today.getTime() - 1)
      }
  }
}

// Function to get articles based on game sources and time period
async function getArticlesForGame(game: any) {
  const timeRange = getTimePeriodRange(game.time_period)
  
  // Build the where clause for articles
  const whereClause: any = {
    published_date: {
      gte: timeRange.startDate,
      lte: timeRange.endDate
    }
  }
  
  // Add source filter if game has sources specified
  if (game.sources && game.sources.length > 0) {
    whereClause.source = {
      in: game.sources
    }
  }
  
  // Get articles with their associated words
  const articles = await prisma.article.findMany({
    where: whereClause,
    include: {
      words: true
    },
    orderBy: {
      published_date: 'desc'
    }
  })
  
  return articles
}

// Function to calculate word frequencies from articles
function calculateWordFrequencies(articles: any[]): Map<string, number> {
  const wordFreqMap = new Map<string, number>()
  
  articles.forEach(article => {
    article.words.forEach((articleWord: any) => {
      const word = articleWord.word.toLowerCase()
      const currentFreq = wordFreqMap.get(word) || 0
      wordFreqMap.set(word, currentFreq + articleWord.frequency)
    })
  })
  
  return wordFreqMap
}

export const createGame = async (req: Request, res: Response) => {
  try {
    const { timePeriod, maxGuesses = DEFAULT_MAX_GUESSES, scoreboardSize = DEFAULT_SCOREBOARD_SIZE }: CreateGameRequest = req.body

    // Determine if this is an authenticated or anonymous game
    const isAuthenticated = !!req.user
    const userId = req.user?.userId
    const sessionId = isAuthenticated ? null : uuidv4()

    // Create new game
    const game = await prisma.game.create({
      data: {
        user_id: userId,
        session_id: sessionId,
        time_period: timePeriod,
        max_guesses: maxGuesses,
        scoreboard_size: scoreboardSize
      }
    })

    return res.status(201).json({
      success: true,
      data: { game },
      message: isAuthenticated ? 'Game created successfully' : 'Anonymous game created successfully'
    })
  } catch (error) {
    console.error('Create game error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create game'
    })
  }
}

export const getGameState = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        guesses: {
          orderBy: { created_at: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      })
    }

    // Check if user has access to this game
    const isAuthenticated = !!req.user
    const hasAccess = isAuthenticated 
      ? game.user_id === req.user?.userId 
      : game.session_id && req.headers['x-session-id'] === game.session_id

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this game'
      })
    }

    const remainingGuesses = game.max_guesses - game.guesses.length
    const isCompleted = game.completed_at !== null || remainingGuesses === 0

    return res.json({
      success: true,
      data: {
        gameId: game.id,
        timePeriod: game.time_period,
        score: game.score,
        guesses: game.guesses,
        remainingGuesses,
        isCompleted,
        maxGuesses: game.max_guesses,
        scoreboardSize: game.scoreboard_size,
        user: game.user,
        isAnonymous: !game.user_id
      }
    })
  } catch (error) {
    console.error('Get game state error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get game state'
    })
  }
}

export const submitGuess = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params
    const { word }: SubmitGuessRequest = req.body

    // Get game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        guesses: true
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      })
    }

    // Check if user has access to this game
    const isAuthenticated = !!req.user
    const hasAccess = isAuthenticated 
      ? game.user_id === req.user?.userId 
      : game.session_id && req.headers['x-session-id'] === game.session_id

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to play this game'
      })
    }

    // Check if game is completed
    if (game.completed_at) {
      return res.status(400).json({
        success: false,
        error: 'Game is already completed'
      })
    }

    // Check if user has remaining guesses
    if (game.guesses.length >= game.max_guesses) {
      return res.status(400).json({
        success: false,
        error: 'No more guesses allowed'
      })
    }

    // Check if word was already guessed
    const existingGuess = game.guesses.find(g => g.word === word)
    if (existingGuess) {
      return res.status(400).json({
        success: false,
        error: 'Word already guessed'
      })
    }

    // Get articles and calculate word frequencies
    const articles = await getArticlesForGame(game)
    const wordFreqMap = calculateWordFrequencies(articles)

    const frequency = wordFreqMap.get(word.toLowerCase()) || 0

    // Create scoreboard from word frequencies
    const scoreboardEntries = Array.from(wordFreqMap.entries())
      .map(([word, freq]) => ({ word, frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, game.scoreboard_size)

    const rank = scoreboardEntries.findIndex(entry => entry.word === word.toLowerCase()) + 1
    const score = rank > 0 ? Math.max(1, game.scoreboard_size - rank + 1) * 10 : 0

    // Create guess
    const guess = await prisma.guess.create({
      data: {
        game_id: gameId,
        user_id: game.user_id, // Will be null for anonymous games
        word,
        frequency,
        score,
        rank: rank > 0 ? rank : null
      }
    })

    // Update game score
    const newScore = game.score + score
    await prisma.game.update({
      where: { id: gameId },
      data: { score: newScore }
    })

    return res.json({
      success: true,
      data: {
        guess,
        newScore,
        remainingGuesses: game.max_guesses - game.guesses.length - 1
      },
      message: `Word "${word}" found with frequency ${frequency}`
    })
  } catch (error) {
    console.error('Submit guess error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to submit guess'
    })
  }
}

export const getScoreboard = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params

    const game = await prisma.game.findUnique({
      where: { id: gameId }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      })
    }

    // Get articles and calculate word frequencies for the time period
    const articles = await getArticlesForGame(game)
    const wordFreqMap = calculateWordFrequencies(articles)
    
    // Create scoreboard from word frequencies
    const scoreboardEntries = Array.from(wordFreqMap.entries())
      .map(([word, freq]) => ({ word, frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, game.scoreboard_size)

    const scoreboardData = scoreboardEntries.map((entry, index) => ({
      word: entry.word,
      frequency: entry.frequency,
      rank: index + 1
    }))

    return res.json({
      success: true,
      data: { scoreboard: scoreboardData }
    })
  } catch (error) {
    console.error('Get scoreboard error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get scoreboard'
    })
  }
}

export const endGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params

    const game = await prisma.game.findUnique({
      where: { id: gameId }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      })
    }

    // Check if user has access to this game
    const isAuthenticated = !!req.user
    const hasAccess = isAuthenticated 
      ? game.user_id === req.user?.userId 
      : game.session_id && req.headers['x-session-id'] === game.session_id

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to end this game'
      })
    }

    // Update game as completed
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: { completed_at: new Date() }
    })

    // Only update user stats if the game is authenticated
    if (game.user_id) {
      await updateUserStats(game.user_id, game.score)
    }

    return res.json({
      success: true,
      data: { game: updatedGame },
      message: game.user_id ? 'Game ended successfully' : 'Anonymous game ended successfully'
    })
  } catch (error) {
    console.error('End game error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to end game'
    })
  }
}

async function updateUserStats(userId: string, gameScore: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return

  const newTotalGames = user.total_games + 1
  const newTotalScore = user.total_score + gameScore
  const newAverageScore = newTotalScore / newTotalGames
  const newBestScore = Math.max(user.best_score, gameScore)

  await prisma.user.update({
    where: { id: userId },
    data: {
      total_games: newTotalGames,
      total_score: newTotalScore,
      average_score: newAverageScore,
      best_score: newBestScore
    }
  })
}
