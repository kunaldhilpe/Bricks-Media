import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import BarChart from '@/components/admin/BarChart';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getCatalogStats } from '@/api/products';
import { useCatalog } from '@/context/CatalogContext';
import { formatCompactPrice, formatNumber, formatPrice } from '@/utils/format';

export default function AdminCategoriesPage() {
  useDocumentTitle('Categories · Console');
  const { categories } = useCatalog();
  const { data, loading, error, reload } = useAsync(() => getCatalogStats(), []);

  if (error) {
    return (
      <Box>
        <PageHeader title="Categories" />
        <ErrorState error={error} onRetry={reload} />
      </Box>
    );
  }

  const byCategory = data?.byCategory ?? [];
  const subcategoryMap = new Map(categories.map((entry) => [entry.id, entry.subcategories ?? []]));

  return (
    <Box>
      <PageHeader
        title="Categories"
        description="The eight categories and their subcategories come from categories.json. They are fixed structure, so this screen reports on them rather than editing them."
      />

      <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
        Adding or renaming a category would mean rewriting categories.json, which a browser cannot
        do. Products can be moved between the existing categories from the product form.
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
          alignItems: 'start',
        }}
      >
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Pieces</TableCell>
                  <TableCell align="right">Avg price</TableCell>
                  <TableCell align="right">Stock value</TableCell>
                  <TableCell align="right">Sold out</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading &&
                  Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton height={32} />
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading &&
                  byCategory.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {entry.icon} {entry.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75 }}>
                          {(subcategoryMap.get(entry.id) ?? []).map((sub) => (
                            <Chip key={sub} label={sub} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatNumber(entry.count)}</TableCell>
                      <TableCell align="right">{formatPrice(entry.avgPrice)}</TableCell>
                      <TableCell align="right">{formatCompactPrice(entry.inventoryValue)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: entry.outOfStock > 0 ? 'error.main' : 'text.secondary' }}
                      >
                        {entry.outOfStock}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', gap: 1 }}>
                          <Button
                            size="small"
                            component={Link}
                            to={`/admin/products?category=${entry.slug}`}
                          >
                            Manage
                          </Button>
                          <Button
                            size="small"
                            component={Link}
                            to={`/category/${entry.slug}`}
                            target="_blank"
                            color="inherit"
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

        <Box sx={{ display: 'grid', gap: 2.5 }}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2.5 }}>
                Pieces per category
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={240} />
              ) : (
                <BarChart
                  data={byCategory.map((entry) => ({
                    label: entry.name,
                    value: entry.count,
                  }))}
                  valueFormatter={formatNumber}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2.5 }}>
                Price bands
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={180} />
              ) : (
                <BarChart
                  data={(data?.priceBands ?? []).map((band) => ({
                    label: band.label,
                    value: band.count,
                  }))}
                  valueFormatter={formatNumber}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
