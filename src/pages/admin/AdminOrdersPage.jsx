import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import StatusChip from '@/components/common/StatusChip';
import TableToolbar from '@/components/admin/TableToolbar';
import useDebounce from '@/hooks/useDebounce';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/ToastContext';
import { listOrders, nextStatus, updateOrderStatus } from '@/api/orders';
import { ORDER_FLOW } from '@/utils/constants';
import { formatDateTime, formatPrice, pluralise } from '@/utils/format';

const TABS = ['all', ...ORDER_FLOW, 'cancelled'];

export default function AdminOrdersPage() {
  useDocumentTitle('Orders · Console');
  const toast = useToast();
  const [params] = useSearchParams();
  const [tab, setTab] = useState('all');
  const [term, setTerm] = useState(params.get('q') ?? '');
  const debounced = useDebounce(term, 300);
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let live = true;
    setLoading(true);
    listOrders({ status: tab, q: debounced })
      .then((next) => {
        if (!live) return;
        setOrders(next);
        setError(null);
        setLoading(false);
      })
      .catch((caught) => {
        if (!live) return;
        setError(caught);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [tab, debounced, reloadKey]);

  const totals = useMemo(() => {
    const list = orders ?? [];
    return {
      count: list.length,
      value: list
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.totals.total, 0),
    };
  }, [orders]);

  const advance = async (order) => {
    const target = nextStatus(order.status);
    if (!target) return;
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, target, `Marked ${target} from the console.`);
      toast.success(`${order.id} is now ${target}.`);
      setReloadKey((key) => key + 1);
    } catch (caught) {
      toast.error(caught.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Orders"
        description="Every order placed in this browser, whichever customer placed it."
      />

      {error && <ErrorState error={error} onRetry={() => setReloadKey((key) => key + 1)} />}

      <Card>
        <Tabs
          value={tab}
          onChange={(_, next) => setTab(next)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {TABS.map((entry) => (
            <Tab
              key={entry}
              value={entry}
              label={entry === 'all' ? 'All' : entry[0].toUpperCase() + entry.slice(1)}
            />
          ))}
        </Tabs>

        <TableToolbar
          searchValue={term}
          onSearch={setTerm}
          placeholder="Search order id, name or email"
          resultLabel={
            loading
              ? 'Loading'
              : `${pluralise(totals.count, 'order')} · ${formatPrice(totals.value)}`
          }
        />

        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Placed</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton height={32} />
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                (orders ?? []).map((order) => {
                  const target = nextStatus(order.status);
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography
                          component={Link}
                          to={`/admin/orders/${order.id}`}
                          variant="body2"
                          sx={{ fontWeight: 500, textDecoration: 'none', color: 'text.primary' }}
                        >
                          {order.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {order.payment.method.toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.customerName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {order.customerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDateTime(order.placedAt)}</Typography>
                      </TableCell>
                      <TableCell align="right">{order.totals.itemCount}</TableCell>
                      <TableCell align="right">{formatPrice(order.totals.total)}</TableCell>
                      <TableCell>
                        <StatusChip status={order.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', gap: 1 }}>
                          {target && (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={busyId === order.id}
                              onClick={() => advance(order)}
                            >
                              Mark {target}
                            </Button>
                          )}
                          <Button size="small" component={Link} to={`/admin/orders/${order.id}`}>
                            Open
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Box>

        {!loading && (orders ?? []).length === 0 && (
          <Box sx={{ p: 3 }}>
            <EmptyState
              dense
              icon={ReceiptLongOutlinedIcon}
              title={term || tab !== 'all' ? 'No orders match that' : 'No orders yet'}
              description={
                term || tab !== 'all'
                  ? 'Clear the search or switch back to the All tab.'
                  : 'Orders are created by checking out on the storefront. Sign in as a customer and place one to see this table fill up.'
              }
              actionLabel={term || tab !== 'all' ? 'Show all orders' : 'Open the storefront'}
              onAction={
                term || tab !== 'all'
                  ? () => {
                      setTerm('');
                      setTab('all');
                    }
                  : undefined
              }
              actionTo={term || tab !== 'all' ? undefined : '/'}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}
