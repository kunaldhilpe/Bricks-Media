import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Price from '@/components/common/Price';
import StarRating from '@/components/common/StarRating';
import ColorDot from '@/components/common/ColorDot';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';

/**
 * Catalogue tile. Hovering swaps to the second shot — the way a boutique lets
 * you turn a garment over — and reveals the add-to-bag control.
 */
export default function ProductCard({ product, compact = false }) {
  const [hovered, setHovered] = useState(false);
  const { addItem, openDrawer } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();

  const alternate = product.images?.[1] ?? product.thumbnail;
  const inWishlist = wishlist.has(product.id);

  const onWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const added = wishlist.toggle(product.id);
    toast.info(added ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
  };

  const onQuickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(product, { quantity: 1 });
    toast.success(`${product.name} added to your bag.`);
    openDrawer();
  };

  return (
    <Box
      component={Link}
      to={`/product/${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        '&:focus-visible': { outlineOffset: 4 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '10 / 13',
          overflow: 'hidden',
          bgcolor: 'surface.tint',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          component="img"
          src={hovered ? alternate : product.thumbnail}
          alt={product.name}
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: product.inStock ? 'none' : 'grayscale(1) opacity(0.55)',
          }}
        />

        <Stack spacing={0.5} sx={{ position: 'absolute', top: 10, left: 10, alignItems: 'flex-start' }}>
          {product.discountPercent >= 30 && (
            <Chip
              size="small"
              label={`${product.discountPercent}% off`}
              sx={{
                bgcolor: 'brand.sale',
                color: 'primary.contrastText',
                borderRadius: 0.5,
              }}
            />
          )}
          {product.isNewArrival && (
            <Chip
              size="small"
              label="Just in"
              sx={{ bgcolor: 'background.paper', borderRadius: 0.5 }}
            />
          )}
          {!product.inStock && (
            <Chip
              size="small"
              label="Sold out"
              sx={{ bgcolor: 'surface.inverse', color: 'surface.inverseText', borderRadius: 0.5 }}
            />
          )}
        </Stack>

        <Tooltip title={inWishlist ? 'Remove from wishlist' : 'Save for later'}>
          <IconButton
            onClick={onWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Save for later'}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            {inWishlist ? (
              <FavoriteIcon fontSize="small" sx={{ color: 'primary.main' }} />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {product.inStock && (
          <Box
            sx={{
              position: 'absolute',
              inset: 'auto 0 0 0',
              p: 1,
              display: 'flex',
              justifyContent: 'center',
              transform: hovered ? 'translateY(0)' : 'translateY(120%)',
              transition: 'transform 180ms ease',
              '@media (hover: none)': { transform: 'translateY(0)' },
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={onQuickAdd}
              sx={{
                appearance: 'none',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                color: 'text.primary',
                font: 'inherit',
                fontSize: '0.8125rem',
                fontWeight: 500,
                px: 2,
                py: 0.85,
                borderRadius: 0.5,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                '&:hover': { bgcolor: 'surface.inverse', color: 'surface.inverseText' },
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 16 }} />
              Add to bag
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ pt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: '0.04em' }}>
          {product.brand}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 400,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.8em',
          }}
        >
          {product.name}
        </Typography>

        {!compact && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
            <StarRating value={product.rating} count={product.reviewCount} />
          </Box>
        )}

        <Box sx={{ mt: 'auto', pt: 0.75 }}>
          <Price
            price={product.price}
            finalPrice={product.finalPrice}
            discountPercent={product.discountPercent}
            size="small"
          />
        </Box>

        {!compact && product.colors?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, alignItems: 'center' }}>
            {product.colors.slice(0, 4).map((color) => (
              <ColorDot key={color} name={color} size={12} />
            ))}
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.25 }}>
              {product.material}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
