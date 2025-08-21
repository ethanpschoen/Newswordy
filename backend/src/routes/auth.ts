import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth';
import { validateUserRegistration } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
