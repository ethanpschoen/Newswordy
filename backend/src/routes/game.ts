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
  validateSources,
  validateGameSettings,
  validateGuess
} from '../middleware/validation'
import { authenticateToken, optionalAuth } from '../middleware/auth0'

const router = Router()

// Game management - authentication optional for creation and play
router.post('/create', optionalAuth, validateTimePeriod, validateSources, validateGameSettings, createGame)
router.get('/:gameId', optionalAuth, getGameState)
router.post('/:gameId/guess', optionalAuth, validateGuess, submitGuess)
router.get('/:gameId/scoreboard', getScoreboard)
router.post('/:gameId/end', optionalAuth, endGame)

export default router
