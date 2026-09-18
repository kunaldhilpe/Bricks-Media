import { Link, useParams } from 'react-router-dom';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Container from '@/components/common/Container';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorState from '@/components/common/ErrorState';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getOrder } from '@/api/orders';
import { formatDate, formatPrice } from '@/utils/format';

export default function OrderPlacedPage() {
  const { id } = useParams();
  useDocumentTitle('Order placed');
  const { data: order, loading, error, reload } = useAsync(() => getOrder(id), [id]);

  if (loading) return <LoadingScreen message="Fetching your order" />;
  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <ErrorState error={error} onRetry={reload} />
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 680, mx: 'auto', textAlign: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 52, color: 'success.main' }} />
        <Typography variant="h2" component="h1" sx={{ mt: 2 }}>
          Your order is in.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2 }}>
          We have sent a confirmation to {order.customerEmail}. Everything is packed at the Mumbai
          atelier and should reach you by {formatDate(order.expectedBy)}.
        </Typography>

        <Paper variant="outlined" sx={{ mt: 5, textAlign: 'left' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 2,
              p: 3,
            }}
          >
            {[
              ['Order', order.id],
              ['Placed', formatDate(order.placedAt)],
              ['Items', order.totals.itemCount],
              ['Total', formatPrice(order.totals.total)],
            ].map(([label, value]) => (
              <Box key={label}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {label}
                </Typography>
                <Typography variant="subtitle2">{value}</Typography>
              </Box>
            ))}
          </Box>
          <Divider />
          <Box sx={{ p: 3 }}>
            {order.items.map((item) => (
              <Box key={`${item.productId}-${item.size}-${item.color}`} sx={{ display: 'flex', gap: 2, py: 1 }}>
                <Box
                  component="img"
                  src={item.thumbnail}
                  alt=""
                  loading="lazy"
                  sx={{ width: 48, height: 62, objectFit: 'cover' }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Size {item.size} · {item.color} · ×{item.quantity}
                  </Typography>
                </Box>
                <Typography variant="body2">{formatPrice(item.finalPrice * item.quantity)}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
          <Button component={Link} to={`/orders/${order.id}`} variant="contained">
            Track this order
          </Button>
          <Button component={Link} to="/shop" variant="outlined">
            Keep shopping
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
