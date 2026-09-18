import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function TableToolbar({
  searchValue,
  onSearch,
  placeholder = 'Search',
  resultLabel,
  children,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        flexWrap: 'wrap',
        px: 2,
        py: 1.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <TextField
        value={searchValue}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={placeholder}
        sx={{ minWidth: 240 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      {children}
      <Box sx={{ flexGrow: 1 }} />
      {resultLabel && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {resultLabel}
        </Typography>
      )}
    </Box>
  );
}
