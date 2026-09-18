import { MenuItem, TextField } from '@mui/material';
import { SORT_OPTIONS } from '@/utils/constants';

export default function SortSelect({ value, onChange, options = SORT_OPTIONS, label = 'Sort by' }) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ minWidth: 186 }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
