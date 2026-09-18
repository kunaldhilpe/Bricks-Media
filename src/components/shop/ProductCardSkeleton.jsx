import { Box, Skeleton } from '@mui/material';

export default function ProductCardSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '10 / 13' }} />
      <Skeleton width="40%" sx={{ mt: 1.5 }} />
      <Skeleton width="85%" />
      <Skeleton width="55%" />
      <Skeleton width="30%" sx={{ mt: 0.5 }} />
    </Box>
  );
}
