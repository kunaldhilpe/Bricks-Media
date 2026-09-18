import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Price from '@/components/common/Price';
import EmptyState from '@/components/common/EmptyState';
import QuantityStepper from './QuantityStepper';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/format';
import { SHIPPING } from '@/utils/constants';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    totals,
    drawerOpen,
    closeDrawer,
    setQuantity,
    removeItem,
    maxPerLine,
  } = useCart();

  const toCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const shortfall = SHIPPING.threshold - totals.subtotal;

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 } } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h5">
            Your bag{totals.itemCount > 0 && ` · ${totals.itemCount}`}
          </Typography>
          <IconButton onClick={closeDrawer} aria-label="Close bag">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {items.length === 0 ? (
          <Box sx={{ p: 2.5 }}>
            <EmptyState
              dense
              icon={ShoppingBagOutlinedIcon}
              title="Your bag is empty"
              description="Pieces you add will wait here until you are ready."
              actionLabel="Browse the collection"
              actionTo="/shop"
              onAction={closeDrawer}
            />
          </Box>
        ) : (
          <>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2.5 }}>
              {shortfall > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    my: 2,
                    p: 1.25,
                    bgcolor: 'surface.tint',
                    color: 'text.secondary',
                  }}
                >
                  Add {formatPrice(shortfall)} more for complimentary delivery.
                </Typography>
              )}
              <Stack divider={<Divider />} sx={{ py: 1 }}>
                {items.map((item) => (
                  <Box key={item.key} sx={{ display: 'flex', gap: 2, py: 2 }}>
                    <Box
                      component={Link}
                      to={`/product/${item.productId}`}
                      onClick={closeDrawer}
                      sx={{ flexShrink: 0 }}
                    >
                      <Box
                        component="img"
                        src={item.thumbnail}
                        alt={item.name}
                        loading="lazy"
                        sx={{ width: 72, height: 94, objectFit: 'cover', display: 'block' }}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.brand}
                      </Typography>
                      <Typography
                        variant="body2"
                        component={Link}
                        to={`/product/${item.productId}`}
                        onClick={closeDrawer}
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
                        Size {item.size} · {item.color}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <QuantityStepper
                          value={item.quantity}
                          size="small"
                          max={Math.min(maxPerLine, item.stock || maxPerLine)}
                          onChange={(quantity) => setQuantity(item.key, quantity)}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeItem(item.key)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Price
                          price={item.price * item.quantity}
                          finalPrice={item.finalPrice * item.quantity}
                          discountPercent={item.discountPercent}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subtotal
                </Typography>
                <Typography variant="body2">{formatPrice(totals.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Delivery
                </Typography>
                <Typography variant="body2">
                  {totals.shipping === 0 ? 'Complimentary' : formatPrice(totals.shipping)}
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">Total</Typography>
                <Typography variant="subtitle1">{formatPrice(totals.total)}</Typography>
              </Box>
              <Button fullWidth variant="contained" size="large" onClick={toCheckout}>
                Checkout
              </Button>
              <Button
                fullWidth
                component={Link}
                to="/cart"
                onClick={closeDrawer}
                sx={{ mt: 1 }}
              >
                View the full bag
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
