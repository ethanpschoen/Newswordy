import { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Paper,
  Stack,
  Typography,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { NewsSourceConfig, ScoreboardEntry } from '../../types'
import NewsSourceLogo from '../../components/NewsSourceLogo'

interface Props {
  selectedWordData: ScoreboardEntry | null
  currentPage: number
  setCurrentPage: (value: React.SetStateAction<number>) => void
  articlesPerPage: number
  closeArticlePanel: () => void
  scoreboardHeight?: number
  groupLabel?: string
  groupAccentColor?: string
}

/**
 * Displays article information for a selected word from the scoreboard.
 * Shows a paginated list of articles containing the word, with source logos and publication dates.
 * Renders as a card on desktop and a bottom drawer on mobile.
 * Used in Game pages to display articles for a selected word.
 */
const ArticleInfo = ({
  selectedWordData,
  currentPage,
  articlesPerPage,
  setCurrentPage,
  closeArticlePanel,
  scoreboardHeight,
  groupLabel,
  groupAccentColor,
}: Props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const accentColor = groupAccentColor || theme.palette.primary.main
  const cardStyles = {
    ...(scoreboardHeight && !isMobile ? { height: `${scoreboardHeight}px`, maxHeight: `${scoreboardHeight}px` } : {}),
    ...(groupLabel ? { borderTop: `4px solid ${accentColor}` } : {}),
  }

  // Sort articles by published date, most recent first
  const orderedArticles = useMemo(() => {
    if (!selectedWordData?.articles) {
      return []
    }

    const sorted = [...selectedWordData.articles].sort((a, b) => {
      const dateA = a.published_date ? new Date(a.published_date).getTime() : 0
      const dateB = b.published_date ? new Date(b.published_date).getTime() : 0
      if (dateA === dateB) {
        return a.headline.localeCompare(b.headline)
      }
      return dateB - dateA
    })

    return sorted
  }, [selectedWordData?.articles])

  const articleCount = orderedArticles.length

  const articleContent = (
    <>
      {selectedWordData ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
            <Box>
              {groupLabel && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="overline" sx={{ fontWeight: 700, color: accentColor }}>
                    {groupLabel}
                  </Typography>
                </Stack>
              )}
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                Articles for "{selectedWordData.word.toUpperCase()}"
              </Typography>
            </Box>
            <IconButton onClick={closeArticlePanel} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={1.5} sx={{ flex: 1 }}>
              {articleCount > 0 ? (
                <>
                  {orderedArticles
                    .slice(currentPage * articlesPerPage, (currentPage + 1) * articlesPerPage)
                    .map((article, index) => (
                      <Paper
                        key={currentPage * articlesPerPage + index}
                        elevation={1}
                        sx={{ p: 1.5, '&:hover': { elevation: 3 } }}
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
                              component="a"
                              href={`${article.url}?utm_source=newswordy`}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="body2"
                              sx={{
                                fontWeight: 'medium',
                                color: 'text.primary',
                                textDecoration: 'none',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontSize: '0.8rem',
                                lineHeight: 1.3,
                                '&:hover': {
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {article.headline}
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
                                hour: '2-digit',
                                minute: '2-digit',
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
                    ))}
                </>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No articles found for "{selectedWordData.word.toUpperCase()}"
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Pagination Controls */}
            {articleCount > articlesPerPage && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Showing {currentPage * articlesPerPage + 1}-
                  {Math.min((currentPage + 1) * articlesPerPage, articleCount)} of {articleCount}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    sx={{
                      width: 24,
                      height: 24,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={(currentPage + 1) * articlesPerPage >= articleCount}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    sx={{
                      width: 24,
                      height: 24,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Click on a guessed word to see related articles
          </Typography>
        </Box>
      )}
    </>
  )

  // On mobile, use a bottom drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={selectedWordData !== null}
        onClose={closeArticlePanel}
        PaperProps={{
          sx: {
            maxHeight: '80vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            ...(groupLabel ? { borderTop: `4px solid ${accentColor}` } : {}),
          },
        }}
      >
        <Box sx={{ p: 2, pb: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>{articleContent}</Box>
      </Drawer>
    )
  }

  // On desktop, use the card layout
  return (
    <Card sx={cardStyles}>
      <CardContent sx={{ py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {articleContent}
      </CardContent>
    </Card>
  )
}

export default ArticleInfo
