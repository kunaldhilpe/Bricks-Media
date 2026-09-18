import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Slider,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ColorDot from '@/components/common/ColorDot';
import StarRating from '@/components/common/StarRating';
import { useCatalog } from '@/context/CatalogContext';
import { formatPrice } from '@/utils/format';
import { RATING_FILTERS } from '@/utils/constants';

function Section({ title, defaultExpanded = false, children }) {
  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 52 }}>
        <Typography variant="subtitle2">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.5 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

function CheckList({ options, selected, counts, onToggle, maxVisible = 8, renderPrefix }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, maxVisible);

  return (
    <Box>
      {visible.map((option) => {
        const count = counts?.get(option.value) ?? 0;
        const isSelected = selected.includes(String(option.value));
        return (
          <FormControlLabel
            key={option.value}
            sx={{
              display: 'flex',
              ml: 0,
              mr: 0,
              opacity: count === 0 && !isSelected ? 0.45 : 1,
              '& .MuiFormControlLabel-label': { flexGrow: 1, fontSize: '0.875rem' },
            }}
            control={
              <Checkbox
                size="small"
                checked={isSelected}
                disabled={count === 0 && !isSelected}
                onChange={() => onToggle(option.value)}
                sx={{ py: 0.5 }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {renderPrefix?.(option)}
                <Box component="span" sx={{ flexGrow: 1 }}>
                  {option.label}
                </Box>
                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {count}
                </Box>
              </Box>
            }
          />
        );
      })}
      {options.length > maxVisible && (
        <Button size="small" onClick={() => setExpanded((v) => !v)} sx={{ mt: 0.5, px: 0 }}>
          {expanded ? 'Show fewer' : `Show all ${options.length}`}
        </Button>
      )}
    </Box>
  );
}

/**
 * Faceted filter rail. Counts come from the query engine and are computed
 * "all filters except this one", so ticking a colour does not zero out the
 * remaining colour counts.
 */
