import { Box, Card, CardContent, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function StatCard({ label, value, hint, delta, icon: Icon, accent = 'primary' }) {
  const positive = delta != null && delta >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
          {Icon && (
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 32,
                height: 32,
                borderRadius: 0.5,
                bgcolor: `${accent}.main`,
                color: `${accent}.contrastText`,
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </Box>
          )}
        </Box>
        <Typography variant="h4" component="p" sx={{ mt: 1.5 }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
          {delta != null && (
            <>
              {positive ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                sx={{ color: positive ? 'success.main' : 'error.main', fontWeight: 500 }}
              >
                {positive ? '+' : ''}
                {delta}%
              </Typography>
            </>
          )}
          {hint && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {hint}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
