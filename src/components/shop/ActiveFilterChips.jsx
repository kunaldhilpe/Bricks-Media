import { Box, Button, Chip } from '@mui/material';
import { useCatalog } from '@/context/CatalogContext';
import { formatPrice } from '@/utils/format';

/** The applied filters, each removable, so nothing is hidden behind a panel. */
export default function ActiveFilterChips({ filters, priceRange, onRemove, onClear, activeCount }) {
  const { brandName } = useCatalog();
  if (!activeCount) return null;

  const chips = [];
  filters.subcategories.forEach((value) => chips.push({ key: 'sub', value, label: value }));
  filters.brandIds.forEach((value) =>
    chips.push({ key: 'brand', value, label: brandName(value) || `Label ${value}` }),
  );
  filters.colors.forEach((value) => chips.push({ key: 'color', value, label: value }));
  filters.sizes.forEach((value) => chips.push({ key: 'size', value, label: `Size ${value}` }));
  filters.materials.forEach((value) => chips.push({ key: 'material', value, label: value }));
  filters.genders.forEach((value) => chips.push({ key: 'gender', value, label: value }));
  filters.tags.forEach((value) =>
    chips.push({ key: 'tag', value, label: value.replace(/-/g, ' ') }),
  );

  if (filters.minPrice != null || filters.maxPrice != null) {
    chips.push({
      key: 'min',
      value: null,
      label: `${formatPrice(filters.minPrice ?? priceRange[0])} – ${formatPrice(
        filters.maxPrice ?? priceRange[1],
      )}`,
      onDelete: () => {
        onRemove('min', null);
        onRemove('max', null);
      },
    });
  }
  if (filters.minRating) {
    chips.push({ key: 'rating', value: null, label: `${filters.minRating}★ and up` });
  }
  if (filters.onSale) chips.push({ key: 'sale', value: null, label: 'Reduced' });
  if (filters.inStockOnly) chips.push({ key: 'stock', value: null, label: 'In stock' });
  if (filters.isNewArrival) chips.push({ key: 'new', value: null, label: 'New arrivals' });

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2.5 }}>
      {chips.map((chip) => (
        <Chip
          key={`${chip.key}-${chip.value ?? chip.label}`}
          label={chip.label}
          size="small"
          variant="outlined"
          onDelete={chip.onDelete ?? (() => onRemove(chip.key, chip.value))}
        />
      ))}
      <Button size="small" onClick={onClear}>
        Clear all
      </Button>
    </Box>
  );
}
