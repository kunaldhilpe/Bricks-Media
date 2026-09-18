import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/** Role gate. A customer who lands on an admin URL is told why, not bounced silently. */
export default function RoleRoute({ allow = [], children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allow.includes(user.role)) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center', p: 4 }}>
        <Box sx={{ maxWidth: '48ch', textAlign: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ mb: 1.5 }}>
            This area is for staff
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            You are signed in as {user.name}, a customer account. The admin console needs a staff
            sign-in. Sign in as <strong>kunal / kunal123</strong> to see it.
          </Typography>
          <Button component={Link} to="/" variant="contained">
            Back to the storefront
          </Button>
        </Box>
      </Box>
    );
  }

  return children ?? <Outlet />;
}
