import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PageHeader from '@/components/common/PageHeader';
import ErrorState from '@/components/common/ErrorState';
import StatusChip from '@/components/common/StatusChip';
import StatCard from '@/components/admin/StatCard';
import TrendChart from '@/components/admin/TrendChart';
import BarChart from '@/components/admin/BarChart';
import DonutChart from '@/components/admin/DonutChart';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getSalesStats } from '@/api/orders';
import { getCatalogStats } from '@/api/products';
import {
  formatCompactPrice,
  formatDate,
  formatNumber,
  formatPrice,
  pluralise,
} from '@/utils/format';

function Panel({ title, description, action, children, sx }) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {description && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {description}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Console overview');
  const sales = useAsync(() => getSalesStats(30), []);
  const catalogue = useAsync(() => getCatalogStats(), []);

  const s = sales.data;
  const c = catalogue.data;
  const loading = sales.loading || catalogue.loading;

  if (sales.error || catalogue.error) {
    return (
      <Box>
        <PageHeader title="Overview" />
        <ErrorState
          error={sales.error ?? catalogue.error}
          onRetry={() => {
            sales.reload();
            catalogue.reload();
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Overview"
        description="Catalogue health from the shipped data, sales from orders placed in this browser."
        action={
          <Button component={Link} to="/admin/products/new" variant="contained">
            Add a piece
          </Button>
        }
      />

      {!loading && s?.orderCount === 0 && (
        <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
          No orders yet, so every sales figure below reads zero. Place an order on the storefront
          and this dashboard fills in immediately.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          mb: 3,
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={132} />
          ))
        ) : (
          <>
            <StatCard
              label="Revenue (30 days)"
              value={formatCompactPrice(s.revenue)}
              hint={`${pluralise(s.orderCount, 'order')} placed`}
              icon={PaymentsOutlinedIcon}
            />
            <StatCard
              label="Average order"
              value={formatCompactPrice(s.averageOrderValue)}
              hint={`${formatNumber(s.units)} units sold`}
              icon={ShoppingBagOutlinedIcon}
              accent="secondary"
            />
            <StatCard
              label="Catalogue"
              value={formatNumber(c.totals.products)}
              hint={`${c.totals.brands} labels, ${c.totals.categories} categories`}
              icon={Inventory2OutlinedIcon}
            />
            <StatCard
              label="Stock at risk"
              value={formatNumber(c.totals.lowStock + c.totals.outOfStock)}
              hint={`${c.totals.outOfStock} sold out, ${c.totals.lowStock} running low`}
              icon={ReceiptLongOutlinedIcon}
              accent="secondary"
            />
          </>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.6fr) minmax(0, 1fr)' },
          mb: 2.5,
        }}
      >
        <Panel title="Revenue, last 30 days" description="Hover a day for the exact figure.">
          {loading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <TrendChart data={s.buckets} valueKey="revenue" formatter={formatPrice} />
          )}
        </Panel>

        <Panel title="Order status" description="Across every order in this browser.">
          {loading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <BarChart
              data={s.statusTally.map((entry) => ({
                label: entry.status[0].toUpperCase() + entry.status.slice(1),
                value: entry.count,
              }))}
            />
          )}
        </Panel>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          mb: 2.5,
        }}
      >
        <Panel
          title="Inventory value by category"
          description="Final price multiplied by units on hand."
          action={
            <Button component={Link} to="/admin/categories" size="small">
              Details
            </Button>
          }
        >
          {loading ? (
            <Skeleton variant="rectangular" height={220} />
          ) : (
            <BarChart
              data={c.byCategory.map((entry) => ({
                label: `${entry.icon} ${entry.name}`,
                value: entry.inventoryValue,
              }))}
              valueFormatter={formatCompactPrice}
            />
          )}
        </Panel>

        <Panel title="Who it is cut for" description="Share of the catalogue by intended wearer.">
          {loading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <>
              <DonutChart data={c.genderSplit} />
              <Divider sx={{ my: 2.5 }} />
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Stock value
                  </Typography>
                  <Typography variant="h6">{formatCompactPrice(c.totals.inventoryValue)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Average rating
                  </Typography>
                  <Typography variant="h6">{c.totals.avgRating}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Average discount
                  </Typography>
                  <Typography variant="h6">{c.totals.avgDiscount}%</Typography>
                </Box>
              </Box>
            </>
          )}
        </Panel>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Panel
          title="Running low"
          description="Eight units or fewer left."
          action={
            <Button component={Link} to="/admin/products?stock=low" size="small">
              Manage
            </Button>
          }
        >
          {loading ? (
            <Skeleton variant="rectangular" height={240} />
          ) : c.lowStock.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Nothing is running low.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Piece</TableCell>
                  <TableCell align="right">Left</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {c.lowStock.slice(0, 8).map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Typography
                        component={Link}
                        to={`/admin/products/${product.id}`}
                        variant="body2"
                        sx={{ textDecoration: 'none', color: 'text.primary' }}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {product.brand}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'brand.lowStock', fontWeight: 500 }}>
                      {product.stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel
          title="Latest orders"
          action={
            <Button component={Link} to="/admin/orders" size="small">
              All orders
            </Button>
          }
        >
          {loading ? (
            <Skeleton variant="rectangular" height={240} />
          ) : s.recent.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No orders have been placed yet.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {s.recent.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography
                        component={Link}
                        to={`/admin/orders/${order.id}`}
                        variant="body2"
                        sx={{ textDecoration: 'none', color: 'text.primary' }}
                      >
                        {order.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {order.customerName} &middot; {formatDate(order.placedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={order.status} />
                    </TableCell>
                    <TableCell align="right">{formatPrice(order.totals.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      </Box>

      {!loading && s.topProducts.length > 0 && (
        <Panel title="Best sellers by revenue" sx={{ mt: 2.5 }}>
          <BarChart
            data={s.topProducts.map((entry) => ({
              label: `${entry.name} (${entry.units} sold)`,
              value: entry.revenue,
            }))}
            valueFormatter={formatPrice}
          />
        </Panel>
      )}
    </Box>
  );
}
