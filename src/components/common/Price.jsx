import { Box, Typography } from '@mui/material';
import { formatPrice } from '@/utils/format';

/** Final price, struck list price and the saving, in one consistent block. */
export default function Price({
  price,
  finalPrice,
  discountPercent = 0,
  size = 'medium',
  align = 'left',
  showSaving = false,
}) {
  const scale = {
    small: { main: '0.9375rem', sub: '0.8125rem' },
    medium: { main: '1.125rem', sub: '0.875rem' },
    large: { main: '1.75rem', sub: '1rem' },
  }[size];

  const hasDiscount = discountPercent > 0 && price > finalPrice;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      <Typography component="span" sx={{ fontSize: scale.main, fontWeight: 500 }}>
        {formatPrice(finalPrice)}
      </Typography>
      {hasDiscount && (
        <>
          <Typography
            component="span"
            sx={{
              fontSize: scale.sub,
              color: 'text.secondary',
              textDecoration: 'line-through',
            }}
          >
            {formatPrice(price)}
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: scale.sub, color: 'brand.sale', fontWeight: 500 }}
          >
            {discountPercent}% off
          </Typography>
        </>
      )}
      {hasDiscount && showSaving && (
        <Typography component="span" sx={{ fontSize: scale.sub, color: 'text.secondary' }}>
          You save {formatPrice(price - finalPrice)}
        </Typography>
      )}
    </Box>
  );
}
