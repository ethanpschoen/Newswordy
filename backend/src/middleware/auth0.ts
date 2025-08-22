import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

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
});

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  checkJwt(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    next();
  });
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  checkJwt(req, res, (err) => {
    if (err) {
      // Continue without authentication
      req.auth = undefined;
    }
    next();
  });
};
