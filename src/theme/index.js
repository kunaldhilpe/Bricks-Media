import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import components from './components';
import typography from './typography';
import { dark, light, layout } from './tokens';

export { layout };

/** Build the MUI theme for a colour mode. */
export function createAppTheme(mode = 'light') {
  const palette = mode === 'dark' ? dark : light;

  const theme = createTheme({
    palette,
    typography,
    shape: { borderRadius: 3 },
    spacing: 8,
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1240, xl: 1560 },
    },
    components,
    // Shadows are used sparingly; the boutique look is border-led.
    transitions: {
      duration: { shortest: 120, shorter: 160, short: 200, standard: 240 },
    },
  });

  return responsiveFontSizes(theme, { factor: 2.2 });
}

export default createAppTheme;
