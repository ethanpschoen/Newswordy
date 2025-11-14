import { useState } from "react"
import { Box, Button, Card, CardContent, Stack, Typography, Paper, Avatar } from "@mui/material"
import { ScoreboardEntry, Color, ComparativeScoreboardEntry, NewsSource } from "../../types"
import SourcesModal from "./SourcesModal"

interface Props {
  scoreboard: ScoreboardEntry[] | ComparativeScoreboardEntry[]
  sources: NewsSource[]
  showScoreboard: boolean
  setShowScoreboard: (show: boolean) => void
  isCompleted: boolean
  guessedWords: string[]
	handleWordClick: (word: string) => void
}

export const calculateScore = (index: number, totalLength: number): number => {
	return Math.round(1000 * (1 - (index / totalLength)))
}

export const getRankColor = (rank: number) => {
	if (rank === 1) return Color.RANK_FIRST_BG
	if (rank === 2) return Color.RANK_SECOND_BG
	if (rank === 3) return Color.RANK_THIRD_BG
	return Color.RANK_DEFAULT_BG
}

const Scoreboard = ({ scoreboard, sources, showScoreboard, setShowScoreboard, isCompleted, guessedWords, handleWordClick }: Props) => {
  const [showSourcesModal, setShowSourcesModal] = useState(false)
  
  const handleViewSources = () => {
    setShowSourcesModal(true)
  }

	return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Top Words
            </Typography>
            <Button
              onClick={handleViewSources}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              View Sources
            </Button>
            {scoreboard.length > 10 && (
              <Button
                onClick={() => setShowScoreboard(!showScoreboard)}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                {showScoreboard ? 'Hide' : 'Show'} Full List
              </Button>
            )}
          </Box>
          
          <Stack spacing={1}>
            {scoreboard.slice(0, showScoreboard ? scoreboard.length : 10).map((entry, index) => {
              const gameCompleted = isCompleted
              const wordGuessed = guessedWords.includes(entry.word.toLowerCase())
              const showWord = wordGuessed || gameCompleted
              return (
                <Paper
                  key={entry.word}
                  elevation={showWord ? 2 : 1}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: showWord ? 'pointer' : 'default',
                    minHeight: '48px',
                    backgroundColor: showWord && !wordGuessed ? '#fbe7e5' : null,
                    '&:hover': showWord ? {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out'
                    } : {}
                  }}
                  onClick={showWord ? () => handleWordClick(entry.word) : undefined}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        bgcolor: getRankColor(index + 1),
                        color: 'black'
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontWeight: 'medium',
                        color: showWord ? 'text.primary' : 'text.disabled',
                        minWidth: '120px'
                      }}
                    >
                      {showWord ? entry.word.toUpperCase() : '???'.repeat(entry.word.length)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: showWord ? 'text.primary' : 'text.disabled',
                        minWidth: '40px',
                        textAlign: 'right'
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
            })}
          </Stack>
          
          {!showScoreboard && scoreboard.length > 10 && (
            <Button
              onClick={() => setShowScoreboard(true)}
              fullWidth
              sx={{ mt: 2, textTransform: 'none' }}
            >
              Show {scoreboard.length - 10} more words...
            </Button>
          )}
        </CardContent>
      </Card>
      <SourcesModal open={showSourcesModal} onClose={() => setShowSourcesModal(false)} sources={sources} />
    </>
  )
}

export default Scoreboard