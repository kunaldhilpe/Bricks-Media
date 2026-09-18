import { Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function QuantityStepper({ value, onChange, min = 1, max = 8, size = 'medium' }) {
  const dimension = size === 'small' ? 30 : 38;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0.5,
      }}
    >
      <IconButton
        size="small"
        aria-label="Reduce quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        sx={{ width: dimension, height: dimension, borderRadius: 0 }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography
        component="span"
        aria-live="polite"
        sx={{ minWidth: 34, textAlign: 'center', fontWeight: 500, fontSize: '0.9375rem' }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        sx={{ width: dimension, height: dimension, borderRadius: 0 }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
