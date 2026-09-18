import { Box } from '@mui/material';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

/**
 * CSS grid rather than MUI Grid: fewer wrappers, and the column count follows
 * the available width instead of fixed breakpoints.
 */
export default function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 12,
  minColumnWidth = 230,
  compact = false,
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, sm: 2.5, md: 3.5 },
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
        },
      }}
    >
      {loading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))
        : products.map((product) => (
            <ProductCard key={product.id} product={product} compact={compact} />
          ))}
    </Box>
  );
}
