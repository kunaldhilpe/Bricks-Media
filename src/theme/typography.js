import { FONT_BODY, FONT_DISPLAY } from './tokens';

/**
 * One Didone for display, one geometric sans for everything functional.
 * Headline sizes use clamp() so the masthead scales without breakpoint jumps.
 */
const typography = {
  fontFamily: FONT_BODY,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 400,
    fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
    lineHeight: 1.02,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 400,
    fontSize: 'clamp(2rem, 4.2vw, 3.25rem)',
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 400,
    fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
    lineHeight: 1.15,
    letterSpacing: '-0.015em',
  },
  h4: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 500,
    fontSize: '1.5rem',
    lineHeight: 1.22,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontFamily: FONT_BODY,
    fontWeight: 500,
    fontSize: '1.125rem',
    lineHeight: 1.35,
  },
  h6: {
    fontFamily: FONT_BODY,
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.4,
  },
  subtitle1: { fontWeight: 400, fontSize: '1.0625rem', lineHeight: 1.5 },
  subtitle2: { fontWeight: 500, fontSize: '0.9375rem', lineHeight: 1.5 },
  body1: { fontWeight: 400, fontSize: '0.9688rem', lineHeight: 1.62 },
  body2: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.6 },
  button: {
    fontWeight: 500,
    fontSize: '0.9375rem',
    letterSpacing: '0.01em',
    textTransform: 'none',
  },
  caption: { fontWeight: 400, fontSize: '0.8125rem', lineHeight: 1.5 },
  overline: {
    fontWeight: 500,
    fontSize: '0.75rem',
    letterSpacing: '0.04em',
    textTransform: 'none',
    lineHeight: 1.6,
  },
};

export default typography;
