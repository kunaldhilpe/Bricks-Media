import { Link } from 'react-router-dom';
import { Box, Button, Divider, Skeleton, Typography } from '@mui/material';
import Container from '@/components/common/Container';
import SectionHeading from '@/components/common/SectionHeading';
import ErrorState from '@/components/common/ErrorState';
import CategoryTile from '@/components/shop/CategoryTile';
import ProductRail from '@/components/shop/ProductRail';
import ProductGrid from '@/components/shop/ProductGrid';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getHomeSections } from '@/api/products';
import { useCatalog } from '@/context/CatalogContext';
import { formatNumber } from '@/utils/format';
import { FONT_DISPLAY } from '@/theme/tokens';

/** Hero: the masthead leads, three garments stagger beside it. */
function Hero({ products = [], loading }) {
  const [first, second, third] = products;

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        '@keyframes riseIn': {
          from: { opacity: 0, transform: 'translateY(18px)' },
          to: { opacity: 1, transform: 'none' },
        },
      }}
    >
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 7 },
            alignItems: 'center',
            py: { xs: 6, md: 10 },
          }}
        >
          <Box sx={{ animation: 'riseIn 640ms ease both' }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{ maxWidth: '16ch', textWrap: 'balance' }}
            >
              Clothes worth keeping.
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', mt: 3, maxWidth: '44ch' }}
            >
              Silk, cashmere and handloom from thirty ateliers across Italy, France and India —
              tailored, catalogued and ready to ship from Mumbai.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 4, flexWrap: 'wrap' }}>
              <Button component={Link} to="/shop" variant="contained" size="large">
                Shop the collection
              </Button>
              <Button component={Link} to="/shop?new=1" variant="outlined" size="large">
                See what is new
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(5, 46px)',
              gap: 2,
              animation: 'riseIn 640ms 120ms ease both',
            }}
          >
            {loading ? (
              <>
                <Skeleton variant="rectangular" sx={{ gridArea: '1 / 1 / 5 / 2' }} />
                <Skeleton variant="rectangular" sx={{ gridArea: '2 / 2 / 6 / 3' }} />
              </>
            ) : (
              [
                { product: first, area: '1 / 1 / 5 / 2' },
                { product: second, area: '2 / 2 / 6 / 3' },
              ].map(
                ({ product, area }) =>
                  product && (
                    <Box
                      key={product.id}
                      component={Link}
                      to={`/product/${product.id}`}
                      sx={{
                        gridArea: area,
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        textDecoration: 'none',
                        '&:hover img': { transform: 'scale(1.04)' },
                      }}
                    >
                      <Box
                        component="img"
                        src={product.images?.[0] ?? product.thumbnail}
                        alt={product.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 420ms ease',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 'auto 0 0 0',
                          p: 1.5,
                          background: 'linear-gradient(to top, rgba(12,9,8,0.78), transparent)',
                          color: '#F6F2ED',
                        }}
                      >
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                          {product.brand}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                          {product.name}
                        </Typography>
                      </Box>
                    </Box>
                  ),
              )
            )}
            {third && (
              <Box
                sx={{
                  gridArea: '5 / 1 / 6 / 2',
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  px: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Also in the window: {third.brand}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function HomePage() {
  useDocumentTitle();
  const { data, loading, error, reload } = useAsync(getHomeSections, []);
  const { categories, productCount } = useCatalog();

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <ErrorState error={error} onRetry={reload} title="The collection did not load" />
      </Container>
    );
  }

  return (
    <Box>
      <Hero products={data?.hero ?? []} loading={loading} />

      <Container sx={{ py: { xs: 6, md: 9 } }}>
        <SectionHeading
          title="Shop by category"
          description={`${formatNumber(productCount)} pieces, sorted the way a wardrobe is.`}
        />
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
          }}
        >
          {categories.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </Box>
      </Container>

      <Divider />

      <Container sx={{ py: { xs: 6, md: 9 } }}>
        <SectionHeading
          title="Just arrived"
          description="The newest deliveries, still in their tissue paper."
          actionLabel="See all new arrivals"
          actionTo="/shop?new=1&sort=newest"
        />
        <ProductRail products={data?.newArrivals ?? []} loading={loading} />
      </Container>

      <Box sx={{ bgcolor: 'surface.tint', borderBlock: '1px solid', borderColor: 'divider' }}>
        <Container sx={{ py: { xs: 6, md: 9 } }}>
          <SectionHeading
            title="Reduced by forty percent or more"
            description="End-of-season pieces from the ateliers, while the sizes last."
            actionLabel="See everything reduced"
            actionTo="/shop?sale=1&sort=discount"
          />
          <ProductRail products={data?.onSale ?? []} loading={loading} />
        </Container>
      </Box>

      <Container sx={{ py: { xs: 6, md: 9 } }}>
        <SectionHeading
          title="What everyone is buying"
          description="Ranked by how often these leave the shelf."
          actionLabel="See all best sellers"
          actionTo="/shop?best=1&sort=popular"
        />
        <ProductGrid products={(data?.bestSellers ?? []).slice(0, 8)} loading={loading} skeletonCount={8} />
      </Container>

      <Divider />

      <Container sx={{ py: { xs: 6, md: 9 } }}>
        <SectionHeading
          title="The labels we carry"
          description="Houses we have worked with long enough to know their cut."
          actionLabel="All thirty labels"
          actionTo="/labels"
        />
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
          }}
        >
          {(data?.brands ?? []).slice(0, 10).map((brand) => (
            <Box
              key={brand.id}
              component={Link}
              to={`/label/${brand.slug}`}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                '&:hover': { borderColor: 'text.primary' },
              }}
            >
              <Box
                component="img"
                src={brand.logo}
                alt=""
                loading="lazy"
                sx={{ width: 42, height: 42, objectFit: 'cover' }}
              />
              <Typography variant="subtitle2" sx={{ fontFamily: FONT_DISPLAY, fontSize: '1.05rem' }}>
                {brand.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {brand.country} · since {brand.founded}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
