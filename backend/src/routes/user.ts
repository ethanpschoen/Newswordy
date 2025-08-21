import { Router } from 'express';
import { getUserStats, updateProfile } from '../controllers/user';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/stats', getUserStats);
router.put('/profile', updateProfile);

export default router;
