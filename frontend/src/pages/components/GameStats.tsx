import { Card, CardContent, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Color } from '../../types'

interface Props {
  guessedWords: string[]
  score: number
  remainingGuesses: number
}

const GameStats = ({ guessedWords, score, remainingGuesses }: Props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  return (
    <Card sx={{ minHeight: isMobile ? 'auto' : '340px' }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
          Game Statistics
        </Typography>
        <Stack direction={isMobile ? 'row' : 'column'} spacing={isMobile ? 1 : 1.5} sx={isMobile ? { gap: 1 } : {}}>
          <Paper
            elevation={1}
            sx={{
              p: isMobile ? 1 : 1.5,
              textAlign: 'center',
              flex: isMobile ? 1 : 'none',
              background: `linear-gradient(135deg, ${Color.GRADIENT_BLUE_START} 0%, ${Color.GRADIENT_BLUE_END} 100%)`,
            }}
          >
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              component="div"
              sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}
            >
              {score}
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium' }}>
              Total Score
            </Typography>
          </Paper>
          <Paper
            elevation={1}
            sx={{
              p: isMobile ? 1 : 1.5,
              textAlign: 'center',
              flex: isMobile ? 1 : 'none',
              background: `linear-gradient(135deg, ${Color.GRADIENT_GREEN_START} 0%, ${Color.GRADIENT_GREEN_END} 100%)`,
            }}
          >
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              component="div"
              sx={{ fontWeight: 'bold', color: 'success.main', mb: 0.5 }}
            >
              {guessedWords.length}
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
              Word{guessedWords.length === 1 ? null : 's'} Found
            </Typography>
          </Paper>
          <Paper
            elevation={1}
            sx={{
              p: isMobile ? 1 : 1.5,
              textAlign: 'center',
              flex: isMobile ? 1 : 'none',
              background: `linear-gradient(135deg, ${Color.GRADIENT_PURPLE_START} 0%, ${Color.GRADIENT_PURPLE_END} 100%)`,
            }}
          >
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'secondary.main',
                mb: 0.5,
                fontSize: remainingGuesses === -1 ? '3rem' : undefined,
                lineHeight: remainingGuesses === -1 ? 0.7 : undefined,
              }}
            >
              {remainingGuesses === -1 ? '∞' : remainingGuesses}
            </Typography>
            <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 'medium' }}>
              {remainingGuesses === -1
                ? 'Unlimited Guesses'
                : `Wrong Guess${remainingGuesses === 1 ? '' : 'es'} Left`}
            </Typography>
          </Paper>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default GameStats
