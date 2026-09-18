import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ProductRail from '@/components/shop/ProductRail';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getProductsByIds } from '@/api/products';
import { listOrders } from '@/api/orders';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { formatDate, formatPrice, initials } from '@/utils/format';

function Tile({ icon: Icon, label, value, to }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent
        component={to ? Link : 'div'}
        to={to}
        sx={{
          p: 2.5,
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <Icon sx={{ fontSize: 18 }} />
          <Typography variant="body2">{label}</Typography>
        </Box>
        <Typography variant="h4" component="p" sx={{ mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { user, saveProfile, signOut } = useAuth();
  const { items: bagItems } = useCart();
  const { ids: wishlistIds, clear: clearWishlist } = useWishlist();
  const toast = useToast();
  useDocumentTitle('Your account');

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderCount, setOrderCount] = useState(null);
  const [lifetimeSpend, setLifetimeSpend] = useState(0);
  const [recent, setRecent] = useState([]);
  const [resetOpen, setResetOpen] = useState(false);

  const address = storage.read(STORAGE_KEYS.addresses, null);

  useEffect(() => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    });
  }, [user]);

  useEffect(() => {
    let live = true;
    listOrders({ userId: user?.id }).then((orders) => {
      if (!live) return;
      setOrderCount(orders.length);
      setLifetimeSpend(
        orders
          .filter((order) => order.status !== 'cancelled')
          .reduce((sum, order) => sum + order.totals.total, 0),
      );
    });
    return () => {
      live = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const ids = storage.read(STORAGE_KEYS.recentlyViewed, []);
    if (!Array.isArray(ids) || ids.length === 0) return;
    let live = true;
    getProductsByIds(ids.slice(0, 12)).then((products) => {
      if (live) setRecent(products);
    });
    return () => {
      live = false;
    };
  }, []);

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'A name is needed on deliveries.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'That email does not look right.';
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      next.phone = 'Use a 10-digit mobile number.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await saveProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\s/g, ''),
      });
      toast.success('Your details are saved.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const wipe = () => {
    clearWishlist();
    storage.clearAll();
    setResetOpen(false);
    toast.info('Saved data cleared. Signing you out.');
    setTimeout(() => {
      signOut();
      window.location.assign('/');
    }, 600);
  };

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Your account"
        description="Details used on deliveries, plus everything this browser has remembered about your visit."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Account' }]}
        action={
          <Button
            variant="outlined"
            startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
            onClick={signOut}
            component={Link}
            to="/"
          >
            Sign out
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
          alignItems: 'start',
        }}
      >
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar src={user?.avatar} sx={{ width: 62, height: 62 }}>
                  {initials(user?.name ?? '')}
                </Avatar>
                <Box>
                  <Typography variant="h5" component="p">
                    {user?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.75 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      @{user?.username}
                    </Typography>
                    <Chip
                      label={user?.role === 'admin' ? 'Administrator' : 'Customer'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>

              <Box component="form" onSubmit={submit} noValidate sx={{ display: 'grid', gap: 2.5 }}>
                <TextField
                  label="Full name"
                  value={form.name}
                  onChange={setField('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  size="medium"
                  fullWidth
                />
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2.5,
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  }}
                >
                  <TextField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={setField('email')}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    size="medium"
                    fullWidth
                  />
                  <TextField
                    label="Mobile"
                    value={form.phone}
                    onChange={setField('phone')}
                    error={Boolean(errors.phone)}
                    helperText={errors.phone ?? 'Used for delivery updates only.'}
                    size="medium"
                    fullWidth
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? 'Saving' : 'Save changes'}
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() =>
                      setForm({
                        name: user?.name ?? '',
                        email: user?.email ?? '',
                        phone: user?.phone ?? '',
                      })
                    }
                  >
                    Reset
                  </Button>
                </Box>
              </Box>

              <Alert severity="info" variant="outlined" sx={{ mt: 3 }}>
                Edits are kept in this browser&rsquo;s session, not written back to users.json. Sign
                out and in again and the original details return.
              </Alert>
            </CardContent>
          </Card>

          {recent.length > 0 && (
            <Box>
              <Typography variant="h4" component="h2" sx={{ mb: 2.5 }}>
                Recently viewed
              </Typography>
              <ProductRail products={recent} />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'grid', gap: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: '1fr 1fr' }}>
            <Tile
              icon={ReceiptLongOutlinedIcon}
              label="Orders"
              value={orderCount ?? '—'}
              to="/orders"
            />
            <Tile
              icon={FavoriteBorderIcon}
              label="Wishlist"
              value={wishlistIds.length}
              to="/wishlist"
            />
            <Tile icon={LocalMallOutlinedIcon} label="In your bag" value={bagItems.length} to="/cart" />
            <Tile
              icon={ReceiptLongOutlinedIcon}
              label="Spent"
              value={formatPrice(lifetimeSpend)}
            />
          </Box>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                Saved delivery address
              </Typography>
              {address?.line1 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {address.fullName}
                  <br />
                  {address.line1}
                  {address.line2 ? (
                    <>
                      <br />
                      {address.line2}
                    </>
                  ) : null}
                  <br />
                  {address.city}, {address.state} {address.pincode}
                  <br />
                  {address.phone}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Nothing saved yet. The address you use at checkout is remembered here.
                </Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Member since {formatDate(user?.joinedAt ?? '2024-01-01')}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderColor: 'error.main' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Clear saved app data
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Wipes the bag, wishlist, orders, saved address and any admin catalogue edits from
                this browser, then signs you out. The shipped JSON files are untouched.
              </Typography>
              <Button color="error" variant="outlined" onClick={() => setResetOpen(true)}>
                Clear everything
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <ConfirmDialog
        open={resetOpen}
        title="Clear all saved data?"
        description="Orders, the bag, the wishlist and any catalogue edits stored in this browser will be removed. This cannot be undone."
        confirmLabel="Clear it"
        cancelLabel="Keep my data"
        destructive
        onConfirm={wipe}
        onClose={() => setResetOpen(false)}
      />
    </Container>
  );
}
