import { useState } from 'react'
import { Box, Button, Card, CardContent, Stack, Typography, Paper, Avatar, useMediaQuery, Tooltip } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { ScoreboardEntry, Color, ComparativeScoreboardEntry, NewsSource } from '../../types'
import SourcesModal from './SourcesModal'
import { Article as ArticleIcon, Lightbulb as HintIcon } from '@mui/icons-material'

interface Props {
  scoreboard: ScoreboardEntry[] | ComparativeScoreboardEntry[]
  sources: NewsSource[]
  showScoreboard: boolean
  setShowScoreboard: (show: boolean) => void
  isCompleted: boolean
  guessedWords: string[]
  handleWordClick: (word: string) => void
  handleHintClick?: (word: string) => void
  groupLabel?: string
  groupAccentColor?: string
  hintedWords?: string[]
}

export const calculateScore = (index: number, totalLength: number): number => {
  return Math.round(1000 * (1 - index / totalLength))
}

export const getRankColor = (rank: number) => {
  if (rank === 1) return Color.RANK_FIRST_BG
  if (rank === 2) return Color.RANK_SECOND_BG
  if (rank === 3) return Color.RANK_THIRD_BG
  return Color.RANK_DEFAULT_BG
}

/**
 * Displays the ranked list of top words for the game.
 * Words are hidden until guessed or the game is completed, with support for hint indicators.
 * Clickable words show article information, and the component supports grouping for comparative modes.
 * Used in Game pages.
 */
const Scoreboard = ({
  scoreboard,
  sources,
  showScoreboard,
  setShowScoreboard,
  isCompleted,
  guessedWords,
  handleWordClick,
  handleHintClick,
  groupLabel,
  groupAccentColor,
  hintedWords = [],
}: Props) => {
  const [showSourcesModal, setShowSourcesModal] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const accentColor = groupAccentColor || theme.palette.primary.main
  const cardStyles = groupLabel
    ? {
        borderTop: `4px solid ${accentColor}`,
        backgroundColor: alpha(accentColor, 0.03),
      }
    : undefined
  const defaultItemsToShow = isMobile ? 5 : 10

  const handleViewSources = () => {
    setShowSourcesModal(true)
  }

  return (
    <>
      <Card sx={cardStyles}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ width: '100%' }}>
              {groupLabel && (
                <>
                  <Typography variant="overline" sx={{ fontWeight: 700, color: accentColor, letterSpacing: 1 }}>
                    {groupLabel}
                  </Typography>
                </>
              )}
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                Top Words
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
            >
              <Button
                onClick={handleViewSources}
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none', color: accentColor, borderColor: accentColor }}
              >
                View Sources
              </Button>
              {scoreboard.length > defaultItemsToShow && (
                <Button onClick={() => setShowScoreboard(!showScoreboard)} size="small" sx={{ textTransform: 'none' }}>
                  {showScoreboard ? 'Hide' : 'Show'} Full List
                </Button>
              )}
            </Stack>
          </Box>

          <Stack spacing={1}>
            {scoreboard.slice(0, showScoreboard ? scoreboard.length : defaultItemsToShow).map((entry, index) => {
              const gameCompleted = isCompleted
              const wordLower = entry.word.toLowerCase()
              const wordGuessed = guessedWords.includes(wordLower)
              const wordHinted = hintedWords.includes(wordLower)
              const showWord = wordGuessed || gameCompleted
              const showFirstLetter = wordHinted && !wordGuessed

              // Display text: full word if guessed/completed, first letter if hinted, ??? otherwise
              const displayText = showWord
                ? entry.word.toUpperCase()
                : showFirstLetter
                  ? entry.word.charAt(0).toUpperCase() + ' _'.repeat(entry.word.length - 1)
                  : '???'.repeat(entry.word.length)

              // Make clickable if guessed, completed, or hinted
              const isClickable = showWord || showFirstLetter
              const tooltipText = showWord
                ? 'Click to view articles containing this word'
                : showFirstLetter
                  ? 'Click to view hint again'
                  : ''

              const paperElement = (
                <Paper
                  elevation={isClickable ? 2 : 1}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isClickable ? 'pointer' : 'default',
                    minHeight: '48px',
                    backgroundColor: showWord && !wordGuessed ? '#fbe7e5' : null,
                    border: isClickable ? `1px solid ${alpha(accentColor, 0.2)}` : '1px solid transparent',
                    '&:hover': isClickable
                      ? {
                          backgroundColor: 'action.hover',
                          transform: 'translateY(-1px)',
                          transition: 'all 0.2s ease-in-out',
                          borderColor: accentColor,
                        }
                      : {},
                  }}
                  onClick={
                    showWord
                      ? () => handleWordClick(entry.word)
                      : showFirstLetter
                        ? () => handleHintClick?.(entry.word)
                        : undefined
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Avatar
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        bgcolor: getRankColor(index + 1),
                        color: 'black',
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'medium',
                        color: isClickable ? 'text.primary' : 'text.disabled',
                        minWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {displayText}
                    </Typography>
                    {isClickable && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: accentColor,
                          flexShrink: 0,
                          opacity: 0.7,
                          minWidth: '20px',
                        }}
                      >
                        {showFirstLetter ? (
                          <HintIcon fontSize="small" sx={{ mr: 1 }} />
                        ) : (
                          <ArticleIcon fontSize="small" sx={{ mr: 1 }} />
                        )}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: showWord ? 'text.primary' : 'text.disabled',
                        minWidth: '40px',
                        textAlign: 'right',
                      }}
                    >
                      {calculateScore(index, scoreboard.length)}
                    </Typography>
                    {(entry as ScoreboardEntry).frequency && (
                      <Typography
                        variant="caption"
                        color={showWord ? 'text.secondary' : 'text.disabled'}
                        sx={{ minWidth: '90px', textAlign: 'right' }}
                      >
                        {`${showWord ? (entry as ScoreboardEntry).frequency?.toLocaleString() : '???'} mentions`}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              )

              return (
                <Box key={entry.word}>
                  {isClickable ? (
                    <Tooltip title={tooltipText} arrow placement="top">
                      {paperElement}
                    </Tooltip>
                  ) : (
                    paperElement
                  )}
                </Box>
              )
            })}
          </Stack>

          {!showScoreboard && scoreboard.length > defaultItemsToShow && (
            <Button onClick={() => setShowScoreboard(true)} fullWidth sx={{ mt: 2, textTransform: 'none' }}>
              Show {scoreboard.length - defaultItemsToShow} more words...
            </Button>
          )}
        </CardContent>
      </Card>
      <SourcesModal open={showSourcesModal} onClose={() => setShowSourcesModal(false)} sources={sources} />
    </>
  )
}

export default Scoreboard
