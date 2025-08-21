import { Router } from 'express';
import { getGlobalLeaderboard, getTimePeriodLeaderboard } from '../controllers/leaderboard';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (optional auth for personalized data)
router.get('/global', optionalAuth, getGlobalLeaderboard);
router.get('/time-period/:timePeriod', optionalAuth, getTimePeriodLeaderboard);

export default router;
