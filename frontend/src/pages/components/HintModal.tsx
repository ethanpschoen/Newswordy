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
  Grid,
  Divider,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { ScoreboardEntry, NewsSourceConfig, HintType, HINT_TYPE_NAMES } from '../../types'
import NewsSourceLogo from '../../components/NewsSourceLogo'
import { useState, useMemo, useEffect } from 'react'
import { alpha } from '@mui/material/styles'

interface Props {
  open: boolean
  onClose: () => void
  hintWord: ScoreboardEntry | null
  // Optional props for comparative modes
  hintWordGroupB?: ScoreboardEntry | null
  groupALabel?: string
  groupBLabel?: string
  groupAAccentColor?: string
  groupBAccentColor?: string
}

const HintModal = ({
  open,
  onClose,
  hintWord,
  hintWordGroupB,
  groupALabel,
  groupBLabel,
  groupAAccentColor,
  groupBAccentColor,
}: Props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isComparativeMode = Boolean(hintWordGroupB && groupALabel && groupBLabel)
  const groupAColor = groupAAccentColor || theme.palette.primary.main
  const groupBColor = groupBAccentColor || theme.palette.secondary.main || theme.palette.info.main

  const [activeTab, setActiveTab] = useState<HintType>(HintType.FILL_BLANK)
  const [activeTabGroupB, setActiveTabGroupB] = useState<HintType>(HintType.FILL_BLANK)

  useEffect(() => {
    setActiveTab(HintType.FILL_BLANK)
    setActiveTabGroupB(HintType.FILL_BLANK)
  }, [hintWord, hintWordGroupB])

  // Get 2-3 random articles for fill-in-the-blank
  // Memoize to prevent articles from changing on every render
  const randomArticles = useMemo(() => {
    if (!hintWord || hintWord.articles.length === 0) {
      return []
    }
    const shuffled = [...hintWord.articles].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(3, hintWord.articles.length))
  }, [hintWord])

  const randomArticlesGroupB = useMemo(() => {
    if (!hintWordGroupB || hintWordGroupB.articles.length === 0) {
      return []
    }
    const shuffled = [...hintWordGroupB.articles].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(3, hintWordGroupB.articles.length))
  }, [hintWordGroupB])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: HintType) => {
    setActiveTab(newValue)
  }

  const handleTabChangeGroupB = (_event: React.SyntheticEvent, newValue: HintType) => {
    setActiveTabGroupB(newValue)
  }

  if (!hintWord && !hintWordGroupB) {
    return null
  }

  // Function to replace word with underscores in headline
  const replaceWordWithBlanks = (headline: string, word: string): string => {
    // Create regex to match the word (case-insensitive, whole word only)
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const wordLength = word.length
    // Use non-breaking space (\u00A0) between underscores to prevent line breaks
    // This ensures the entire blank stays together as one word
    const blank = '\u00A0' + '_' + '\u00A0_'.repeat(wordLength - 1) + '\u00A0' // eslint-disable-line
    return headline.replace(regex, blank)
  }

  // Render hint content for a single group
  const renderHintContent = (
    word: ScoreboardEntry | null,
    articles: typeof randomArticles,
    activeTabForGroup: HintType,
    accentColor?: string,
  ) => {
    if (!word) return null

    if (activeTabForGroup === HintType.FILL_BLANK) {
      return (
        <Box>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Fill in the blank! The word appears in these headlines:
          </Typography>
          <Stack spacing={2}>
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <Paper
                  key={`${article.url}-${index}`}
                  elevation={1}
                  sx={{
                    p: 2,
                    borderLeft: accentColor ? `3px solid ${accentColor}` : undefined,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {/* Source Icon */}
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: accentColor ? alpha(accentColor, 0.1) : 'primary.light',
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
                        {replaceWordWithBlanks(article.headline, word.word)}
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
                        color={accentColor || 'primary.main'}
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
      )
    } else {
      const firstLetter = word.word.charAt(0).toUpperCase()
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography
            variant="h4"
            component="div"
            sx={{ mb: 2, fontWeight: 'bold', color: accentColor || 'primary.main' }}
          >
            {firstLetter}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The word starts with the letter <strong>{firstLetter}</strong>
          </Typography>
        </Box>
      )
    }
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
        {isComparativeMode && hintWord && hintWordGroupB ? (
          <Box sx={{ position: 'relative' }}>
            <Grid container spacing={3}>
              {/* Group A Panel */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 'bold',
                      color: groupAColor,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {groupALabel}
                  </Typography>
                  <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                    <Tab label={HINT_TYPE_NAMES[HintType.FILL_BLANK]} value={HintType.FILL_BLANK} />
                    <Tab label={HINT_TYPE_NAMES[HintType.FIRST_LETTER]} value={HintType.FIRST_LETTER} />
                  </Tabs>
                  {renderHintContent(hintWord, randomArticles, activeTab, groupAColor)}
                </Box>
              </Grid>
              {/* Group B Panel */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 'bold',
                      color: groupBColor,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {groupBLabel}
                  </Typography>
                  <Tabs value={activeTabGroupB} onChange={handleTabChangeGroupB} sx={{ mb: 2 }}>
                    <Tab label={HINT_TYPE_NAMES[HintType.FILL_BLANK]} value={HintType.FILL_BLANK} />
                    <Tab label={HINT_TYPE_NAMES[HintType.FIRST_LETTER]} value={HintType.FIRST_LETTER} />
                  </Tabs>
                  {renderHintContent(hintWordGroupB, randomArticlesGroupB, activeTabGroupB, groupBColor)}
                </Box>
              </Grid>
            </Grid>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                transform: 'translateX(-50%)',
              }}
            />
          </Box>
        ) : (
          <>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label={HINT_TYPE_NAMES[HintType.FILL_BLANK]} value={HintType.FILL_BLANK} />
              <Tab label={HINT_TYPE_NAMES[HintType.FIRST_LETTER]} value={HintType.FIRST_LETTER} />
            </Tabs>
            {hintWord && renderHintContent(hintWord, randomArticles, activeTab)}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default HintModal
