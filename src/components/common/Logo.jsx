import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { FONT_DISPLAY } from '@/theme/tokens';

/** The wordmark. A hairline rule under the E stands in for a house monogram. */
export default function Logo({ to = '/', size = 26, showTagline = false, color }) {
  return (
    <Box
      component={to ? Link : 'div'}
      to={to || undefined}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: color ?? 'text.primary',
        lineHeight: 1,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: FONT_DISPLAY,
          fontSize: size,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textIndent: '0.14em',
        }}
      >
        BRICKS Media
      </Typography>
      <Box
        aria-hidden
        sx={{
          mt: 0.5,
          height: '1px',
          width: '100%',
          bgcolor: 'primary.main',
        }}
      />
      {showTagline && (
        <Typography
          component="span"
          variant="caption"
          sx={{ mt: 0.75, color: 'text.secondary', letterSpacing: '0.08em' }}
        >
          Premium clothing house
        </Typography>
      )}
    </Box>
  );
}
