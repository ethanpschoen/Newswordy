import { Card, CardContent, Typography } from "@mui/material";

const AssociatingWordCard: React.FC<{ word: string }> = ({ word }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.18) 0%, rgba(118, 75, 162, 0.12) 100%)'
      }}
    >
      <CardContent sx={{ py: { xs: 2.5, md: 3 }, px: { xs: 2.5, md: 4 }, textAlign: 'center' }}>
        <Typography
          variant="subtitle2"
          sx={{
            display: 'block',
            mb: 1,
            color: 'text.secondary',
            letterSpacing: 1.5,
            textTransform: 'uppercase'
          }}
        >
          Associating Word
        </Typography>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontSize: { xs: '1.9rem', sm: '2.25rem' }
          }}
        >
          {word}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default AssociatingWordCard