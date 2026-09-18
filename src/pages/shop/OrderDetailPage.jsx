import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorState from '@/components/common/ErrorState';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { cancelOrder, getOrder } from '@/api/orders';
import { useToast } from '@/context/ToastContext';
import { formatDate, formatDateTime, formatPrice } from '@/utils/format';
import { ORDER_FLOW, ORDER_STATUS } from '@/utils/constants';

export default function OrderDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  useDocumentTitle(`Order ${id}`);

  const { data: order, loading, error, reload } = useAsync(() => getOrder(id), [id]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingScreen message="Fetching your order" />;
  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <ErrorState error={error} onRetry={reload} />
        <Button component={Link} to="/orders" sx={{ mt: 3 }}>
          All your orders
        </Button>
      </Container>
    );
  }

  const cancelled = order.status === 'cancelled';
  const activeStep = cancelled ? -1 : ORDER_STATUS[order.status]?.step ?? 0;
  const canCancel = ['placed', 'packed'].includes(order.status);

  const onCancel = async () => {
    setBusy(true);
    try {
      await cancelOrder(order.id, 'Cancelled from the order page.');
      toast.info(`Order ${order.id} cancelled.`);
      setConfirmCancel(false);
      reload();
    } catch (caught) {
      toast.error(caught.message);
    } finally {
      setBusy(false);
    }
  };

  const summaryRows = [
    ['Items', formatPrice(order.totals.listTotal)],
    ...(order.totals.catalogueSaving > 0
      ? [['Catalogue reductions', `− ${formatPrice(order.totals.catalogueSaving)}`]]
      : []),
    ...(order.totals.promoDiscount > 0
      ? [[`Code ${order.totals.promoCode}`, `− ${formatPrice(order.totals.promoDiscount)}`]]
      : []),
    ['Delivery', order.totals.shipping === 0 ? 'Complimentary' : formatPrice(order.totals.shipping)],
    ['GST', formatPrice(order.totals.tax)],
  ];

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title={`Order ${order.id}`}
        description={`Placed on ${formatDate(order.placedAt)} · ${order.payment.method.toUpperCase()} · ${
          order.payment.reference
        }`}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Orders', to: '/orders' }, { label: order.id }]}
        action={<StatusChip status={order.status} size="medium" />}
      />

      {cancelled ? (
        <Alert severity="error" variant="outlined" sx={{ mb: 4 }}>
          This order was cancelled on {formatDate(order.updatedAt)}. Any amount charged is refunded
          to the original payment method within five working days.
        </Alert>
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {ORDER_FLOW.map((stage) => (
              <Step key={stage}>
                <StepLabel>{ORDER_STATUS[stage].label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', textAlign: 'center', mt: 3 }}
          >
            {order.status === 'delivered'
              ? `Delivered on ${formatDate(order.updatedAt)}.`
              : `Expected by ${formatDate(order.expectedBy)}.`}
          </Typography>
        </Paper>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' },
          gap: { xs: 4, md: 5 },
          alignItems: 'start',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper variant="outlined">
            <Typography variant="h5" sx={{ p: 3, pb: 2 }}>
              {order.totals.itemCount} {order.totals.itemCount === 1 ? 'piece' : 'pieces'}
            </Typography>
            <Divider />
            {order.items.map((item, index) => (
              <Box key={`${item.productId}-${item.size}-${item.color}`}>
                {index > 0 && <Divider />}
                <Box sx={{ display: 'flex', gap: 2.5, p: 3 }}>
                  <Box component={Link} to={`/product/${item.productId}`}>
                    <Box
                      component="img"
                      src={item.thumbnail}
                      alt={item.name}
                      loading="lazy"
                      sx={{ width: 76, height: 98, objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.brand}
                    </Typography>
                    <Typography
                      component={Link}
                      to={`/product/${item.productId}`}
                      variant="subtitle2"
                      sx={{ display: 'block', color: 'text.primary', textDecoration: 'none' }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Size {item.size} · {item.color} · quantity {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2">
                    {formatPrice(item.finalPrice * item.quantity)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              History
            </Typography>
            {order.timeline.map((entry, index) => (
              <Box key={`${entry.status}-${entry.at}`} sx={{ display: 'flex', gap: 2, pb: 2 }}>
                <Box
                  sx={{
                    mt: 0.75,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: index === order.timeline.length - 1 ? 'primary.main' : 'divider',
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography variant="subtitle2">
                    {ORDER_STATUS[entry.status]?.label ?? entry.status}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {formatDateTime(entry.at)}
                    {entry.note && ` · ${entry.note}`}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Summary
            </Typography>
            {summaryRows.map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {label}
                </Typography>
                <Typography variant="body2">{value}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">Total</Typography>
              <Typography variant="subtitle1">{formatPrice(order.totals.total)}</Typography>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Delivering to
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {order.address.fullName} · {order.address.phone}
              <br />
              {order.address.line1}
              {order.address.line2 && `, ${order.address.line2}`}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
            </Typography>
            {order.note && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Your note
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {order.note}
                </Typography>
              </>
            )}
          </Paper>

          {canCancel && (
            <Button variant="outlined" color="error" onClick={() => setConfirmCancel(true)}>
              Cancel this order
            </Button>
          )}
          <Button component={Link} to="/orders" color="inherit">
            All your orders
          </Button>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        description="The pieces go back to stock and any charge is refunded. This cannot be undone."
        confirmLabel="Cancel the order"
        cancelLabel="Keep it"
        destructive
        busy={busy}
        onClose={() => setConfirmCancel(false)}
        onConfirm={onCancel}
      />
    </Container>
  );
}
