import { Router } from 'express'
import { 
  createGame, 
  getGameState, 
  submitGuess, 
  getScoreboard,
  endGame 
} from '../controllers/game'
import { 
  validateTimePeriod, 
  validateGameSettings, 
  validateGuess 
} from '../middleware/validation'
import { authenticateToken, optionalAuth } from '../middleware/auth0'

const router = Router()

// Game management
router.post('/create', authenticateToken, validateTimePeriod, validateGameSettings, createGame)
router.get('/:gameId', optionalAuth, getGameState)
router.post('/:gameId/guess', authenticateToken, validateGuess, submitGuess)
router.get('/:gameId/scoreboard', getScoreboard)
router.post('/:gameId/end', authenticateToken, endGame)

export default router
