import { Request, Response } from 'express'
import { prisma } from '../utils/database'

// Extend Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string
        email?: string
        [key: string]: any
      }
    }
  }
}

export const getUserStats = async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      select: {
        total_games: true,
        total_score: true,
        average_score: true,
        best_score: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Get recent games
    const recentGames = await prisma.game.findMany({
      where: { user_id: req.auth.sub },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        time_period: true,
        score: true,
        created_at: true,
        completed_at: true
      }
    })

    return res.json({
      success: true,
      data: {
        stats: user,
        recentGames
      }
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get user stats'
    })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const { username } = req.body

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      })
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: req.auth.sub
        }
      }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username is already taken'
      })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.auth.sub },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
        created_at: true,
        total_games: true,
        total_score: true,
        average_score: true,
        best_score: true
      }
    })

    return res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    })
  }
}
