import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import ErrorState from '@/components/common/ErrorState';
import ColorDot from '@/components/common/ColorDot';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { createProduct, getProductById, updateProduct } from '@/api/products';
import { GENDERS } from '@/utils/constants';
import { formatPrice } from '@/utils/format';

const EMPTY = {
  name: '',
  brandId: '',
  categoryId: '',
  subcategory: '',
  price: '',
  discountPercent: '0',
  stock: '10',
  material: '',
  gender: 'Unisex',
  description: '',
  colors: [],
  sizes: [],
  tags: [],
  isFeatured: false,
};

/** Chip row used for colours, sizes and tags: tap to include or drop. */
function ChipPicker({ label, options, selected, onToggle, renderIcon, error, helper }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <Chip
              key={option}
              label={option}
              icon={renderIcon ? renderIcon(option) : undefined}
              onClick={() => onToggle(option)}
              variant={active ? 'filled' : 'outlined'}
              color={active ? 'primary' : 'default'}
              size="small"
            />
          );
        })}
      </Box>
      <Typography
        variant="caption"
        sx={{ display: 'block', mt: 1, color: error ? 'error.main' : 'text.secondary' }}
      >
        {error ?? helper}
      </Typography>
    </Box>
  );
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { categories, brands, vocab } = useCatalog();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState(null);

  useDocumentTitle(isEdit ? 'Edit a piece · Console' : 'New piece · Console');

  useEffect(() => {
    if (!isEdit) return;
    let live = true;
    setLoading(true);
    getProductById(id)
      .then((product) => {
        if (!live) return;
        setOriginal(product);
        setForm({
          name: product.name,
          brandId: String(product.brandId),
          categoryId: String(product.categoryId),
          subcategory: product.subcategory ?? '',
          price: String(product.price),
          discountPercent: String(product.discountPercent ?? 0),
          stock: String(product.stock ?? 0),
          material: product.material ?? '',
          gender: product.gender ?? 'Unisex',
          description: product.description ?? '',
          colors: product.colors ?? [],
          sizes: product.sizes ?? [],
          tags: product.tags ?? [],
          isFeatured: Boolean(product.isFeatured),
        });
        setLoading(false);
      })
      .catch((caught) => {
        if (!live) return;
        setLoadError(caught);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id, isEdit]);

  const category = categories.find((entry) => String(entry.id) === form.categoryId);
  const subcategories = category?.subcategories ?? [];

  const preview = useMemo(() => {
    const price = Number(form.price) || 0;
    const discount = Number(form.discountPercent) || 0;
    return {
      price,
      discount,
      finalPrice: Math.round(price * (1 - discount / 100)),
    };
  }, [form.price, form.discountPercent]);

  const setField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'categoryId' ? { subcategory: '' } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleIn = (field) => (option) =>
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(option)
        ? current[field].filter((entry) => entry !== option)
        : [...current[field], option],
    }));

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 4) {
      next.name = 'Give the piece a name of at least four characters.';
    }
    if (!form.brandId) next.brandId = 'Every piece belongs to a label.';
    if (!form.categoryId) next.categoryId = 'Pick the category it sits in.';
    if (!Number(form.price) || Number(form.price) < 100) {
      next.price = 'Enter a list price of ₹100 or more.';
    }
    const discount = Number(form.discountPercent);
    if (Number.isNaN(discount) || discount < 0 || discount > 90) {
      next.discountPercent = 'Discount has to be between 0 and 90.';
    }
    const stock = Number(form.stock);
    if (Number.isNaN(stock) || stock < 0) next.stock = 'Stock cannot be negative.';
    if (form.colors.length === 0) next.colors = 'Pick at least one colourway.';
    if (form.sizes.length === 0) next.sizes = 'Pick at least one size.';
    if (form.description.trim().length < 20) {
      next.description = 'Write at least a line about the piece (20 characters).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error('Some fields still need attention.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      brandId: Number(form.brandId),
      brand: brands.find((entry) => String(entry.id) === form.brandId)?.name,
      categoryId: Number(form.categoryId),
      category: category?.name,
      subcategory: form.subcategory || subcategories[0] || 'Everyday',
      price: Number(form.price),
      discountPercent: Number(form.discountPercent),
      stock: Number(form.stock),
      material: form.material || 'Pure Silk',
      gender: form.gender,
      description: form.description.trim(),
      colors: form.colors,
      sizes: form.sizes,
      tags: form.tags,
      isFeatured: form.isFeatured,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(id, payload);
        toast.success('Changes saved to this browser.');
      } else {
        const created = await createProduct(payload);
        toast.success(`${created.name} added with SKU ${created.sku}.`);
      }
      navigate('/admin/products');
    } catch (caught) {
      toast.error(caught.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <Box>
        <PageHeader title="Edit a piece" />
        <ErrorState error={loadError} title="That piece could not be loaded" />
        <Button component={Link} to="/admin/products" sx={{ mt: 2 }}>
          Back to products
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit a piece' : 'Add a piece'}
        description={
          isEdit
            ? 'Changes are stored as an overlay in this browser. The shipped products.json is never rewritten.'
            : 'New pieces appear at the top of the catalogue and get placeholder imagery from picsum.photos.'
        }
        crumbs={[
          { label: 'Console', to: '/admin' },
          { label: 'Products', to: '/admin/products' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
        action={
          <Button
            component={Link}
            to="/admin/products"
            startIcon={<ArrowBackIcon sx={{ fontSize: 17 }} />}
            color="inherit"
          >
            Back
          </Button>
        }
      />

      {loading ? (
        <Skeleton variant="rectangular" height={520} />
      ) : (
        <Box
          component="form"
          onSubmit={submit}
          noValidate
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' },
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: 'grid', gap: 2.5 }}>
                <Typography variant="h6" component="h2">
                  The piece
                </Typography>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={setField('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  size="medium"
                  fullWidth
                />
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2.5,
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  }}
                >
                  <TextField
                    select
                    label="Label"
                    value={form.brandId}
                    onChange={setField('brandId')}
                    error={Boolean(errors.brandId)}
                    helperText={errors.brandId}
                    size="medium"
                  >
                    {brands.map((entry) => (
                      <MenuItem key={entry.id} value={String(entry.id)}>
                        {entry.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Worn by"
                    value={form.gender}
                    onChange={setField('gender')}
                    size="medium"
                  >
                    {GENDERS.map((entry) => (
                      <MenuItem key={entry} value={entry}>
                        {entry}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Category"
                    value={form.categoryId}
                    onChange={setField('categoryId')}
                    error={Boolean(errors.categoryId)}
                    helperText={errors.categoryId}
                    size="medium"
                  >
                    {categories.map((entry) => (
                      <MenuItem key={entry.id} value={String(entry.id)}>
                        {entry.icon} {entry.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Subcategory"
                    value={form.subcategory}
                    onChange={setField('subcategory')}
                    disabled={subcategories.length === 0}
                    helperText={
                      subcategories.length === 0 ? 'Pick a category first' : undefined
                    }
                    size="medium"
                  >
                    {subcategories.map((entry) => (
                      <MenuItem key={entry} value={entry}>
                        {entry}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <TextField
                  select
                  label="Fabric"
                  value={form.material}
                  onChange={setField('material')}
                  size="medium"
                  fullWidth
                >
                  {vocab.materials.map((entry) => (
                    <MenuItem key={entry} value={entry}>
                      {entry}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Description"
                  value={form.description}
                  onChange={setField('description')}
                  error={Boolean(errors.description)}
                  helperText={
                    errors.description ?? `${form.description.trim().length} characters`
                  }
                  multiline
                  minRows={4}
                  size="medium"
                  fullWidth
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: 'grid', gap: 3 }}>
                <Typography variant="h6" component="h2">
                  Options
                </Typography>
                <ChipPicker
                  label="Colourways"
                  options={vocab.colors}
                  selected={form.colors}
                  onToggle={toggleIn('colors')}
                  error={errors.colors}
                  helper="These become the swatches on the product page."
                  renderIcon={(option) => <ColorDot name={option} size={12} withTooltip={false} />}
                />
                <Divider />
                <ChipPicker
                  label="Sizes"
                  options={vocab.sizes}
                  selected={form.sizes}
                  onToggle={toggleIn('sizes')}
                  error={errors.sizes}
                  helper="Letter sizes for clothing, numbers for footwear."
                />
                <Divider />
                <ChipPicker
                  label="Occasion tags"
                  options={vocab.tags}
                  selected={form.tags}
                  onToggle={toggleIn('tags')}
                  helper="Optional. Tags drive the occasion filter on the listing page."
                />
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: 'grid', gap: 2.5, position: { lg: 'sticky' }, top: { lg: 24 } }}>
            <Card>
              <CardContent sx={{ p: 2.5, display: 'grid', gap: 2.5 }}>
                <Typography variant="h6" component="h2">
                  Price and stock
                </Typography>
                <TextField
                  label="List price"
                  value={form.price}
                  onChange={setField('price')}
                  error={Boolean(errors.price)}
                  helperText={errors.price}
                  inputMode="numeric"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  size="medium"
                />
                <TextField
                  label="Discount"
                  value={form.discountPercent}
                  onChange={setField('discountPercent')}
                  error={Boolean(errors.discountPercent)}
                  helperText={errors.discountPercent}
                  inputMode="numeric"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  size="medium"
                />
                <TextField
                  label="Units in stock"
                  value={form.stock}
                  onChange={setField('stock')}
                  error={Boolean(errors.stock)}
                  helperText={
                    errors.stock ??
                    (Number(form.stock) === 0
                      ? 'Zero marks the piece sold out on the storefront.'
                      : undefined)
                  }
                  inputMode="numeric"
                  size="medium"
                />

                <Box sx={{ bgcolor: 'surface.tint', p: 2, borderRadius: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Customers will see
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.5 }}>
                    {formatPrice(preview.finalPrice)}
                  </Typography>
                  {preview.discount > 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      down from {formatPrice(preview.price)}, saving{' '}
                      {formatPrice(preview.price - preview.finalPrice)}
                    </Typography>
                  )}
                </Box>

                <FormControlLabel
                  control={<Switch checked={form.isFeatured} onChange={setField('isFeatured')} />}
                  label="Feature on the home page"
                />
              </CardContent>
            </Card>

            {isEdit && original && (
              <Alert severity="info" variant="outlined">
                SKU {original.sku} &middot; id {original.id}. Imagery and review history come from
                the shipped data and are not editable here.
              </Alert>
            )}

            <Button type="submit" variant="contained" size="large" disabled={saving}>
              {saving ? 'Saving' : isEdit ? 'Save changes' : 'Add to the catalogue'}
            </Button>
            <Button component={Link} to="/admin/products" color="inherit">
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
