import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

/**
 * Sparkline-style area chart for daily revenue. Drawn as an inline SVG so it
 * inherits the theme and needs no chart dependency.
 */
export default function TrendChart({ data = [], valueKey = 'revenue', formatter = (v) => v, height = 200 }) {
  const theme = useTheme();
  const [active, setActive] = useState(null);

  const values = data.map((point) => point[valueKey] ?? 0);
  const max = Math.max(1, ...values);
  const width = 640;
  const padding = { top: 12, right: 8, bottom: 22, left: 8 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const pointAt = (index, value) => {
    const x =
      padding.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
    const y = padding.top + plotHeight - (value / max) * plotHeight;
    return [x, y];
  };

  const linePath = values
    .map((value, index) => {
      const [x, y] = pointAt(index, value);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPath = values.length
    ? `${linePath} L${(padding.left + plotWidth).toFixed(1)},${(padding.top + plotHeight).toFixed(
        1,
      )} L${padding.left},${(padding.top + plotHeight).toFixed(1)} Z`
    : '';

  const hasData = values.some((value) => value > 0);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Revenue over time"
        sx={{ width: '100%', height, display: 'block', overflow: 'visible' }}
      >
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            x2={padding.left + plotWidth}
            y1={padding.top + plotHeight - ratio * plotHeight}
            y2={padding.top + plotHeight - ratio * plotHeight}
            stroke={theme.palette.divider}
            strokeDasharray="3 4"
          />
        ))}

        {hasData && (
          <>
            <path d={areaPath} fill={theme.palette.primary.main} opacity={0.12} />
            <path
              d={linePath}
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </>
        )}

        {data.map((point, index) => {
          const [x, y] = pointAt(index, point[valueKey] ?? 0);
          return (
            <g key={point.date}>
              <circle
                cx={x}
                cy={y}
                r={active === index ? 4.5 : 0}
                fill={theme.palette.primary.main}
              />
              <rect
                x={x - plotWidth / Math.max(1, data.length) / 2}
                y={padding.top}
                width={plotWidth / Math.max(1, data.length)}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
              />
            </g>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {data[0]?.label}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {data[data.length - 1]?.label}
        </Typography>
      </Box>

      {active != null && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            px: 1.25,
            py: 0.75,
            bgcolor: 'surface.inverse',
            color: 'surface.inverseText',
            borderRadius: 0.5,
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
            {formatter(data[active][valueKey])}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {data[active].label}
          </Typography>
        </Box>
      )}

      {!hasData && (
        <Typography
          variant="body2"
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            color: 'text.secondary',
          }}
        >
          No orders in this window yet.
        </Typography>
      )}
    </Box>
  );
}
