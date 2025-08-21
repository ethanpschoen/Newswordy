import { Response } from 'express';
import { prisma } from '../utils/database';
import { AuthenticatedRequest } from '../types';

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        totalGames: true,
        totalScore: true,
        averageScore: true,
        bestScore: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get recent games
    const recentGames = await prisma.game.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        timePeriod: true,
        score: true,
        createdAt: true,
        completedAt: true
      }
    });

    res.json({
      success: true,
      data: {
        stats: user,
        recentGames
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user stats'
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: req.user.userId
        }
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username is already taken'
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        totalGames: true,
        totalScore: true,
        averageScore: true,
        bestScore: true
      }
    });

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};
