import { Box } from '@mui/material';
import { layout } from '@/theme/tokens';

/** Page gutter used by every shop screen, so edges line up across routes. */
export default function Container({ children, width = layout.maxWidth, disableGutters, sx }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: width,
        mx: 'auto',
        px: disableGutters ? 0 : layout.gutter,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
