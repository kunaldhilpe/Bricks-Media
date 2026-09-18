import { Box, Typography, useTheme } from '@mui/material';

/** Share-of-total donut, used for the men/women/unisex split. */
export default function DonutChart({ data = [], size = 168, thickness = 22 }) {
  const theme = useTheme();
  const total = data.reduce((sum, entry) => sum + entry.count, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const palette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.text.secondary,
    theme.palette.warning.main,
  ];

  let offset = 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      <Box component="svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.palette.surface.sunken}
            strokeWidth={thickness}
          />
          {data.map((entry, index) => {
            const length = (entry.count / total) * circumference;
            const circle = (
              <circle
                key={entry.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={palette[index % palette.length]}
                strokeWidth={thickness}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
        </g>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {data.map((entry, index) => (
          <Box key={entry.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: palette[index % palette.length],
              }}
            />
            <Typography variant="body2">{entry.label}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {Math.round((entry.count / total) * 100)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
