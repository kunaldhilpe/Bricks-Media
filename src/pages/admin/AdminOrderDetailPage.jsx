import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import ErrorState from '@/components/common/ErrorState';
import StatusChip from '@/components/common/StatusChip';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/ToastContext';
import { getOrder, nextStatus, updateOrderStatus } from '@/api/orders';
import { ORDER_FLOW, ORDER_STATUS } from '@/utils/constants';
import { formatDateTime, formatPrice, pluralise } from '@/utils/format';

function Row({ label, value, strong = false, muted = false }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.6 }}>
      <Typography
        variant="body2"
        sx={{ color: muted ? 'text.secondary' : 'text.primary', fontWeight: strong ? 500 : 400 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 500 : 400 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const { data: order, loading, error, reload } = useAsync(() => getOrder(id), [id]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useDocumentTitle(order ? `${order.id} · Console` : 'Order · Console');

  const move = async (status, message) => {
    setBusy(true);
    try {
      await updateOrderStatus(id, status, message || note || undefined);
      setNote('');
      toast.success(`${id} is now ${status}.`);
      reload();
    } catch (caught) {
      toast.error(caught.message);
    } finally {
      setBusy(false);
      setCancelOpen(false);
    }
  };

  if (error) {
    return (
      <Box>
        <PageHeader title="Order" />
        <ErrorState error={error} title="That order could not be found" onRetry={reload} />
        <Button component={Link} to="/admin/orders" sx={{ mt: 2 }}>
          Back to orders
        </Button>
      </Box>
    );
  }

  if (loading || !order) {
    return (
      <Box>
        <PageHeader title="Order" />
        <Skeleton variant="rectangular" height={420} />
      </Box>
    );
  }

  const target = nextStatus(order.status);
  const cancelled = order.status === 'cancelled';
  const activeStep = cancelled ? -1 : ORDER_STATUS[order.status]?.step ?? 0;

  return (
    <Box>
      <PageHeader
        title={order.id}
        description={`Placed ${formatDateTime(order.placedAt)} by ${order.customerName}`}
        crumbs={[
          { label: 'Console', to: '/admin' },
          { label: 'Orders', to: '/admin/orders' },
          { label: order.id },
        ]}
        action={
          <Button
            component={Link}
            to="/admin/orders"
            color="inherit"
            startIcon={<ArrowBackIcon sx={{ fontSize: 17 }} />}
          >
            All orders
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' },
          alignItems: 'start',
        }}
      >
        <Box sx={{ display: 'grid', gap: 2.5 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 3,
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="h6" component="h2">
                  Fulfilment
                </Typography>
                <StatusChip status={order.status} size="medium" />
              </Box>

              {cancelled ? (
                <Alert severity="error" variant="outlined">
                  This order was cancelled {formatDateTime(order.updatedAt)}. Cancelled orders
                  cannot be reopened.
                </Alert>
              ) : (
                <Stepper activeStep={activeStep} alternativeLabel>
                  {ORDER_FLOW.map((status) => (
                    <Step key={status}>
                      <StepLabel>{ORDER_STATUS[status].label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}

              {!cancelled && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <TextField
                    label="Note for the timeline"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Optional, e.g. handed to the courier at 4pm"
                    fullWidth
                    size="medium"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {target && (
                      <Button variant="contained" disabled={busy} onClick={() => move(target)}>
                        Mark {ORDER_STATUS[target].label.toLowerCase()}
                      </Button>
                    )}
                    {!target && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        This order has reached the end of the flow.
                      </Typography>
                    )}
                    <Button
                      color="error"
                      variant="outlined"
                      disabled={busy || order.status === 'delivered'}
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel order
                    </Button>
                  </Box>
                  {order.status === 'delivered' && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
                      Delivered orders can no longer be cancelled, only returned.
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                {pluralise(order.items.length, 'line')}, {order.totals.itemCount} units
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 560 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Piece</TableCell>
                      <TableCell>Size / colour</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Line</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={`${item.productId}-${item.size}-${item.color}`}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={item.thumbnail}
                              variant="rounded"
                              sx={{ width: 38, height: 48 }}
                            />
                            <Box>
                              <Typography
                                component={Link}
                                to={`/product/${item.productId}`}
                                variant="body2"
                                sx={{ textDecoration: 'none', color: 'text.primary' }}
                              >
                                {item.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {item.brand}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.size} &middot; {item.color}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatPrice(item.finalPrice * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2.5 }}>
                History
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {[...order.timeline].reverse().map((entry, index) => (
                  <Box key={`${entry.status}-${entry.at}`} sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        mt: 0.7,
                        borderRadius: '50%',
                        flexShrink: 0,
                        bgcolor: index === 0 ? 'primary.main' : 'divider',
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ORDER_STATUS[entry.status]?.label ?? entry.status}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {formatDateTime(entry.at)}
                        {entry.note ? ` — ${entry.note}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gap: 2.5 }}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                Payment
              </Typography>
              <Row label="Subtotal" value={formatPrice(order.totals.subtotal)} muted />
              {order.totals.promoDiscount > 0 && (
                <Row
                  label={`Promo ${order.totals.promoCode}`}
                  value={`− ${formatPrice(order.totals.promoDiscount)}`}
                  muted
                />
              )}
              <Row
                label="Shipping"
                value={order.totals.shipping === 0 ? 'Free' : formatPrice(order.totals.shipping)}
                muted
              />
              <Row label="GST (5%)" value={formatPrice(order.totals.tax)} muted />
              <Divider sx={{ my: 1 }} />
              <Row label="Total" value={formatPrice(order.totals.total)} strong />
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {order.payment.method.toUpperCase()} &middot; {order.payment.reference}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                Delivering to
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
                {order.address.fullName}
                <br />
                {order.address.line1}
                {order.address.line2 ? (
                  <>
                    <br />
                    {order.address.line2}
                  </>
                ) : null}
                <br />
                {order.address.city}, {order.address.state} {order.address.pincode}
                <br />
                {order.address.phone}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Expected by {formatDateTime(order.expectedBy)}
              </Typography>
            </CardContent>
          </Card>

          {order.note && (
            <Alert severity="info" variant="outlined">
              Customer note: {order.note}
            </Alert>
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this order?"
        description="The customer will see it as cancelled and the timeline will record the change. This cannot be undone."
        confirmLabel="Cancel the order"
        cancelLabel="Leave it"
        destructive
        busy={busy}
        onConfirm={() => move('cancelled', note || 'Cancelled by the store.')}
        onClose={() => setCancelOpen(false)}
      />
    </Box>
  );
}
