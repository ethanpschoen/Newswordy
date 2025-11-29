import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { ScoreboardEntry, NewsSourceConfig, HintType, HINT_TYPE_NAMES } from '../../types'
import NewsSourceLogo from '../../components/NewsSourceLogo'
import { useState, useEffect, useMemo } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  hintWord: ScoreboardEntry | null
  hintType: HintType
  onHintTypeChange?: (type: HintType) => void
}

const HintModal = ({ open, onClose, hintWord, hintType, onHintTypeChange }: Props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeTab, setActiveTab] = useState<HintType>(hintType)

  // Update active tab when hintType prop changes
  useEffect(() => {
    setActiveTab(hintType)
  }, [hintType])

  // Get 2-3 random articles for fill-in-the-blank
  // Memoize to prevent articles from changing on every render
  const randomArticles = useMemo(() => {
    if (!hintWord || hintWord.articles.length === 0) {
      return []
    }
    const shuffled = [...hintWord.articles].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(3, hintWord.articles.length))
  }, [hintWord])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: HintType) => {
    setActiveTab(newValue)
    if (onHintTypeChange) {
      onHintTypeChange(newValue)
    }
  }

  if (!hintWord) {
    return null
  }

  // Function to replace word with underscores in headline
  const replaceWordWithBlanks = (headline: string, word: string): string => {
    // Create regex to match the word (case-insensitive, whole word only)
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const wordLength = word.length
    // Use thin space (\u2009) between underscores for smaller spacing
    // Use non-breaking space (\u00A0) before/after to prevent HTML whitespace collapse
    const blank = '\u00A0' + '_' + '\u2009_'.repeat(wordLength - 1) + '\u00A0' // eslint-disable-line
    return headline.replace(regex, blank)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Hint
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label={HINT_TYPE_NAMES[HintType.FILL_BLANK]} value={HintType.FILL_BLANK} />
          <Tab label={HINT_TYPE_NAMES[HintType.FIRST_LETTER]} value={HintType.FIRST_LETTER} />
        </Tabs>
        {activeTab === HintType.FILL_BLANK ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
              Fill in the blank! The word appears in these headlines:
            </Typography>
            <Stack spacing={2}>
              {randomArticles.length > 0 ? (
                randomArticles.map((article, index) => (
                  <Paper key={`${article.url}-${index}`} elevation={1} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      {/* Source Icon */}
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.light',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <NewsSourceLogo source={article.source} />
                      </Box>

                      {/* Article Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 'medium',
                            color: 'text.primary',
                            fontSize: '0.9rem',
                            lineHeight: 1.4,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {replaceWordWithBlanks(article.headline, hintWord.word)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}
                        >
                          {new Date(article.published_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}
                        >
                          {NewsSourceConfig[article.source].name}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No articles available for this word.
                </Typography>
              )}
            </Stack>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" component="div" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              {hintWord.word.charAt(0).toUpperCase()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The word starts with the letter <strong>{hintWord.word.charAt(0).toUpperCase()}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default HintModal
