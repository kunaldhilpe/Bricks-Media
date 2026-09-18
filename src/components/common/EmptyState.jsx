import { Box, Button, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

/** An empty screen is an invitation to act, so it always carries one. */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  secondaryLabel,
  onSecondary,
  dense = false,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 3,
        py: dense ? 4 : 7,
        textAlign: 'center',
        borderStyle: 'dashed',
        bgcolor: 'transparent',
      }}
    >
      {Icon && (
        <Box sx={{ color: 'text.disabled', mb: 1.5 }}>
          <Icon sx={{ fontSize: dense ? 32 : 44 }} />
        </Box>
      )}
      <Typography variant="h5" component="p" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', maxWidth: '46ch', mx: 'auto' }}
        >
          {description}
        </Typography>
      )}
      <Box sx={{ mt: 3, display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
        {actionLabel && (actionTo || onAction) && (
          <Button
            variant="contained"
            component={actionTo ? Link : 'button'}
            to={actionTo}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && onSecondary && (
          <Button variant="outlined" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
}
