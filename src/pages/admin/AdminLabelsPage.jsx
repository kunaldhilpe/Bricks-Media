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
import StarRating from '@/components/common/StarRating';
import TableToolbar from '@/components/admin/TableToolbar';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getCatalogStats } from '@/api/products';
import { listBrands } from '@/api/catalogue';
import { formatCompactPrice, formatNumber } from '@/utils/format';

export default function AdminLabelsPage() {
  useDocumentTitle('Labels · Console');
  const [term, setTerm] = useState('');

  const request = useAsync(
    () =>
      Promise.all([listBrands(), getCatalogStats()]).then(([brands, stats]) => ({
        brands,
        byBrand: new Map(stats.byBrand.map((entry) => [entry.id, entry])),
      })),
    [],
  );

  const rows = useMemo(() => {
    if (!request.data) return [];
    const needle = term.trim().toLowerCase();
    return request.data.brands
      .map((brand) => ({ ...brand, metrics: request.data.byBrand.get(brand.id) }))
      .filter(
        (brand) =>
          !needle ||
          brand.name.toLowerCase().includes(needle) ||
          brand.country.toLowerCase().includes(needle),
      )
      .sort((a, b) => (b.metrics?.inventoryValue ?? 0) - (a.metrics?.inventoryValue ?? 0));
  }, [request.data, term]);

  if (request.error) {
    return (
      <Box>
        <PageHeader title="Labels" />
        <ErrorState error={request.error} onRetry={request.reload} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Labels"
        description="Thirty houses from brands.json, ranked by the value of stock they hold."
      />

      <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
        Labels are reference data, like categories: a browser cannot rewrite brands.json, so this
        screen reports rather than edits. Pieces can be reassigned to a different label on the
        product form.
      </Alert>

      <Card>
        <TableToolbar
          searchValue={term}
          onSearch={setTerm}
          placeholder="Search label or country"
          resultLabel={`${rows.length} of ${request.data?.brands.length ?? 0}`}
        />
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Origin</TableCell>
                <TableCell align="right">Pieces</TableCell>
                <TableCell align="right">Stock value</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {request.loading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <Skeleton height={32} />
                    </TableCell>
                  </TableRow>
                ))}

              {!request.loading &&
                rows.map((brand) => (
                  <TableRow key={brand.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={brand.logo} variant="rounded" sx={{ width: 36, height: 36 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {brand.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            /{brand.slug}
                          </Typography>
                        </Box>
                        {brand.featured && (
                          <Chip label="Featured" size="small" variant="outlined" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{brand.country}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        est. {brand.founded}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatNumber(brand.productCount)}</TableCell>
                    <TableCell align="right">
                      {formatCompactPrice(brand.metrics?.inventoryValue ?? 0)}
                    </TableCell>
                    <TableCell>
                      <StarRating value={brand.metrics?.avgRating ?? 0} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', gap: 1 }}>
                        <Button
                          size="small"
                          component={Link}
                          to={`/admin/products?brand=${brand.id}`}
                        >
                          Manage
                        </Button>
                        <Button
                          size="small"
                          color="inherit"
                          component={Link}
                          to={`/label/${brand.slug}`}
                          target="_blank"
                        >
                          View
                        </Button>
                      </Box>
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
