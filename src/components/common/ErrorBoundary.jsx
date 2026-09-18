import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';

/** Last line of defence: a render error shows a way out instead of a blank page. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error', error, info);
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (!error) return children;

    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center', p: 4 }}>
        <Box sx={{ maxWidth: '52ch', textAlign: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ mb: 1.5 }}>
            This screen stopped short
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {error.message}. Reloading usually clears it. If it keeps happening, clear the saved
            app data from your profile page.
          </Typography>
          <Button variant="contained" onClick={() => window.location.assign('/')}>
            Back to the storefront
          </Button>
        </Box>
      </Box>
    );
  }
}
