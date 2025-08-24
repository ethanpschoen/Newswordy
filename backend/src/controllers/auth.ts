import { Request, Response } from 'express'
import { prisma } from '../utils/database'

export const getProfile = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.sub // Auth0 user ID
    
    if (!auth0Id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { auth0_id: auth0Id }
    })

    if (!user) {
      // Create user from Auth0 data
      const auth0User = req.auth
      user = await prisma.user.create({
        data: {
          auth0_id: auth0Id,
          email: auth0User?.email || '',
          username: auth0User?.nickname || auth0User?.email?.split('@')[0] || ''
        }
      })
    }

    return res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    })
  }
}
