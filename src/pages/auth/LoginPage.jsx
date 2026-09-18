import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { listUsers } from '@/api/auth';
import { FONT_DISPLAY } from '@/theme/tokens';

/**
 * Credentials are checked against public/data/users.json in the browser.
 * The demo chips below fill the form because the passwords are part of the
 * sample data — a real sign-in would never advertise them.
 */
export default function LoginPage() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { signIn, isAuthenticated, isAdmin, error, clearError, status } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [accounts, setAccounts] = useState([]);

  const from = location.state?.from?.pathname;

  useEffect(() => {
    listUsers()
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, []);

  const validation = useMemo(
    () => ({
      username: form.username.trim() ? null : 'Enter your username or email.',
      password: form.password ? null : 'Enter your password.',
    }),
    [form],
  );

  const isValid = !validation.username && !validation.password;

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : from ?? '/'} replace />;
  }

  const onChange = (field) => (event) => {
    clearError();
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setTouched({ username: true, password: true });
    if (!isValid) return;

    try {
      const session = await signIn(form);
      toast.success(`Welcome back, ${session.user.name.split(' ')[0]}.`);
      navigate(session.user.role === 'admin' ? '/admin' : from ?? '/', { replace: true });
    } catch {
      /* the error is surfaced from context */
    }
  };

  const fillFromAccount = (account) => {
    clearError();
    setForm({ username: account.username, password: `${account.username}123` });
  };

  const admins = accounts.filter((account) => account.role === 'admin');
  const customers = accounts.filter((account) => account.role === 'customer');

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
      }}
    >
      {/* Editorial panel — the shop's face while you stand at the door. */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          bgcolor: 'surface.inverse',
          color: 'surface.inverseText',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Logo to="/" size={26} color="inherit" />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '22ch' }}>
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(2.6rem, 4.6vw, 4.2rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
            }}
          >
            Thirty ateliers, one wardrobe.
          </Typography>
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.74, maxWidth: '38ch' }}>
            Sign in to keep your bag, your wishlist and your order history in one place.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, position: 'relative', zIndex: 1 }}>
          {[
            ['5,200', 'pieces in stock'],
            ['30', 'design labels'],
            ['8', 'categories'],
          ].map(([value, label]) => (
            <Box key={label}>
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: '1.8rem' }}>{value}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.68 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            right: -140,
            top: '18%',
            width: 460,
            height: 460,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'rgba(255,255,255,0.14)',
          }}
        />
      </Box>

      {/* Form panel */}
      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 3, sm: 6 } }}>
        <Box sx={{ width: '100%', maxWidth: 404 }}>
          <Box sx={{ display: { md: 'none' }, mb: 4 }}>
            <Logo to="/" />
          </Box>

          <Typography variant="h3" component="h1">
            Sign in
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.25, mb: 4 }}>
            Use the username and password from your account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} noValidate>
            <TextField
              label="Username or email"
              value={form.username}
              onChange={onChange('username')}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              error={Boolean(touched.username && validation.username)}
              helperText={touched.username ? validation.username : ' '}
              autoComplete="username"
              fullWidth
              size="medium"
              autoFocus
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={onChange('password')}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={Boolean(touched.password && validation.password)}
              helperText={touched.password ? validation.password : ' '}
              autoComplete="current-password"
              fullWidth
              size="medium"
              sx={{ mt: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={status === 'pending'}
              sx={{ mt: 2 }}
            >
              {status === 'pending' ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>

          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Demo accounts
            </Typography>
          </Divider>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'surface.tint' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Staff — full admin console
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {admins.map((account) => (
                <Chip
                  key={account.id}
                  label={`${account.username} / ${account.username}123`}
                  size="small"
                  onClick={() => fillFromAccount(account)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Customers — storefront only
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {customers.map((account) => (
                <Chip
                  key={account.id}
                  label={account.username}
                  size="small"
                  variant="outlined"
                  onClick={() => fillFromAccount(account)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
              Every password follows the pattern username + 123. Tap a chip to fill the form.
            </Typography>
          </Paper>

          <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
            Browsing without an account?{' '}
            <Box component={Link} to="/shop" sx={{ color: 'primary.main' }}>
              Keep shopping
            </Box>
            . You can sign in when you check out.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
