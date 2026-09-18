import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import Container from '@/components/common/Container';
import Price from '@/components/common/Price';
import StarRating from '@/components/common/StarRating';
import ColorDot from '@/components/common/ColorDot';
import SectionHeading from '@/components/common/SectionHeading';
import ErrorState from '@/components/common/ErrorState';
import QuantityStepper from '@/components/shop/QuantityStepper';
import ProductRail from '@/components/shop/ProductRail';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getProductById, getRelatedProducts } from '@/api/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { formatNumber, formatPrice } from '@/utils/format';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

function Gallery({ product, loading }) {
  const [index, setIndex] = useState(0);
  const images = product?.images?.length ? product.images : [product?.thumbnail];

  useEffect(() => setIndex(0), [product?.id]);

  if (loading) {
    return <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '10 / 13' }} />;
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexDirection: { xs: 'row', sm: 'column' },
          flexShrink: 0,
        }}
      >
        {images.map((image, position) => (
          <Box
            key={image}
            component="button"
            type="button"
            onClick={() => setIndex(position)}
            aria-label={`View image ${position + 1}`}
            aria-current={position === index}
            sx={{
              p: 0,
              width: 68,
              height: 88,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: position === index ? 'text.primary' : 'divider',
              bgcolor: 'transparent',
            }}
          >
            <Box
              component="img"
              src={image}
              alt=""
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'surface.tint',
          aspectRatio: '10 / 13',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={images[index]}
          alt={product.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </Box>
    </Box>
  );
}

/** Rating spread, derived from the catalogue's average and review count. */
function RatingBreakdown({ rating, reviewCount }) {
  const spread = useMemo(() => {
    const weights = [5, 4, 3, 2, 1].map((star) => {
      const distance = Math.abs(star - rating);
      return Math.max(0.02, 1 / (1 + distance * distance * 1.6));
    });
    const sum = weights.reduce((total, weight) => total + weight, 0);
    return weights.map((weight, position) => ({
      star: 5 - position,
      share: weight / sum,
    }));
  }, [rating]);

  return (
    <Box sx={{ maxWidth: 380 }}>
      {spread.map((row) => (
        <Box key={row.star} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
          <Typography variant="caption" sx={{ width: 28, color: 'text.secondary' }}>
            {row.star}★
          </Typography>
          <LinearProgress
            variant="determinate"
            value={row.share * 100}
            sx={{
              flexGrow: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: 'surface.sunken',
              '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' },
            }}
          />
          <Typography variant="caption" sx={{ width: 52, color: 'text.secondary' }}>
            {formatNumber(Math.round(row.share * reviewCount))}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const cart = useCart();
  const wishlist = useWishlist();

  const { data: product, loading, error, reload } = useAsync(() => getProductById(id), [id]);
  const { data: related, loading: relatedLoading } = useAsync(
    () => (product ? getRelatedProducts(product) : Promise.resolve([])),
    [product?.id],
    { immediate: Boolean(product) },
  );

  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [tab, setTab] = useState(0);

  useDocumentTitle(product?.name);

  useEffect(() => {
    if (!product) return;
    setSize(null);
    setColor(product.colors?.[0] ?? null);
    setQuantity(1);
    setSizeError(false);
    setTab(0);

    const seen = storage.read(STORAGE_KEYS.recentlyViewed, []);
    storage.write(
      STORAGE_KEYS.recentlyViewed,
      [product.id, ...seen.filter((entry) => entry !== product.id)].slice(0, 12),
    );
  }, [product]);

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <ErrorState error={error} onRetry={reload} title="We could not open that piece" />
        <Button component={Link} to="/shop" sx={{ mt: 3 }}>
          Back to the collection
        </Button>
      </Container>
    );
  }

  const onAdd = (thenCheckout = false) => {
    if (!size) {
      setSizeError(true);
      toast.warn('Choose a size first.');
      return;
    }
    cart.addItem(product, { size, color, quantity });
    setSizeError(false);
    if (thenCheckout) {
      navigate('/checkout');
    } else {
      toast.success(`${product.name} added to your bag.`);
      cart.openDrawer();
    }
  };

  const inWishlist = product ? wishlist.has(product.id) : false;
  const lowStock = product && product.stock > 0 && product.stock <= 8;

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
          gap: { xs: 4, md: 7 },
        }}
      >
        <Gallery product={product} loading={loading} />

        <Box>
          {loading ? (
            <>
              <Skeleton width="30%" />
              <Skeleton width="80%" height={44} />
              <Skeleton width="40%" />
              <Skeleton width="100%" height={120} sx={{ mt: 3 }} />
            </>
          ) : (
            <>
              <Box
                component={Link}
                to={`/shop?brand=${product.brandId}`}
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  letterSpacing: '0.04em',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {product.brand}
              </Box>

              <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 1.5 }}>
                {product.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
                <StarRating value={product.rating} count={product.reviewCount} size="medium" />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {product.sku}
                </Typography>
              </Box>

              <Price
                price={product.price}
                finalPrice={product.finalPrice}
                discountPercent={product.discountPercent}
                size="large"
                showSaving
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.75 }}>
                Inclusive of all taxes
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2.5 }}>
                {product.isNewArrival && <Chip size="small" label="New arrival" variant="outlined" />}
                {product.isBestSeller && <Chip size="small" label="Best seller" variant="outlined" />}
                <Chip size="small" label={product.gender} variant="outlined" />
                <Chip size="small" label={product.material} variant="outlined" />
              </Box>

              <Divider sx={{ my: 3.5 }} />

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                  <Typography variant="subtitle2">Size</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Runs true to fit
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {product.sizes.map((option) => (
                    <Box
                      key={option}
                      component="button"
                      type="button"
                      onClick={() => {
                        setSize(option);
                        setSizeError(false);
                      }}
                      sx={{
                        minWidth: 52,
                        py: 1.15,
                        px: 1.5,
                        font: 'inherit',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        borderRadius: 0.5,
                        border: '1px solid',
                        borderColor: size === option ? 'text.primary' : 'divider',
                        bgcolor: size === option ? 'surface.inverse' : 'transparent',
                        color: size === option ? 'surface.inverseText' : 'text.primary',
                      }}
                    >
                      {option}
                    </Box>
                  ))}
                </Box>
                {sizeError && (
                  <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block' }}>
                    Pick a size to continue.
                  </Typography>
                )}
              </Box>

              {product.colors?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.25 }}>
                    Colour · {color}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {product.colors.map((option) => (
                      <Box
                        key={option}
                        component="button"
                        type="button"
                        onClick={() => setColor(option)}
                        aria-label={option}
                        sx={{
                          p: 0.5,
                          border: 'none',
                          bgcolor: 'transparent',
                          cursor: 'pointer',
                          lineHeight: 0,
                        }}
                      >
                        <ColorDot name={option} size={26} selected={color === option} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Typography variant="subtitle2">Quantity</Typography>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  max={Math.min(8, product.stock || 8)}
                />
              </Box>

              {lowStock && (
                <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
                  Only {product.stock} left in this colourway.
                </Alert>
              )}
              {!product.inStock && (
                <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                  Sold out. Save it to your wishlist and we will note your interest.
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => onAdd(false)}
                  disabled={!product.inStock}
                  sx={{ flexGrow: 1, minWidth: 180 }}
                >
                  Add to bag
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => onAdd(true)}
                  disabled={!product.inStock}
                >
                  Buy it now
                </Button>
                <IconButton
                  onClick={() => {
                    const added = wishlist.toggle(product.id);
                    toast.info(added ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
                  }}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Save for later'}
                  sx={{ border: '1px solid', borderColor: 'divider', width: 52, height: 52 }}
                >
                  {inWishlist ? (
                    <FavoriteIcon sx={{ color: 'primary.main' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                  mt: 4,
                  pt: 3,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {[
                  { icon: LocalShippingOutlinedIcon, label: 'Delivery in 4–6 days' },
                  { icon: AutorenewIcon, label: '14-day returns' },
                  { icon: VerifiedOutlinedIcon, label: 'Sourced from the house' },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                    <item.icon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>

      {product && (
        <Box sx={{ mt: { xs: 6, md: 9 } }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tab label="Description" />
            <Tab label="Fabric and care" />
            <Tab label={`Ratings (${formatNumber(product.reviewCount)})`} />
          </Tabs>

          <Box sx={{ py: 4, maxWidth: '72ch' }}>
            {tab === 0 && (
              <>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3 }}>
                  {product.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag.replace(/-/g, ' ')}
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/shop?tag=${encodeURIComponent(tag)}`}
                      clickable
                    />
                  ))}
                </Box>
              </>
            )}

            {tab === 1 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
                  columnGap: 4,
                  rowGap: 1.5,
                }}
              >
                {[
                  ['Fabric', product.material],
                  ['Colours offered', product.colors.join(', ')],
                  ['Sizes offered', product.sizes.join(', ')],
                  ['Category', `${product.category} · ${product.subcategory}`],
                  ['Worn by', product.gender],
                  ['Care', 'Dry clean only. Store on a padded hanger, away from direct light.'],
                  ['Stock on hand', `${product.stock} pieces`],
                  ['List price', formatPrice(product.price)],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: 'contents' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {label}
                    </Typography>
                    <Typography variant="body2">{value}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {tab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
                  <Box>
                    <Typography variant="h2" component="p">
                      {product.rating.toFixed(1)}
                    </Typography>
                    <StarRating value={product.rating} showValue={false} size="medium" />
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      {formatNumber(product.reviewCount)} ratings
                    </Typography>
                  </Box>
                  <RatingBreakdown rating={product.rating} reviewCount={product.reviewCount} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  The spread is estimated from the overall score; individual reviews are not part of
                  this dataset.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: { xs: 5, md: 8 } }}>
        <SectionHeading
          dense
          title="You may also like"
          description="Close in cut, fabric or price to what you are looking at."
        />
        <ProductRail products={related ?? []} loading={relatedLoading} />
      </Box>
    </Container>
  );
}
