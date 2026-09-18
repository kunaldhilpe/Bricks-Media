import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  MenuItem,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TableToolbar from '@/components/admin/TableToolbar';
import useDebounce from '@/hooks/useDebounce';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';
import { adjustStock, deleteProduct, queryProducts, readOverlay } from '@/api/products';
import { formatNumber, formatPrice, truncate } from '@/utils/format';

const PER_PAGE = 20;

const COLUMNS = [
  { id: 'name', label: 'Piece', sort: 'name' },
  { id: 'category', label: 'Category' },
  { id: 'price', label: 'Price', sort: 'price-asc', numeric: true },
  { id: 'stock', label: 'Stock', sort: 'stock-asc', numeric: true },
  { id: 'rating', label: 'Rating', sort: 'rating', numeric: true },
  { id: 'actions', label: '', numeric: true },
];

const STOCK_FILTERS = [
  { value: 'any', label: 'Any stock level' },
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Running low (≤8)' },
  { value: 'out', label: 'Sold out' },
];

export default function AdminProductsPage() {
  useDocumentTitle('Products · Console');
  const { categories, brands } = useCatalog();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [term, setTerm] = useState(params.get('q') ?? '');
  const debounced = useDebounce(term, 320);
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const [brand, setBrand] = useState(params.get('brand') ?? 'all');
  const [stock, setStock] = useState(params.get('stock') ?? 'any');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [overlay, setOverlay] = useState(() => readOverlay());

  const filters = useMemo(
    () => ({
      q: debounced,
      categorySlug: category === 'all' ? undefined : category,
      brandIds: brand === 'all' ? [] : [Number(brand)],
      stockState: stock === 'any' ? undefined : stock,
    }),
    [debounced, category, brand, stock],
  );

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debounced) next.set('q', debounced);
    if (category !== 'all') next.set('category', category);
    if (brand !== 'all') next.set('brand', brand);
    if (stock !== 'any') next.set('stock', stock);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, category, brand, stock]);

  const load = () => {
    let live = true;
    setLoading(true);
    queryProducts(filters, { page, perPage: PER_PAGE, sort, withFacets: false })
      .then((next) => {
        if (!live) return;
        setResult(next);
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
  };

  useEffect(load, [filters, page, sort]);

  const refresh = () => {
    setOverlay(readOverlay());
    load();
  };

  /** Clicking a sortable header sets ascending, clicking again flips it. */
  const onSort = (column) => {
    if (!column.sort) return;
    const ascending = column.sort;
    const descending = ascending.replace('-asc', '-desc');
    setSort((current) => (current === ascending ? descending : ascending));
  };

  const isSortedBy = (column) =>
    Boolean(column.sort) &&
    (sort === column.sort || sort === column.sort.replace('-asc', '-desc'));

  const nudgeStock = async (product, delta) => {
    setBusyId(product.id);
    try {
      await adjustStock(product.id, delta);
      refresh();
    } catch (caught) {
      toast.error(caught.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(pendingDelete.id);
      toast.success(`${truncate(pendingDelete.name, 40)} removed from the catalogue.`);
      setPendingDelete(null);
      refresh();
    } catch (caught) {
      toast.error(caught.message);
    }
  };

  const editedCount =
    Object.keys(overlay.updated).length + overlay.created.length + overlay.deleted.length;

  return (
    <Box>
      <PageHeader
        title="Products"
        description={`${formatNumber(result?.total ?? 0)} pieces match the current filters. Edits are saved to this browser, not to products.json.`}
        action={
          <Button
            component={Link}
            to="/admin/products/new"
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          >
            Add a piece
          </Button>
        }
      />

      {editedCount > 0 && (
        <Chip
          label={`${editedCount} local ${editedCount === 1 ? 'change' : 'changes'} on top of the shipped data`}
          size="small"
          variant="outlined"
          color="secondary"
          sx={{ mb: 2.5 }}
        />
      )}

      {error && <ErrorState error={error} onRetry={refresh} />}

      <Card>
        <TableToolbar
          searchValue={term}
          onSearch={setTerm}
          placeholder="Search name, brand, SKU, colour"
          resultLabel={
            loading ? 'Searching' : `${formatNumber(result?.total ?? 0)} results`
          }
        >
          <TextField
            select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            sx={{ minWidth: 168 }}
          >
            <MenuItem value="all">All categories</MenuItem>
            {categories.map((entry) => (
              <MenuItem key={entry.id} value={entry.slug}>
                {entry.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            sx={{ minWidth: 168 }}
          >
            <MenuItem value="all">All labels</MenuItem>
            {brands.map((entry) => (
              <MenuItem key={entry.id} value={String(entry.id)}>
                {entry.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            sx={{ minWidth: 168 }}
          >
            {STOCK_FILTERS.map((entry) => (
              <MenuItem key={entry.value} value={entry.value}>
                {entry.label}
              </MenuItem>
            ))}
          </TextField>
        </TableToolbar>

        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 880 }}>
            <TableHead>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.numeric ? 'right' : 'left'}
                    sortDirection={
                      isSortedBy(column) ? (sort.endsWith('-desc') ? 'desc' : 'asc') : false
                    }
                  >
                    {column.sort ? (
                      <TableSortLabel
                        active={isSortedBy(column)}
                        direction={sort.endsWith('-desc') ? 'desc' : 'asc'}
                        onClick={() => onSort(column)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <Skeleton height={34} />
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                (result?.items ?? []).map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={product.thumbnail}
                          variant="rounded"
                          sx={{ width: 42, height: 52 }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {truncate(product.name, 46)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {product.brand} &middot; {product.sku}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{product.category}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {product.subcategory} &middot; {product.gender}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatPrice(product.finalPrice)}</Typography>
                      {product.discountPercent > 0 && (
                        <Typography variant="caption" sx={{ color: 'brand.sale' }}>
                          {product.discountPercent}% off
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <IconButton
                          size="small"
                          disabled={busyId === product.id || product.stock === 0}
                          onClick={() => nudgeStock(product, -1)}
                          aria-label="Reduce stock by one"
                        >
                          <RemoveIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                        <Typography
                          variant="body2"
                          sx={{
                            minWidth: 30,
                            fontWeight: 500,
                            color:
                              product.stock === 0
                                ? 'error.main'
                                : product.stock <= 8
                                  ? 'brand.lowStock'
                                  : 'text.primary',
                          }}
                        >
                          {product.stock}
                        </Typography>
                        <IconButton
                          size="small"
                          disabled={busyId === product.id}
                          onClick={() => nudgeStock(product, 1)}
                          aria-label="Add one to stock"
                        >
                          <AddIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{product.rating || '—'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatNumber(product.reviewCount)} reviews
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', gap: 0.25 }}>
                        <Tooltip title="View on the storefront">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/product/${product.id}`}
                            target="_blank"
                          >
                            <OpenInNewIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/admin/products/${product.id}`}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setPendingDelete(product)}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>

        {!loading && result?.total === 0 && (
          <Box sx={{ p: 3 }}>
            <EmptyState
              dense
              title="Nothing matches those filters"
              description="Widen the search or clear the filters to see the full catalogue again."
              actionLabel="Clear filters"
              onAction={() => {
                setTerm('');
                setCategory('all');
                setBrand('all');
                setStock('any');
              }}
            />
          </Box>
        )}

        {result && result.pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <Pagination
              count={result.pageCount}
              page={result.page}
              onChange={(_, value) => setPage(value)}
              shape="rounded"
              siblingCount={1}
            />
          </Box>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this piece?"
        description={`${pendingDelete?.name ?? ''} will disappear from the storefront and the console. Resetting the catalogue in Settings brings it back.`}
        confirmLabel="Remove it"
        destructive
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Box>
  );
}
