import { Router } from 'express';
import { getProfile } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth0';

const router = Router();

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
