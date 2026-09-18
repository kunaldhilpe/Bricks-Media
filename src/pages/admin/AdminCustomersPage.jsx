import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import ErrorState from '@/components/common/ErrorState';
import StatCard from '@/components/admin/StatCard';
import TableToolbar from '@/components/admin/TableToolbar';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { listUsers } from '@/api/auth';
import { getCustomerStats } from '@/api/orders';
import { formatCompactPrice, formatPrice, formatRelative, initials } from '@/utils/format';

export default function AdminCustomersPage() {
  useDocumentTitle('Customers · Console');
  const [term, setTerm] = useState('');

  const request = useAsync(
    () => Promise.all([listUsers(), getCustomerStats()]).then(([users, stats]) => ({ users, stats })),
    [],
  );

  const rows = useMemo(() => {
    if (!request.data) return [];
    const { users, stats } = request.data;
    const needle = term.trim().toLowerCase();
    return users
      .map((user) => ({
        ...user,
        metrics: stats.get(user.id) ?? { orders: 0, spend: 0, lastOrderAt: null, cancelled: 0 },
      }))
      .filter(
        (user) =>
          !needle ||
          user.name.toLowerCase().includes(needle) ||
          user.username.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.metrics.spend - a.metrics.spend || a.name.localeCompare(b.name));
  }, [request.data, term]);

  const summary = useMemo(() => {
    const all = rows;
    const active = all.filter((user) => user.metrics.orders > 0);
    const spend = all.reduce((sum, user) => sum + user.metrics.spend, 0);
    return {
      accounts: all.length,
      active: active.length,
      spend,
      average: active.length ? Math.round(spend / active.length) : 0,
    };
  }, [rows]);

  if (request.error) {
    return (
      <Box>
        <PageHeader title="Customers" />
        <ErrorState error={request.error} onRetry={request.reload} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Customers"
        description="The eight accounts shipped in users.json, with whatever they have bought in this browser."
      />

      <Alert severity="warning" variant="outlined" sx={{ mb: 3 }}>
        users.json is served to the browser with passwords in plain text. It exists so the demo can
        sign in without a backend; it is not a pattern to copy.
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          mb: 3,
        }}
      >
        {request.loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={132} />
          ))
        ) : (
          <>
            <StatCard label="Accounts" value={summary.accounts} hint="in users.json" />
            <StatCard
              label="Have ordered"
              value={summary.active}
              hint={`${summary.accounts - summary.active} yet to buy`}
              accent="secondary"
            />
            <StatCard label="Total spend" value={formatCompactPrice(summary.spend)} />
            <StatCard
              label="Average per buyer"
              value={formatCompactPrice(summary.average)}
              accent="secondary"
            />
          </>
        )}
      </Box>

      <Card>
        <TableToolbar
          searchValue={term}
          onSearch={setTerm}
          placeholder="Search name, username or email"
          resultLabel={`${rows.length} shown`}
        />
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell align="right">Spend</TableCell>
                <TableCell>Last order</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {request.loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <Skeleton height={32} />
                    </TableCell>
                  </TableRow>
                ))}

              {!request.loading &&
                rows.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={user.avatar} sx={{ width: 36, height: 36 }}>
                          {initials(user.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            @{user.username} &middot; {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === 'admin' ? 'Admin' : 'Customer'}
                        size="small"
                        variant="outlined"
                        color={user.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {user.metrics.orders}
                      {user.metrics.cancelled > 0 && (
                        <Typography variant="caption" sx={{ color: 'error.main', display: 'block' }}>
                          {user.metrics.cancelled} cancelled
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {user.metrics.spend > 0 ? formatPrice(user.metrics.spend) : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {user.metrics.lastOrderAt ? formatRelative(user.metrics.lastOrderAt) : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        component={Link}
                        to={`/admin/orders?q=${encodeURIComponent(user.email)}`}
                        disabled={user.metrics.orders === 0}
                      >
                        Orders
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
