import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Pagination,
  Skeleton,
  Typography,
} from '@mui/material';
import Container from '@/components/common/Container';
import ErrorState from '@/components/common/ErrorState';
import StarRating from '@/components/common/StarRating';
import ProductGrid from '@/components/shop/ProductGrid';
import SortSelect from '@/components/shop/SortSelect';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getBrandBySlug } from '@/api/catalogue';
import { queryProducts } from '@/api/products';
import { formatNumber, formatPrice } from '@/utils/format';

const PER_PAGE = 24;

function Stat({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h6" component="p" sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function LabelPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const sort = params.get('sort') ?? 'featured';

  const brandRequest = useAsync(() => getBrandBySlug(slug), [slug]);
  const brand = brandRequest.data;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(brand ? brand.name : 'Label');

  useEffect(() => {
    if (!brand) return;
    let live = true;
    setLoading(true);
    queryProducts(
      { brandIds: [brand.id] },
      { page, perPage: PER_PAGE, sort, withFacets: false },
    ).then((next) => {
      if (!live) return;
      setResult(next);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [brand, page, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value == null || value === '') next.delete(key);
    else next.set(key, String(value));
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  if (brandRequest.error) {
    return (
      <Container sx={{ py: 8 }}>
        <ErrorState
          error={brandRequest.error}
          title="We do not carry that label"
          onRetry={brandRequest.reload}
        />
        <Button component={Link} to="/labels" sx={{ mt: 2 }}>
          Back to all labels
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: { xs: 6, md: 9 } }}>
      {brandRequest.loading || !brand ? (
        <Skeleton variant="rectangular" sx={{ height: { xs: 180, md: 300 } }} />
      ) : (
        <Box
          sx={{
            position: 'relative',
            height: { xs: 190, md: 320 },
            backgroundImage: `url(${brand.banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(10,8,8,0.88) 0%, rgba(10,8,8,0.35) 55%, rgba(10,8,8,0.1) 100%)',
            },
          }}
        >
          <Container sx={{ position: 'relative', zIndex: 1, pb: { xs: 3, md: 4.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2.5 }}>
              <Avatar
                src={brand.logo}
                variant="rounded"
                sx={{ width: { xs: 56, md: 78 }, height: { xs: 56, md: 78 } }}
              />
              <Box>
                <Typography variant="h2" sx={{ color: '#fff' }}>
                  {brand.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.5 }}>
                  {brand.country} &middot; founded {brand.founded}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      <Container sx={{ pt: { xs: 3.5, md: 5 } }}>
        {brand && (
          <>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
                alignItems: 'start',
              }}
            >
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '72ch' }}>
                {brand.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: { xs: 3, md: 4 }, flexWrap: 'wrap' }}>
                <Stat label="Pieces" value={formatNumber(brand.productCount)} />
                <Stat label="From" value={formatPrice(brand.priceFrom)} />
                <Stat
                  label="Rated"
                  value={<StarRating value={brand.avgRating} showValue size="small" />}
                />
              </Box>
            </Box>

            {brand.featured && (
              <Chip label="A house pick" size="small" color="primary" variant="outlined" sx={{ mt: 2.5 }} />
            )}

            <Divider sx={{ my: { xs: 3.5, md: 4.5 } }} />
          </>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {loading || !result
              ? 'Counting the rail'
              : `${formatNumber(result.total)} pieces from this house`}
          </Typography>
          <SortSelect value={sort} onChange={(value) => setParam('sort', value)} />
        </Box>

        {result?.total === 0 && !loading ? (
          <Alert severity="info" variant="outlined">
            Nothing from this label is in stock right now. It may have been removed in the admin
            console.
          </Alert>
        ) : (
          <ProductGrid products={result?.items ?? []} loading={loading} skeletonCount={12} />
        )}

        {result && result.pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={result.pageCount}
              page={result.page}
              onChange={(_, value) => setParam('page', value)}
              shape="rounded"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
