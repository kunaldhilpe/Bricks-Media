/**
 * Design tokens for LUXE.
 *
 * The palette is taken from the colourways the store actually sells: the
 * catalogue is full of Wine / Maroon and Emerald / Teal pieces, so oxblood and
 * deep emerald carry the brand instead of a generic retail blue. Light mode is
 * stark gallery white (the way fashion editorial is printed); dark mode is a
 * warm ink, never a blue-grey.
 */

export const FONT_DISPLAY = '"Bodoni Moda", "Didot", Georgia, serif';
export const FONT_BODY = '"Jost", "Helvetica Neue", Helvetica, Arial, sans-serif';

const shared = {
  oxblood: '#7C1F2E',
  oxbloodLight: '#A5404F',
  oxbloodDark: '#57121E',
  emerald: '#0E4B47',
  emeraldLight: '#2C6E68',
  rose: '#C75A6B',
  teal: '#4FA79B',
};

export const light = {
  mode: 'light',
  primary: {
    main: shared.oxblood,
    light: shared.oxbloodLight,
    dark: shared.oxbloodDark,
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: shared.emerald,
    light: shared.emeraldLight,
    dark: '#073330',
    contrastText: '#FFFFFF',
  },
  background: { default: '#FFFFFF', paper: '#FFFFFF' },
  text: { primary: '#1A1411', secondary: '#6E645C', disabled: '#A9A099' },
  divider: '#E4DED6',
  success: { main: '#1F6B4A' },
  warning: { main: '#9A6414' },
  error: { main: '#A32B27' },
  info: { main: shared.emerald },
  // Custom slots consumed through theme.palette.surface / theme.palette.brand
  surface: {
    tint: '#F4F1EC',
    sunken: '#EDE8E1',
    inverse: '#1A1411',
    inverseText: '#F6F2ED',
  },
  brand: {
    sale: shared.oxblood,
    fresh: shared.emerald,
    stock: '#1F6B4A',
    lowStock: '#9A6414',
  },
};

export const dark = {
  mode: 'dark',
  primary: {
    main: shared.rose,
    light: '#DE8592',
    dark: '#93384A',
    contrastText: '#1A0B0E',
  },
  secondary: {
    main: shared.teal,
    light: '#7BC4BA',
    dark: '#2A6F68',
    contrastText: '#0A1F1D',
  },
  background: { default: '#131110', paper: '#1B1817' },
  text: { primary: '#F1ECE6', secondary: '#A49C94', disabled: '#6E6660' },
  divider: '#332E2A',
  success: { main: '#5FB98C' },
  warning: { main: '#D6A250' },
  error: { main: '#E0736D' },
  info: { main: shared.teal },
  surface: {
    tint: '#1F1B1A',
    sunken: '#100E0D',
    inverse: '#F1ECE6',
    inverseText: '#1A1411',
  },
  brand: {
    sale: shared.rose,
    fresh: shared.teal,
    stock: '#5FB98C',
    lowStock: '#D6A250',
  },
};

/** Layout constants shared across shop and admin shells. */
export const layout = {
  maxWidth: 1400,
  navHeight: 68,
  navSubHeight: 46,
  adminDrawerWidth: 268,
  gutter: { xs: 2, sm: 3, md: 5 },
};
