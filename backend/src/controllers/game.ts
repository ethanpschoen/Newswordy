import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthenticatedRequest, CreateGameRequest, SubmitGuessRequest, DEFAULT_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE } from '../types';

export const createGame = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { timePeriod, maxGuesses = DEFAULT_MAX_GUESSES, scoreboardSize = DEFAULT_SCOREBOARD_SIZE }: CreateGameRequest = req.body;

    // Create new game
    const game = await prisma.game.create({
      data: {
        userId: req.user.userId,
        timePeriod,
        maxGuesses,
        scoreboardSize
      }
    });

    res.status(201).json({
      success: true,
      data: { game },
      message: 'Game created successfully'
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create game'
    });
  }
};

export const getGameState = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        guesses: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    const remainingGuesses = game.maxGuesses - game.guesses.length;
    const isCompleted = game.completedAt !== null || remainingGuesses === 0;

    res.json({
      success: true,
      data: {
        gameId: game.id,
        timePeriod: game.timePeriod,
        score: game.score,
        guesses: game.guesses,
        remainingGuesses,
        isCompleted,
        maxGuesses: game.maxGuesses,
        scoreboardSize: game.scoreboardSize,
        user: game.user
      }
    });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state'
    });
  }
};

export const submitGuess = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { gameId } = req.params;
    const { word }: SubmitGuessRequest = req.body;

    // Get game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        guesses: true
      }
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    // Check if user owns the game
    if (game.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to play this game'
      });
    }

    // Check if game is completed
    if (game.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Game is already completed'
      });
    }

    // Check if user has remaining guesses
    if (game.guesses.length >= game.maxGuesses) {
      return res.status(400).json({
        success: false,
        error: 'No more guesses allowed'
      });
    }

    // Check if word was already guessed
    const existingGuess = game.guesses.find(g => g.word === word);
    if (existingGuess) {
      return res.status(400).json({
        success: false,
        error: 'Word already guessed'
      });
    }

    // Get word frequency from database
    const wordFrequency = await prisma.wordFrequency.findFirst({
      where: {
        word,
        timePeriod: game.timePeriod
      }
    });

    const frequency = wordFrequency?.frequency || 0;

    // Calculate score based on frequency and rank
    const scoreboard = await prisma.wordFrequency.findMany({
      where: { timePeriod: game.timePeriod },
      orderBy: { frequency: 'desc' },
      take: game.scoreboardSize
    });

    const rank = scoreboard.findIndex(wf => wf.word === word) + 1;
    const score = rank > 0 ? Math.max(1, game.scoreboardSize - rank + 1) * 10 : 0;

    // Create guess
    const guess = await prisma.guess.create({
      data: {
        gameId,
        userId: req.user.userId,
        word,
        frequency,
        score,
        rank: rank > 0 ? rank : null
      }
    });

    // Update game score
    const newScore = game.score + score;
    await prisma.game.update({
      where: { id: gameId },
      data: { score: newScore }
    });

    res.json({
      success: true,
      data: {
        guess,
        newScore,
        remainingGuesses: game.maxGuesses - game.guesses.length - 1
      },
      message: `Word "${word}" found with frequency ${frequency}`
    });
  } catch (error) {
    console.error('Submit guess error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit guess'
    });
  }
};

export const getScoreboard = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    // Get word frequencies for the time period
    const scoreboard = await prisma.wordFrequency.findMany({
      where: { timePeriod: game.timePeriod },
      orderBy: { frequency: 'desc' },
      take: game.scoreboardSize
    });

    const scoreboardData = scoreboard.map((wf, index) => ({
      word: wf.word,
      frequency: wf.frequency,
      rank: index + 1
    }));

    res.json({
      success: true,
      data: { scoreboard: scoreboardData }
    });
  } catch (error) {
    console.error('Get scoreboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scoreboard'
    });
  }
};

export const endGame = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { gameId } = req.params;

    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    if (game.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to end this game'
      });
    }

    // Update game as completed
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: { completedAt: new Date() }
    });

    // Update user stats
    await updateUserStats(req.user.userId, game.score);

    res.json({
      success: true,
      data: { game: updatedGame },
      message: 'Game ended successfully'
    });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end game'
    });
  }
};

async function updateUserStats(userId: string, gameScore: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return;

  const newTotalGames = user.totalGames + 1;
  const newTotalScore = user.totalScore + gameScore;
  const newAverageScore = newTotalScore / newTotalGames;
  const newBestScore = Math.max(user.bestScore, gameScore);

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalGames: newTotalGames,
      totalScore: newTotalScore,
      averageScore: newAverageScore,
      bestScore: newBestScore
    }
  });
}
