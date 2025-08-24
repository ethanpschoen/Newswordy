import { Request, Response } from 'express'
import { prisma } from '../utils/database'
import { CreateGameRequest, SubmitGuessRequest, DEFAULT_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE } from '../types'

export const createGame = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const { timePeriod, maxGuesses = DEFAULT_MAX_GUESSES, scoreboardSize = DEFAULT_SCOREBOARD_SIZE }: CreateGameRequest = req.body

    // Create new game
    const game = await prisma.game.create({
      data: {
        user_id: req.user.userId,
        time_period: timePeriod,
        max_guesses: maxGuesses,
        scoreboard_size: scoreboardSize
      }
    })

    return res.status(201).json({
      success: true,
      data: { game },
      message: 'Game created successfully'
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
        user: game.user
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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

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

    // Check if user owns the game
    if (game.user_id !== req.user.userId) {
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

    // Get word frequency from database
    const wordFrequency = await prisma.wordFrequency.findFirst({
      where: {
        word,
        timePeriod: game.timePeriod
      }
    })

    const frequency = wordFrequency?.frequency || 0

    // Calculate score based on frequency and rank
    const scoreboard = await prisma.wordFrequency.findMany({
      where: { timePeriod: game.timePeriod },
      orderBy: { frequency: 'desc' },
      take: game.scoreboardSize
    })

    const rank = scoreboard.findIndex(wf => wf.word === word) + 1
    const score = rank > 0 ? Math.max(1, game.scoreboardSize - rank + 1) * 10 : 0

    // Create guess
    const guess = await prisma.guess.create({
      data: {
        game_id: gameId,
        user_id: req.user.userId,
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

    // Get word frequencies for the time period
    const scoreboard = await prisma.wordFrequency.findMany({
      where: { timePeriod: game.timePeriod },
      orderBy: { frequency: 'desc' },
      take: game.scoreboardSize
    })

    const scoreboardData = scoreboard.map((wf, index) => ({
      word: wf.word,
      frequency: wf.frequency,
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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

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

    if (game.user_id !== req.user.userId) {
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

    // Update user stats
    await updateUserStats(req.user.userId, game.score)

    return res.json({
      success: true,
      data: { game: updatedGame },
      message: 'Game ended successfully'
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
