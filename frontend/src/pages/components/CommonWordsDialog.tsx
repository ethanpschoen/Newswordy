import React from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'

export type WordItem = {
  word: string
  frequency?: number
}

export type WordSection = {
  title: string
  words: WordItem[]
  emptyLabel?: string
  accentColor?: string
}

interface CommonWordsDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  sections: WordSection[]
  loading?: boolean
  error?: string | null
  onWordSelect?: (word: string, frequency?: number) => void
}

const CommonWordsDialog: React.FC<CommonWordsDialogProps> = ({
  open,
  onClose,
  title,
  description,
  sections,
  loading = false,
  error,
  onWordSelect,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 4 }}>
            <LinearProgress sx={{ width: '100%' }} />
            <Typography variant="body2" color="text.secondary">
              Fetching the most common words...
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                md: sections.length > 1 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
              },
            }}
          >
            {sections.map(section => (
              <Box key={section.title}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: section.accentColor || 'text.secondary', mb: 1 }}
                >
                  {section.title}
                </Typography>
                {section.words.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {section.emptyLabel || 'No data available for the current selection.'}
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {section.words.map((wordItem, index) => (
                      <Box
                        key={`${section.title}-${wordItem.word}-${index}`}
                        sx={{
                          border: '1px solid',
                          borderColor: 'grey.200',
                          borderRadius: 2,
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          cursor: onWordSelect ? 'pointer' : 'default',
                          transition: 'background-color 0.2s ease',
                          '&:hover': onWordSelect
                            ? {
                                backgroundColor: 'grey.50',
                              }
                            : undefined,
                        }}
                        onClick={() => onWordSelect?.(wordItem.word, wordItem.frequency)}
                      >
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {index + 1}. {wordItem.word.toUpperCase()}
                          </Typography>
                          {wordItem.frequency !== undefined && (
                            <Typography variant="caption" color="text.secondary">
                              {wordItem.frequency.toLocaleString()} mentions
                            </Typography>
                          )}
                        </Box>
                        {onWordSelect && (
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            Use word
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommonWordsDialog
