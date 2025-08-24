import { Request, Response } from 'express'
import { prisma } from '../utils/database'
import { TIME_PERIODS, TimePeriod } from '../types'

export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    // Get users with highest best scores
    const leaderboard = await prisma.user.findMany({
      where: {
        best_score: {
          gt: 0
        }
      },
      select: {
        id: true,
        username: true,
        best_score: true,
        total_games: true,
        average_score: true
      },
      orderBy: [
        { best_score: 'desc' },
        { average_score: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Add ranks
    const leaderboardWithRanks = leaderboard.map((user, index) => ({
      ...user,
      rank: offset + index + 1
    }))

    // Get current user's rank if authenticated
    let userRank = null
    if (req.user) {
      const userWithRank = await prisma.user.findFirst({
        where: {
          best_score: {
            gt: 0
          }
        },
        select: {
          id: true,
          username: true,
          best_score: true,
          average_score: true
        },
        orderBy: [
          { best_score: 'desc' },
          { average_score: 'desc' }
        ]
      })

      if (userWithRank) {
        const rank = await prisma.user.count({
          where: {
            OR: [
              { best_score: { gt: userWithRank.best_score } },
              {
                AND: [
                  { best_score: userWithRank.best_score },
                  { average_score: { gt: userWithRank.average_score } }
                ]
              }
            ]
          }
        })
        userRank = rank + 1
      }
    }

    return res.json({
      success: true,
      data: {
        leaderboard: leaderboardWithRanks,
        userRank,
        total: await prisma.user.count({
          where: { best_score: { gt: 0 } }
        })
      }
    })
  } catch (error) {
    console.error('Get global leaderboard error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get global leaderboard'
    })
  }
}

export const getTimePeriodLeaderboard = async (req: Request, res: Response) => {
  try {
    const { timePeriod } = req.params
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    // Validate time period
    if (!Object.values(TIME_PERIODS).includes(timePeriod as TimePeriod)) {
      return res.status(400).json({
        success: false,
        error: `Invalid time period. Must be one of: ${Object.values(TIME_PERIODS).join(', ')}`
      })
    }

    // Get best scores for the specific time period
    const leaderboard = await prisma.game.groupBy({
      by: ['user_id'],
      where: {
        time_period: timePeriod,
        completed_at: {
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
    })

    // Get user details for each entry
    const leaderboardWithUsers = await Promise.all(
      leaderboard
        .filter(entry => entry.user_id !== null) // Filter out anonymous games
        .map(async (entry, index) => {
          const user = await prisma.user.findUnique({
            where: { id: entry.user_id! }, // Use non-null assertion since we filtered
            select: {
              id: true,
              username: true
            }
          })

          return {
            userId: entry.user_id!,
            username: user?.username || 'Unknown',
            score: entry._max.score || 0,
            rank: offset + index + 1
          }
        })
    )

    // Get current user's rank if authenticated
    let userRank = null
    if (req.user) {
      const userBestScore = await prisma.game.findFirst({
        where: {
          user_id: req.user.userId,
          time_period: timePeriod,
          completed_at: {
            not: null
          }
        },
        orderBy: { score: 'desc' },
        select: { score: true }
      })

      if (userBestScore) {
        const rank = await prisma.game.count({
          where: {
            time_period: timePeriod,
            completed_at: {
              not: null
            },
            score: {
              gt: userBestScore.score
            }
          }
        })
        userRank = rank + 1
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
            time_period: timePeriod,
            completed_at: {
              not: null
            }
          }
        })
      }
    })
  } catch (error) {
    console.error('Get time period leaderboard error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get time period leaderboard'
    })
  }
}
