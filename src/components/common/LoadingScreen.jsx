import { Box, CircularProgress, Typography } from '@mui/material';
import Logo from './Logo';

export default function LoadingScreen({ message = 'Opening the collection' }) {
  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Box>
        <Logo to="" size={30} />
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={22} thickness={4} color="primary" />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {message}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
