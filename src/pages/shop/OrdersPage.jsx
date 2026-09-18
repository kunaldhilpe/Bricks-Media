import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import StatusChip from '@/components/common/StatusChip';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { listOrders } from '@/api/orders';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatPrice, pluralise } from '@/utils/format';
import { ORDER_STATUS } from '@/utils/constants';

export default function OrdersPage() {
  useDocumentTitle('Your orders');
  const { user } = useAuth();
  const [status, setStatus] = useState('all');

  const { data: orders, loading, error, reload } = useAsync(
    () => listOrders({ userId: user?.id, status }),
    [user?.id, status],
  );

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Your orders"
        description="Everything you have placed with us, newest first."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Orders' }]}
        action={
          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{ minWidth: 168 }}
          >
            <MenuItem value="all">All orders</MenuItem>
            {Object.entries(ORDER_STATUS).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                {config.label}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      {error && <ErrorState error={error} onRetry={reload} />}

      {!loading && orders?.length === 0 && (
        <EmptyState
          icon={ReceiptLongOutlinedIcon}
          title={status === 'all' ? 'No orders yet' : `Nothing is ${ORDER_STATUS[status]?.label.toLowerCase()}`}
          description={
            status === 'all'
              ? 'When you place an order it will appear here with its tracking.'
              : 'Try another status, or look at all of your orders.'
          }
          actionLabel={status === 'all' ? 'Start shopping' : 'Show all orders'}
          actionTo={status === 'all' ? '/shop' : undefined}
          onAction={status === 'all' ? undefined : () => setStatus('all')}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {(orders ?? []).map((order) => (
          <Paper key={order.id} variant="outlined">
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                px: 3,
                py: 2,
                bgcolor: 'surface.tint',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Order
                </Typography>
                <Typography variant="subtitle2">{order.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Placed
                </Typography>
                <Typography variant="subtitle2">{formatDate(order.placedAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Total
                </Typography>
                <Typography variant="subtitle2">{formatPrice(order.totals.total)}</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <StatusChip status={order.status} />
              <Button component={Link} to={`/orders/${order.id}`} size="small" variant="outlined">
                View details
              </Button>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 2, p: 3, flexWrap: 'wrap' }}>
              {order.items.slice(0, 5).map((item) => (
                <Box
                  key={`${item.productId}-${item.size}-${item.color}`}
                  component={Link}
                  to={`/product/${item.productId}`}
                  sx={{ display: 'block' }}
                >
                  <Box
                    component="img"
                    src={item.thumbnail}
                    alt={item.name}
                    loading="lazy"
                    sx={{ width: 62, height: 80, objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              ))}
              <Box sx={{ alignSelf: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {pluralise(order.totals.itemCount, 'piece')}
                  {order.items.length > 5 && ` · ${order.items.length - 5} more not shown`}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Expected by {formatDate(order.expectedBy)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
