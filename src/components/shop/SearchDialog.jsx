import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  Divider,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Price from '@/components/common/Price';
import useDebounce from '@/hooks/useDebounce';
import { suggest } from '@/api/products';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

/** Typeahead across products, labels and categories. */
export default function SearchDialog({ open, onClose }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(term, 250);
  const history = useMemo(() => storage.read(STORAGE_KEYS.searchHistory, []), [open]);

  useEffect(() => {
    if (!open) {
      setTerm('');
      setResults(null);
      return;
    }
    let cancelled = false;
    if (debounced.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    suggest(debounced)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // eslint-disable-next-line consistent-return
    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  const go = (path, keyword) => {
    if (keyword) {
      const next = [keyword, ...history.filter((entry) => entry !== keyword)].slice(0, 6);
      storage.write(STORAGE_KEYS.searchHistory, next);
    }
    onClose();
    navigate(path);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (term.trim()) go(`/shop?q=${encodeURIComponent(term.trim())}`, term.trim());
  };

  const nothingFound =
    results &&
    !results.products.length &&
    !results.brands.length &&
    !results.categories.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { variant: 'outlined', sx: { mt: { xs: 0, sm: -12 } } } }}
    >
      <Box component="form" onSubmit={onSubmit} sx={{ p: 2 }}>
        <TextField
          autoFocus
          fullWidth
          size="medium"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search for a piece, a label or a fabric"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {!results && history.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Recent searches
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {history.map((entry) => (
              <Chip
                key={entry}
                label={entry}
                size="small"
                variant="outlined"
                onClick={() => go(`/shop?q=${encodeURIComponent(entry)}`, entry)}
              />
            ))}
          </Box>
        </Box>
      )}

      {nothingFound && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nothing matches “{debounced}”. Try a fabric like silk, a label name, or a category such
            as ethnic.
          </Typography>
        </Box>
      )}

      {results && !nothingFound && (
        <>
          <Divider />
          <List dense sx={{ maxHeight: 420, overflowY: 'auto', py: 0 }}>
            {results.categories.map((category) => (
              <ListItemButton
                key={`c-${category.id}`}
                onClick={() => go(`/category/${category.slug}`, category.name)}
              >
                <Box component="span" aria-hidden sx={{ mr: 1.5 }}>
                  {category.icon}
                </Box>
                <ListItemText primary={category.name} secondary="Category" />
              </ListItemButton>
            ))}
            {results.brands.map((brand) => (
              <ListItemButton
                key={`b-${brand.id}`}
                onClick={() => go(`/label/${brand.slug}`, brand.name)}
              >
                <Box
                  component="img"
                  src={brand.logo}
                  alt=""
                  sx={{ width: 26, height: 26, mr: 1.5, objectFit: 'cover' }}
                />
                <ListItemText primary={brand.name} secondary={`Label · ${brand.country}`} />
              </ListItemButton>
            ))}
            {results.products.map((product) => (
              <ListItemButton
                key={`p-${product.id}`}
                onClick={() => go(`/product/${product.id}`, product.name)}
              >
                <Box
                  component="img"
                  src={product.thumbnail}
                  alt=""
                  loading="lazy"
                  sx={{ width: 34, height: 44, mr: 1.5, objectFit: 'cover' }}
                />
                <ListItemText
                  primary={product.name}
                  secondary={`${product.brand} · ${product.subcategory}`}
                />
                <Price
                  price={product.price}
                  finalPrice={product.finalPrice}
                  discountPercent={0}
                  size="small"
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <ListItemButton onClick={onSubmit} sx={{ py: 1.5 }}>
            <ListItemText
              primary={`See every result for “${term}”`}
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
          </ListItemButton>
        </>
      )}
    </Dialog>
  );
}
