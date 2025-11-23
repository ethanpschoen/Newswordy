import { SetStateAction } from 'react'
import { Box, Drawer, Stack, Typography, IconButton, Paper } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { NewsSourceConfig, ScoreboardEntry } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  groupAData: ScoreboardEntry | null
  groupBData: ScoreboardEntry | null
  groupALabel: string
  groupBLabel: string
  groupAAccentColor: string
  groupBAccentColor: string
  currentPageGroupA: number
  currentPageGroupB: number
  setCurrentPageGroupA: (value: SetStateAction<number>) => void
  setCurrentPageGroupB: (value: SetStateAction<number>) => void
  articlesPerPage: number
}

const ComparativeArticleDrawer = ({
  open,
  onClose,
  groupAData,
  groupBData,
  groupALabel,
  groupBLabel,
  groupAAccentColor,
  groupBAccentColor,
  currentPageGroupA,
  currentPageGroupB,
  setCurrentPageGroupA,
  setCurrentPageGroupB,
  articlesPerPage,
}: Props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  if (!isMobile) return null
  if (!groupAData && !groupBData) return null

  const renderArticleSection = (
    wordData: ScoreboardEntry | null,
    label: string,
    accentColor: string,
    currentPage: number,
    setCurrentPage: (value: React.SetStateAction<number>) => void,
  ) => {
    if (!wordData) return null

    const totalArticles = wordData.articles.length
    const start = currentPage * articlesPerPage
    const end = Math.min(start + articlesPerPage, totalArticles)

    return (
      <Paper
        elevation={1}
        sx={{
          borderTop: `4px solid ${accentColor}`,
          backgroundColor: alpha(accentColor, 0.03),
          p: 2,
          borderRadius: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="overline" sx={{ fontWeight: 700, color: accentColor, letterSpacing: 1 }}>
                {label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Articles for "{wordData.word.toUpperCase()}"
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1.25}>
            {wordData.articles.slice(start, end).map((article, index) => (
              <Paper
                key={`${wordData.word}-${start + index}`}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: alpha(accentColor, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {NewsSourceConfig[article.source].logo}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      component="a"
                      href={`${article.url}?utm_source=newswordy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        textDecoration: 'none',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.headline}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {new Date(article.published_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                    <Typography variant="caption" color={accentColor} sx={{ fontWeight: 600 }}>
                      {NewsSourceConfig[article.source].name}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>

          {totalArticles > articlesPerPage && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Showing {start + 1}-{end} of {totalArticles}
              </Typography>
              <Box>
                <IconButton
                  size="small"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={end >= totalArticles}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>
    )
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '85vh',
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Articles
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Compare Source Groups
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Stack spacing={2.5}>
          {renderArticleSection(groupAData, groupALabel, groupAAccentColor, currentPageGroupA, setCurrentPageGroupA)}
          {renderArticleSection(groupBData, groupBLabel, groupBAccentColor, currentPageGroupB, setCurrentPageGroupB)}
        </Stack>
      </Box>
    </Drawer>
  )
}

export default ComparativeArticleDrawer
