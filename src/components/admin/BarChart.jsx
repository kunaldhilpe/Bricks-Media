import { Box, Typography, useTheme } from '@mui/material';

/**
 * Horizontal bar chart drawn as plain DOM. No charting library: the shapes are
 * simple, and this keeps the bundle and the dependency list honest.
 */
export default function BarChart({ data = [], valueFormatter = (v) => v, height = 'auto', color }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((entry) => entry.value));
  const barColor = color ?? theme.palette.primary.main;

  if (data.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Nothing to plot yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height }}>
      {data.map((entry) => (
        <Box key={entry.label}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {entry.label}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {valueFormatter(entry.value)}
            </Typography>
          </Box>
          <Box
            sx={{
              height: 8,
              bgcolor: 'surface.sunken',
              borderRadius: 0.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${(entry.value / max) * 100}%`,
                bgcolor: entry.color ?? barColor,
                minWidth: entry.value > 0 ? 2 : 0,
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
