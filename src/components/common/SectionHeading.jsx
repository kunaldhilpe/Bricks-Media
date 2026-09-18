import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * Heading for a home-page rail: title, one line of context, optional link.
 * No eyebrow label — the title does that job.
 */
export default function SectionHeading({ title, description, actionLabel, actionTo, dense = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        justifyContent: 'space-between',
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        mb: dense ? 2 : 3.5,
      }}
    >
      <Box sx={{ maxWidth: '58ch' }}>
        <Typography variant={dense ? 'h4' : 'h3'} component="h2">
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actionLabel && actionTo && (
        <Button component={Link} to={actionTo} size="small" sx={{ flexShrink: 0 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
