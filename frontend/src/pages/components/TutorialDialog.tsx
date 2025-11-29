import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {
  PlayArrow as PlayIcon,
  EmojiEvents as TrophyIcon,
  Lightbulb as HintIcon,
  Article as ArticleIcon,
  CompareArrows as CompareIcon,
  Search as SearchIcon,
  Compare as CompareAssociateIcon,
} from '@mui/icons-material'

interface TutorialDialogProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

const TutorialDialog = ({ open, onClose, onComplete }: TutorialDialogProps) => {
  const handleGotIt = () => {
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    onComplete()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleSkip} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 5 }}>
        Welcome to Newswordy!
        <IconButton
          aria-label="Close"
          onClick={handleSkip}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* What is the game */}
          <Box>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PlayIcon color="primary" />
              What is Newswordy?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ pl: 5 }}>
              Newswordy is a word guessing game based on real news headlines. Your goal is to guess the most common
              words that appear in recent news articles. The higher a word ranks on the scoreboard, the more points
              you'll earn for guessing it!
            </Typography>
          </Box>

          <Divider />

          {/* How to play */}
          <Box>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <TrophyIcon color="warning" />
              How to Play
            </Typography>
            <Box component="ul" sx={{ pl: 5, mb: 0, listStyleType: 'disc' }}>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                Enter words that you think appear frequently in news headlines
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                Correct guesses earn points based on the word's rank (higher rank = more points)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                You have a limited number of guesses (or unlimited mode if enabled)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                Click on words in the scoreboard to see example headlines containing that word
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                Use hints to get clues about unguessed words (hints reduce points by half)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 0 }}>
                The game ends when you run out of guesses or guess all words on the scoreboard
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Game features */}
          <Box>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <HintIcon color="info" />
              Game Features
            </Typography>
            <Box component="ul" sx={{ pl: 5, mb: 0, listStyleType: 'disc' }}>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                <strong>Hints:</strong> Get help with fill-in-the-blank or first-letter hints (reduces points by 50%).
                When a word is hinted, it shows the first letter on the scoreboard - click it to view the hint again!
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                <strong>Article View:</strong> Click any word to see real headlines that contain it
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                <strong>Customization:</strong> Adjust time period, news sources, max guesses, and scoreboard size
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 0 }}>
                <strong>Stats:</strong> Sign in to save your progress and compete on the leaderboard
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Game modes */}
          <Box>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Game Modes
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                >
                  <PlayIcon fontSize="small" color="primary" />
                  Classic Mode
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                  Guess the most common words from recent news headlines across all selected sources.
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                >
                  <CompareIcon fontSize="small" color="secondary" />
                  Source Comparison
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                  Compare word usage between two groups of sources. Find words that appear more in one group than the
                  other.
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                >
                  <SearchIcon fontSize="small" sx={{ color: '#099A39' }} />
                  Word Association
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                  Choose an anchor word and guess words that frequently appear together with it in headlines.
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                >
                  <CompareAssociateIcon fontSize="small" sx={{ color: '#B38205' }} />
                  Comparative Association
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                  Combine comparison and association: compare word usage between source groups, but only for headlines
                  containing your anchor word.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Tips */}
          <Box>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <ArticleIcon color="success" />
              Tips for Success
            </Typography>
            <Box component="ul" sx={{ pl: 5, mb: 0, listStyleType: 'disc' }}>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                Think about current events and trending topics
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                Common nouns, proper nouns, and important verbs are often high-ranking
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 1 }}>
                Stop words like "the", "and", "for" are automatically excluded
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ display: 'list-item', mb: 0 }}>
                Use the article view to get context and find related words
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleSkip} color="inherit" sx={{ textTransform: 'none' }}>
          Skip Tutorial
        </Button>
        <Button onClick={handleGotIt} variant="contained" sx={{ textTransform: 'none' }}>
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TutorialDialog
