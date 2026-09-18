import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';
import Price from '@/components/common/Price';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import QuantityStepper from '@/components/shop/QuantityStepper';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/utils/format';
import { PROMO_CODES, SHIPPING } from '@/utils/constants';

/** Order summary block, shared in spirit with checkout. */
export function BagSummary({ totals, children }) {
  const rows = [
    ['Items', formatPrice(totals.listTotal)],
    ...(totals.catalogueSaving > 0
      ? [['Catalogue reductions', `− ${formatPrice(totals.catalogueSaving)}`]]
      : []),
    ...(totals.promoDiscount > 0
      ? [[`Code ${totals.promoCode}`, `− ${formatPrice(totals.promoDiscount)}`]]
      : []),
    ['Delivery', totals.shipping === 0 ? 'Complimentary' : formatPrice(totals.shipping)],
    ['GST (5%)', formatPrice(totals.tax)],
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2.5 }}>
          Summary
        </Typography>
        {rows.map(([label, value]) => (
          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
          </Box>
        ))}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="h4" component="p">
            {formatPrice(totals.total)}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export default function CartPage() {
  useDocumentTitle('Your bag');
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const {
    items,
    totals,
    promoCode,
    setQuantity,
    removeItem,
    clearCart,
    applyPromo,
    clearPromo,
    maxPerLine,
  } = useCart();

  const [code, setCode] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const onApply = () => {
    const trimmed = code.trim().toUpperCase();
    if (!PROMO_CODES[trimmed]) {
      toast.error('That code is not valid on this bag.');
      return;
    }
    const rule = PROMO_CODES[trimmed];
    if (rule.min && totals.subtotal < rule.min) {
      toast.warn(`${trimmed} applies to bags over ${formatPrice(rule.min)}.`);
      return;
    }
    applyPromo(trimmed);
    setCode('');
    toast.success(`${trimmed} applied — ${rule.label}.`);
  };

  if (items.length === 0) {
    return (
      <Container sx={{ py: { xs: 5, md: 8 } }}>
        <PageHeader title="Your bag" crumbs={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} />
        <EmptyState
          icon={ShoppingBagOutlinedIcon}
          title="Your bag is empty"
          description="Start with what has just arrived, or look through what has been reduced."
          actionLabel="Browse new arrivals"
          actionTo="/shop?new=1"
        />
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Your bag"
        description={`${totals.itemCount} ${totals.itemCount === 1 ? 'piece' : 'pieces'} across ${
          totals.lineCount
        } ${totals.lineCount === 1 ? 'line' : 'lines'}.`}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Bag' }]}
        action={
          <Button size="small" color="inherit" onClick={() => setConfirmClear(true)}>
            Empty the bag
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' },
          gap: { xs: 4, md: 5 },
          alignItems: 'start',
        }}
      >
        <Paper variant="outlined">
          {items.map((item, index) => (
            <Box key={item.key}>
              {index > 0 && <Divider />}
              <Box sx={{ display: 'flex', gap: 2.5, p: { xs: 2, sm: 2.5 } }}>
                <Box component={Link} to={`/product/${item.productId}`} sx={{ flexShrink: 0 }}>
                  <Box
                    component="img"
                    src={item.thumbnail}
                    alt={item.name}
                    loading="lazy"
                    sx={{
                      width: { xs: 88, sm: 108 },
                      height: { xs: 114, sm: 140 },
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.brand}
                      </Typography>
                      <Typography
                        component={Link}
                        to={`/product/${item.productId}`}
                        variant="subtitle2"
                        sx={{
                          display: 'block',
                          color: 'text.primary',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Size {item.size} · {item.color} · {item.category}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        removeItem(item.key);
                        toast.info('Removed from your bag.');
                      }}
                      aria-label={`Remove ${item.name}`}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(quantity) => setQuantity(item.key, quantity)}
                      max={Math.min(maxPerLine, item.stock || maxPerLine)}
                    />
                    <Price
                      price={item.price * item.quantity}
                      finalPrice={item.finalPrice * item.quantity}
                      discountPercent={item.discountPercent}
                      align="right"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Promotion code
              </Typography>
              {promoCode ? (
                <Alert
                  severity="success"
                  variant="outlined"
                  action={
                    <Button color="inherit" size="small" onClick={clearPromo}>
                      Remove
                    </Button>
                  }
                >
                  {promoCode} applied
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="LUXE10"
                    fullWidth
                  />
                  <Button variant="outlined" onClick={onApply} disabled={!code.trim()}>
                    Apply
                  </Button>
                </Box>
              )}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
                Try LUXE10, ATELIER500 or FREESHIP.
              </Typography>
            </CardContent>
          </Card>

          <BagSummary totals={totals}>
            {totals.shipping > 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
                Spend {formatPrice(SHIPPING.threshold - totals.subtotal)} more for complimentary
                delivery.
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
            >
              {isAuthenticated ? 'Continue to checkout' : 'Sign in to check out'}
            </Button>
            <Button fullWidth component={Link} to="/shop" sx={{ mt: 1 }}>
              Keep shopping
            </Button>
          </BagSummary>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmClear}
        title="Empty your bag?"
        description="Every line will be removed. Your wishlist is not affected."
        confirmLabel="Empty it"
        destructive
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
          toast.info('Your bag is empty.');
        }}
      />
    </Container>
  );
}
