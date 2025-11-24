import { Box, Card, CardContent, Dialog, DialogContent, DialogTitle, Grid, Typography } from '@mui/material'
import { NewsSource, NewsSourceConfig } from '../../types'
import NewsSourceLogo from '../../components/NewsSourceLogo'

interface Props {
  open: boolean
  onClose: () => void
  sources: NewsSource[]
}

const SourcesModal = ({ open, onClose, sources }: Props) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>News Sources</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {sources.map(source => (
            <Grid size={{ xs: 12 }} key={source}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <NewsSourceLogo source={source} />
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {NewsSourceConfig[source].name}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default SourcesModal
