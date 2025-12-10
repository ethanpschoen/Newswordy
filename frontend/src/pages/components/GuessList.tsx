import { Box, Card, CardContent, Chip, Paper, Stack, Typography } from '@mui/material'
import { Color, Guess } from '../../types'
import { getRankColor } from './Scoreboard'

interface Props {
  guesses: Guess[]
}

/**
 * Displays a list of all guesses made during the game.
 * Shows each guessed word with its rank and score, using color coding for rank positions.
 * Displays negative scores for incorrect guesses and positive scores for correct ones.
 * Used in Game pages.
 */
const GuessList = ({ guesses }: Props) => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '300px',
      }}
    >
      <CardContent sx={{ py: 2, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1.5, flexShrink: 0 }}>
          Your Guesses
        </Typography>
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {guesses.length > 0 ? (
            <Stack spacing={1}>
              {guesses.map(guess => (
                <Paper
                  key={guess.id}
                  elevation={1}
                  sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'semibold' }}>
                      {guess.word}
                    </Typography>
                    <Chip
                      label={guess.rank !== undefined && guess.rank !== null ? `#${guess.rank}` : `X`}
                      size="small"
                      sx={{ bgcolor: getRankColor(guess.rank || 0) }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'bold',
                      color: guess.rank !== undefined && guess.rank !== null ? Color.SCORE_HIGH : Color.ERROR,
                    }}
                  >
                    {guess.score < 0 ? `${guess.score}` : `+${guess.score}`}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>
              No guesses yet
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default GuessList
