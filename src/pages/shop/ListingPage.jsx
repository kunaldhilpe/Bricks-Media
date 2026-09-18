import { useCallback, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Pagination,
  Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import ProductGrid from '@/components/shop/ProductGrid';
import FilterPanel from '@/components/shop/FilterPanel';
import ActiveFilterChips from '@/components/shop/ActiveFilterChips';
import SortSelect from '@/components/shop/SortSelect';
import useProductFilters from '@/hooks/useProductFilters';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { queryProducts } from '@/api/products';
import { useCatalog } from '@/context/CatalogContext';
import { formatNumber } from '@/utils/format';

/**
 * One screen serves /shop and /category/:slug. The category in the path just
 * pins one filter; everything else behaves identically.
 */
export default function ListingPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { categoryFor, priceRange } = useCatalog();
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    filters,
    sort,
    page,
    perPage,
    activeCount,
    toggleValue,
    setValue,
    setPriceRange,
    setPage,
    clearAll,
    removeChip,
  } = useProductFilters({ categorySlug: slug });

  const category = slug ? categoryFor(slug) : null;
  const keyword = filters.q;

  const title = category?.name ?? (keyword ? `Results for “${keyword}”` : 'The whole collection');
  useDocumentTitle(title);

  const load = useCallback(
    () => queryProducts(filters, { page, perPage, sort }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString(), slug],
  );

  const { data, loading, error, reload } = useAsync(load, [searchParams.toString(), slug]);

  const description = category
    ? `${category.subcategories.join(' · ')}`
    : keyword
      ? 'Matching on name, label, fabric, colour and SKU.'
      : 'Every piece currently held, across eight categories and thirty labels.';

  const filterPanel = (
    <FilterPanel
      filters={filters}
      facets={data?.facets}
      priceRange={data?.priceRange ?? priceRange}
      activeCount={activeCount}
      onToggle={toggleValue}
      onSetValue={setValue}
      onSetPrice={setPriceRange}
      onClear={clearAll}
      showCategory={!slug}
    />
  );

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title={title}
        description={description}
        crumbs={[
          { label: 'Home', to: '/' },
          ...(category ? [{ label: 'Categories', to: '/shop' }, { label: category.name }] : [{ label: 'Shop' }]),
        ]}
      />

      <Box sx={{ display: 'flex', gap: { md: 5 } }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 262,
            flexShrink: 0,
          }}
        >
          {filterPanel}
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              mb: 2.5,
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                <Badge badgeContent={activeCount} color="primary">
                  <TuneIcon fontSize="small" />
                </Badge>
              }
              onClick={() => setFilterOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              Filters
            </Button>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {loading
                ? 'Looking…'
                : `${formatNumber(data?.total ?? 0)} ${data?.total === 1 ? 'piece' : 'pieces'}`}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />
            <SortSelect value={sort} onChange={(value) => setValue('sort', value)} />
          </Box>

          <ActiveFilterChips
            filters={filters}
            priceRange={data?.priceRange ?? priceRange}
            activeCount={activeCount}
            onRemove={removeChip}
            onClear={clearAll}
          />

          {error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : !loading && data?.total === 0 ? (
            <EmptyState
              icon={SearchOffIcon}
              title="Nothing matches those filters"
              description="Loosening the price range or clearing a colour usually brings results back."
              actionLabel="Clear all filters"
              onAction={clearAll}
            />
          ) : (
            <>
              <ProductGrid products={data?.items ?? []} loading={loading} skeletonCount={perPage} />

              {(data?.pageCount ?? 1) > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination
                    count={data.pageCount}
                    page={data.page}
                    onChange={(_, value) => setPage(value)}
                    shape="rounded"
                    siblingCount={1}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )} 
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        slotProps={{ paper: { sx: { width: { xs: '86%', sm: 340 } } } }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h5">Filters</Typography>
          <IconButton onClick={() => setFilterOpen(false)} aria-label="Close filters">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ px: 2.5, pb: 3, overflowY: 'auto' }}>{filterPanel}</Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="contained" onClick={() => setFilterOpen(false)}>
            Show {formatNumber(data?.total ?? 0)} pieces
          </Button>
        </Box>
      </Drawer>
    </Container>
  );
}
