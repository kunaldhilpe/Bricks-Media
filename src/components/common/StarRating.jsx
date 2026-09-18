import { Box, Rating, Typography } from '@mui/material';
import { formatNumber } from '@/utils/format';

export default function StarRating({ value = 0, count, size = 'small', showValue = true }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Rating
        value={Number(value)}
        precision={0.1}
        size={size}
        readOnly
        sx={{ color: 'secondary.main' }}
      />
      {showValue && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {Number(value).toFixed(1)}
          {count != null && ` (${formatNumber(count)})`}
        </Typography>
      )}
    </Box>
  );
}