export default function FilterPanel({
  filters,
  facets,
  priceRange,
  activeCount,
  onToggle,
  onSetValue,
  onSetPrice,
  onClear,
  showCategory = true,
}) {
  const { categories, brands, vocab } = useCatalog();
  const [brandQuery, setBrandQuery] = useState('');
  const bounds = priceRange ?? [0, 100000];
  const [draftPrice, setDraftPrice] = useState([
    filters.minPrice ?? bounds[0],
    filters.maxPrice ?? bounds[1],
  ]);

  // Keep the slider in step with URL changes (clearing filters, back button).
  const priceKey = `${filters.minPrice}-${filters.maxPrice}-${bounds[0]}-${bounds[1]}`;
  const [lastKey, setLastKey] = useState(priceKey);
  if (lastKey !== priceKey) {
    setLastKey(priceKey);
    setDraftPrice([filters.minPrice ?? bounds[0], filters.maxPrice ?? bounds[1]]);
  }

  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === filters.categorySlug),
    [categories, filters.categorySlug],
  );

  const brandOptions = useMemo(
    () =>
      brands
        .filter((brand) => brand.name.toLowerCase().includes(brandQuery.toLowerCase()))
        .map((brand) => ({ value: brand.id, label: brand.name }))
        .sort(
          (a, b) =>
            (facets?.brands?.get(b.value) ?? 0) - (facets?.brands?.get(a.value) ?? 0) ||
            a.label.localeCompare(b.label),
        ),
    [brands, brandQuery, facets],
  );

  const subcategoryOptions = useMemo(() => {
    const source = activeCategory
      ? activeCategory.subcategories
      : [...new Set(categories.flatMap((category) => category.subcategories))].sort();
    return source.map((sub) => ({ value: sub, label: sub }));
  }, [activeCategory, categories]);

  return (
    <Box component="aside" aria-label="Filters">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
        <Typography variant="subtitle1">
          Filters{activeCount > 0 && ` (${activeCount})`}
        </Typography>
        {activeCount > 0 && (
          <Button size="small" onClick={onClear} color="primary">
            Clear all
          </Button>
        )}
      </Box>

      <Section title="Price" defaultExpanded>
        <Box sx={{ px: 0.5 }}>
          <Slider
            value={draftPrice}
            min={bounds[0]}
            max={bounds[1]}
            step={500}
            onChange={(_, value) => setDraftPrice(value)}
            onChangeCommitted={(_, value) => onSetPrice(value, bounds)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatPrice(value)}
            getAriaLabel={() => 'Price range'}
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatPrice(draftPrice[0])}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatPrice(draftPrice[1])}
            </Typography>
          </Box>
        </Box>
      </Section>

      {showCategory && (
        <Section title="Category" defaultExpanded>
          <CheckList
            options={categories.map((category) => ({ value: category.slug, label: category.name }))}
            selected={filters.categorySlug ? [filters.categorySlug] : []}
            counts={
              new Map(
                categories.map((category) => [
                  category.slug,
                  facets?.categories?.get(category.id) ?? 0,
                ]),
              )
            }
            onToggle={(slug) =>
              onSetValue('category', filters.categorySlug === slug ? null : slug)
            }
            maxVisible={8}
            renderPrefix={(option) => (
              <Box component="span" aria-hidden sx={{ fontSize: '0.95rem' }}>
                {categories.find((c) => c.slug === option.value)?.icon}
              </Box>
            )}
          />
        </Section>
      )}

      <Section title={activeCategory ? `In ${activeCategory.name}` : 'Style'}>
        <CheckList
          options={subcategoryOptions}
          selected={filters.subcategories}
          counts={facets?.subcategories}
          onToggle={(value) => onToggle('sub', value)}
          maxVisible={10}
        />
      </Section>

      <Section title="Label" defaultExpanded>
        <TextField
          value={brandQuery}
          onChange={(event) => setBrandQuery(event.target.value)}
          placeholder="Find a label"
          fullWidth
          sx={{ mb: 1 }}
        />
        <CheckList
          options={brandOptions}
          selected={filters.brandIds.map(String)}
          counts={facets?.brands}
          onToggle={(value) => onToggle('brand', value)}
          maxVisible={8}
        />
      </Section>

      <Section title="Size">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {vocab.sizes.map((size) => {
            const count = facets?.sizes?.get(size) ?? 0;
            const selected = filters.sizes.includes(size);
            return (
              <Box
                key={size}
                component="button"
                type="button"
                disabled={count === 0 && !selected}
                onClick={() => onToggle('size', size)}
                sx={{
                  minWidth: 46,
                  py: 0.85,
                  px: 1,
                  font: 'inherit',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  borderRadius: 0.5,
                  border: '1px solid',
                  borderColor: selected ? 'text.primary' : 'divider',
                  bgcolor: selected ? 'surface.inverse' : 'transparent',
                  color: selected ? 'surface.inverseText' : 'text.primary',
                  '&:disabled': { opacity: 0.35, cursor: 'not-allowed' },
                }}
              >
                {size}
              </Box>
            );
          })}
        </Box>
      </Section>

      <Section title="Colour">
        <CheckList
          options={vocab.colors.map((color) => ({ value: color, label: color }))}
          selected={filters.colors}
          counts={facets?.colors}
          onToggle={(value) => onToggle('color', value)}
          maxVisible={8}
          renderPrefix={(option) => <ColorDot name={option.value} size={14} withTooltip={false} />}
        />
      </Section>

      <Section title="Fabric">
        <CheckList
          options={vocab.materials.map((material) => ({ value: material, label: material }))}
          selected={filters.materials}
          counts={facets?.materials}
          onToggle={(value) => onToggle('material', value)}
          maxVisible={6}
        />
      </Section>

      <Section title="Worn by">
        <CheckList
          options={vocab.genders.map((gender) => ({ value: gender, label: gender }))}
          selected={filters.genders}
          counts={facets?.genders}
          onToggle={(value) => onToggle('gender', value)}
        />
      </Section>

      <Section title="Rating">
        {RATING_FILTERS.map((threshold) => (
          <FormControlLabel
            key={threshold}
            sx={{ display: 'flex', ml: 0 }}
            control={
              <Checkbox
                size="small"
                checked={filters.minRating === threshold}
                onChange={() =>
                  onSetValue('rating', filters.minRating === threshold ? null : threshold)
                }
                sx={{ py: 0.5 }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <StarRating value={threshold} showValue={false} />
                <Typography variant="body2">{threshold} and up</Typography>
              </Box>
            }
          />
        ))}
      </Section>

      <Section title="Occasion">
        <CheckList
          options={vocab.tags.map((tag) => ({
            value: tag,
            label: tag.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
          }))}
          selected={filters.tags}
          counts={facets?.tags}
          onToggle={(value) => onToggle('tag', value)}
          maxVisible={8}
        />
      </Section>

      <Divider sx={{ mt: 1 }} />
      <Box sx={{ pt: 1.5 }}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.onSale}
              onChange={(event) => onSetValue('sale', event.target.checked ? '1' : null)}
            />
          }
          label={<Typography variant="body2">Reduced only</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.inStockOnly}
              onChange={(event) => onSetValue('stock', event.target.checked ? '1' : null)}
            />
          }
          label={<Typography variant="body2">In stock only</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.isNewArrival}
              onChange={(event) => onSetValue('new', event.target.checked ? '1' : null)}
            />
          }
          label={<Typography variant="body2">New arrivals</Typography>}
        />
      </Box>
    </Box>
  );
}
