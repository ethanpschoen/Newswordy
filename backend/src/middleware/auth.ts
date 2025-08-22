import { Request, Response, NextFunction } from 'express'
import { expressjwt as auth } from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import { prisma } from '../utils/database'

const checkJwt = auth({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER_BASE_URL,
  algorithms: ['RS256']
})

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  checkJwt(req, res, async (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }
    
    // Get user from database based on Auth0 ID
    if (req.auth?.sub) {
      const user = await prisma.user.findUnique({
        where: { auth0Id: req.auth.sub },
        select: {
          id: true,
          email: true,
          username: true
        }
      })
      
      if (user) {
        (req as any).user = {
          userId: user.id,
          email: user.email,
          username: user.username
        }
      }
    }
    
    return next()
  })
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  checkJwt(req, res, async (err) => {
    if (err) {
      // Continue without authentication
      req.auth = undefined
    } else {
      // Get user from database based on Auth0 ID
      if (req.auth?.sub) {
        const user = await prisma.user.findUnique({
          where: { auth0Id: req.auth.sub },
          select: {
            id: true,
            email: true,
            username: true
          }
        })
        
        if (user) {
          (req as any).user = {
            userId: user.id,
            email: user.email,
            username: user.username
          }
        }
      }
    }
    return next()
  })
}
