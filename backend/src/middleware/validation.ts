import { Request, Response, NextFunction } from 'express'
import { TIME_PERIODS, DEFAULT_MAX_GUESSES, DEFAULT_SCOREBOARD_SIZE, MAX_GUESSES, MAX_SCOREBOARD_SIZE } from '../types'

export const validateTimePeriod = (req: Request, res: Response, next: NextFunction) => {
  const { timePeriod } = req.body
  
  if (!timePeriod || !Object.values(TIME_PERIODS).includes(timePeriod)) {
    return res.status(400).json({
      success: false,
      error: `Invalid time period. Must be one of: ${Object.values(TIME_PERIODS).join(', ')}`
    })
  }
  
  return next()
}

export const validateGameSettings = (req: Request, res: Response, next: NextFunction) => {
  const { maxGuesses, scoreboardSize } = req.body
  
  if (maxGuesses !== undefined) {
    const guesses = parseInt(maxGuesses)
    if (isNaN(guesses) || guesses < 1 || guesses > MAX_GUESSES) {
      return res.status(400).json({
        success: false,
        error: `maxGuesses must be between 1 and ${MAX_GUESSES}`
      })
    }
  }
  
  if (scoreboardSize !== undefined) {
    const size = parseInt(scoreboardSize)
    if (isNaN(size) || size < 1 || size > MAX_SCOREBOARD_SIZE) {
      return res.status(400).json({
        success: false,
        error: `scoreboardSize must be between 1 and ${MAX_SCOREBOARD_SIZE}`
      })
    }
  }
  
  return next()
}

export const validateGuess = (req: Request, res: Response, next: NextFunction) => {
  const { word } = req.body
  
  if (!word || typeof word !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Word is required and must be a string'
    })
  }
  
  const cleanWord = word.trim().toLowerCase()
  if (cleanWord.length < 2 || cleanWord.length > 20) {
    return res.status(400).json({
      success: false,
      error: 'Word must be between 2 and 20 characters'
    })
  }
  
  // Only allow alphabetic characters
  if (!/^[a-z]+$/.test(cleanWord)) {
    return res.status(400).json({
      success: false,
      error: 'Word can only contain alphabetic characters'
    })
  }
  
  // Update the request body with the cleaned word
  req.body.word = cleanWord
  return next()
}

export const validateUserRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body
  
  if (!email || !username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email, username, and password are required'
    })
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    })
  }
  
  // Validate username
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      success: false,
      error: 'Username must be between 3 and 20 characters'
    })
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      success: false,
      error: 'Username can only contain letters, numbers, and underscores'
    })
  }
  
  // Validate password
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    })
  }
  
  return next()
}
