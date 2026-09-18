import { Box, Tooltip } from '@mui/material';

/** Named catalogue colours mapped to swatches so filters read visually. */
export const COLOR_HEX = {
  Black: '#1A1714',
  Charcoal: '#3A3A3C',
  Navy: '#1F2A44',
  Teal: '#0F6E69',
  Emerald: '#0B6B45',
  Olive: '#5C6B3C',
  Wine: '#6A1B2A',
  Maroon: '#5C1A24',
  Rust: '#A4502A',
  Mustard: '#C99A2E',
  Gold: '#B79049',
  Silver: '#B9BDC1',
  Beige: '#D9C9B2',
  Ivory: '#F1E9DC',
  Blush: '#E3B7B3',
};

export default function ColorDot({ name, size = 18, selected = false, withTooltip = true }) {
  const dot = (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        bgcolor: COLOR_HEX[name] ?? '#9E9E9E',
        boxShadow: (theme) =>
          `inset 0 0 0 1px ${theme.palette.divider}${
            selected ? `, 0 0 0 2px ${theme.palette.background.paper}, 0 0 0 3px ${theme.palette.text.primary}` : ''
          }`,
      }}
    />
  );

  return withTooltip ? <Tooltip title={name}>{dot}</Tooltip> : dot;
}
