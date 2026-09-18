import { useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

/** Horizontal rail used on the home page and product detail page. */
export default function ProductRail({ products = [], loading = false, itemWidth = 236 }) {
  const trackRef = useRef(null);

  const scrollBy = (direction) => {
    trackRef.current?.scrollBy({ left: direction * itemWidth * 2, behavior: 'smooth' });
  };

  const arrowStyles = {
    position: 'absolute',
    top: '38%',
    zIndex: 2,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    display: { xs: 'none', md: 'inline-flex' },
    '&:hover': { bgcolor: 'background.paper' },
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        sx={{ ...arrowStyles, left: -18 }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Box
        ref={trackRef}
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: { xs: '60%', sm: '38%', md: `${itemWidth}px` },
          gap: { xs: 2, md: 3 },
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pb: 1,
          '& > *': { scrollSnapAlign: 'start' },
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          : products.map((product) => <ProductCard key={product.id} product={product} compact />)}
      </Box>

      <IconButton
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        sx={{ ...arrowStyles, right: -18 }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
