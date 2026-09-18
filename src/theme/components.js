import { alpha } from '@mui/material/styles';
import { FONT_DISPLAY } from './tokens';

/**
 * Component overrides. The house style is borders and flat fills rather than
 * drop shadows: a boutique looks like paper and card stock, not like a
 * dashboard. Radii stay small (2-4px) so the geometry reads as tailored.
 */
const components = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      '*, *::before, *::after': { boxSizing: 'border-box' },
      html: { WebkitFontSmoothing: 'antialiased', scrollBehavior: 'smooth' },
      body: {
        backgroundColor: theme.palette.background.default,
        overflowX: 'hidden',
      },
      '::selection': {
        background: alpha(theme.palette.primary.main, 0.2),
      },
      '*:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
      },
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.001ms !important',
          transitionDuration: '0.001ms !important',
          scrollBehavior: 'auto !important',
        },
      },
      '::-webkit-scrollbar': { width: 10, height: 10 },
      '::-webkit-scrollbar-track': { background: theme.palette.surface.sunken },
      '::-webkit-scrollbar-thumb': {
        background: alpha(theme.palette.text.secondary, 0.4),
        border: `2px solid ${theme.palette.surface.sunken}`,
        borderRadius: 8,
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: alpha(theme.palette.text.secondary, 0.65),
      },
      img: { maxWidth: '100%' },
    }),
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { borderRadius: 2, paddingInline: 20, minHeight: 42 },
      sizeSmall: { minHeight: 34, paddingInline: 14, fontSize: '0.875rem' },
      sizeLarge: { minHeight: 52, paddingInline: 32, fontSize: '1rem' },
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
        '&:hover': { borderColor: theme.palette.text.primary },
      }),
      containedPrimary: ({ theme }) => ({
        '&:hover': { backgroundColor: theme.palette.primary.dark },
      }),
      text: { paddingInline: 8 },
    },
  },
  MuiIconButton: {
    styleOverrides: { root: { borderRadius: 4 } },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { backgroundImage: 'none' },
      outlined: ({ theme }) => ({ borderColor: theme.palette.divider }),
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0, variant: 'outlined' },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 3,
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.background.paper,
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 2, fontWeight: 500 },
      sizeSmall: { height: 24, fontSize: '0.75rem' },
      outlined: ({ theme }) => ({ borderColor: theme.palette.divider }),
    },
  },
  MuiTextField: { defaultProps: { size: 'small' } },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 2,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.divider,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.text.secondary,
        },
      }),
    },
  },
  MuiSelect: { defaultProps: { size: 'small' } },
  MuiInputLabel: { styleOverrides: { root: { fontSize: '0.9375rem' } } },
  MuiTooltip: {
    defaultProps: { arrow: true },
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: theme.palette.surface.inverse,
        color: theme.palette.surface.inverseText,
        fontSize: '0.75rem',
        borderRadius: 2,
        paddingInline: 10,
      }),
      arrow: ({ theme }) => ({ color: theme.palette.surface.inverse }),
    },
  },
  MuiDialog: {
    styleOverrides: { paper: { borderRadius: 3 } },
  },
  MuiDialogTitle: {
    styleOverrides: { root: { fontFamily: FONT_DISPLAY, fontSize: '1.4rem' } },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({ borderColor: theme.palette.divider }),
      head: ({ theme }) => ({
        fontWeight: 500,
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.surface.tint,
        whiteSpace: 'nowrap',
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: ({ theme }) => ({ backgroundColor: theme.palette.text.primary }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }) => ({
        textTransform: 'none',
        fontWeight: 500,
        minHeight: 48,
        '&.Mui-selected': { color: theme.palette.text.primary },
      }),
    },
  },
  MuiLink: {
    defaultProps: { underline: 'hover' },
    styleOverrides: { root: { textDecorationThickness: '1px', textUnderlineOffset: 3 } },
  },
  MuiDivider: {
    styleOverrides: { root: ({ theme }) => ({ borderColor: theme.palette.divider }) },
  },
  MuiSkeleton: { defaultProps: { animation: 'wave' } },
  MuiAlert: { styleOverrides: { root: { borderRadius: 2 } } },
  MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 2 } } },
  MuiListItemButton: {
    styleOverrides: { root: { borderRadius: 2 } },
  },
  MuiBadge: {
    styleOverrides: { badge: { fontWeight: 500, fontSize: '0.6875rem' } },
  },
  MuiBreadcrumbs: {
    styleOverrides: { separator: { marginInline: 6 } },
  },
  MuiAccordion: {
    defaultProps: { disableGutters: true, elevation: 0 },
    styleOverrides: {
      root: { background: 'none', '&::before': { display: 'none' } },
    },
  },
};

export default components;
