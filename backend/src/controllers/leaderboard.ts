import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { TIME_PERIODS } from '../types';

export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get users with highest best scores
    const leaderboard = await prisma.user.findMany({
      where: {
        bestScore: {
          gt: 0
        }
      },
      select: {
        id: true,
        username: true,
        bestScore: true,
        totalGames: true,
        averageScore: true
      },
      orderBy: [
        { bestScore: 'desc' },
        { averageScore: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    // Add ranks
    const leaderboardWithRanks = leaderboard.map((user, index) => ({
      ...user,
      rank: offset + index + 1
    }));

    // Get current user's rank if authenticated
    let userRank = null;
    if (req.user) {
      const userWithRank = await prisma.user.findFirst({
        where: {
          bestScore: {
            gt: 0
          }
        },
        select: {
          id: true,
          username: true,
          bestScore: true,
          averageScore: true
        },
        orderBy: [
          { bestScore: 'desc' },
          { averageScore: 'desc' }
        ]
      });

      if (userWithRank) {
        const rank = await prisma.user.count({
          where: {
            OR: [
              { bestScore: { gt: userWithRank.bestScore } },
              {
                AND: [
                  { bestScore: userWithRank.bestScore },
                  { averageScore: { gt: userWithRank.averageScore } }
                ]
              }
            ]
          }
        });
        userRank = rank + 1;
      }
    }

    return res.json({
      success: true,
      data: {
        leaderboard: leaderboardWithRanks,
        userRank,
        total: await prisma.user.count({
          where: { bestScore: { gt: 0 } }
        })
      }
    });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get global leaderboard'
    });
  }
};

export const getTimePeriodLeaderboard = async (req: Request, res: Response) => {
  try {
    const { timePeriod } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate time period
    if (!Object.values(TIME_PERIODS).includes(timePeriod as any)) {
      return res.status(400).json({
        success: false,
        error: `Invalid time period. Must be one of: ${Object.values(TIME_PERIODS).join(', ')}`
      });
    }

    // Get best scores for the specific time period
    const leaderboard = await prisma.game.groupBy({
      by: ['userId'],
      where: {
        timePeriod,
        completedAt: {
          not: null
        }
      },
      _max: {
        score: true
      },
      orderBy: {
        _max: {
          score: 'desc'
        }
      },
      take: limit,
      skip: offset
    });

    // Get user details for each entry
    const leaderboardWithUsers = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: {
            id: true,
            username: true
          }
        });

        return {
          userId: entry.userId,
          username: user?.username || 'Unknown',
          score: entry._max.score || 0,
          rank: offset + index + 1
        };
      })
    );

    // Get current user's rank if authenticated
    let userRank = null;
    if (req.user) {
      const userBestScore = await prisma.game.findFirst({
        where: {
          userId: req.user.userId,
          timePeriod,
          completedAt: {
            not: null
          }
        },
        orderBy: { score: 'desc' },
        select: { score: true }
      });

      if (userBestScore) {
        const rank = await prisma.game.count({
          where: {
            timePeriod,
            completedAt: {
              not: null
            },
            score: {
              gt: userBestScore.score
            }
          }
        });
        userRank = rank + 1;
      }
    }

    return res.json({
      success: true,
      data: {
        timePeriod,
        leaderboard: leaderboardWithUsers,
        userRank,
        total: await prisma.game.count({
          where: {
            timePeriod,
            completedAt: {
              not: null
            }
          }
        })
      }
    });
  } catch (error) {
    console.error('Get time period leaderboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get time period leaderboard'
    });
  }
};
