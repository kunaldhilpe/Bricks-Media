import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  InputAdornment,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { listBrands } from '@/api/catalogue';
import { formatNumber, truncate } from '@/utils/format';

function LabelCard({ brand }) {
  return (
    <Card>
      <CardActionArea component={Link} to={`/label/${brand.slug}`} sx={{ height: '100%' }}>
        <Box
          sx={{
            aspectRatio: '16 / 7',
            bgcolor: 'surface.sunken',
            backgroundImage: `url(${brand.banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h5" component="h2">
              {brand.name}
            </Typography>
            {brand.featured && <Chip label="House pick" size="small" color="primary" variant="outlined" />}
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {brand.country} &middot; est. {brand.founded} &middot;{' '}
            {formatNumber(brand.productCount)} pieces
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
            {truncate(brand.description, 130)}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default function LabelsPage() {
  useDocumentTitle('Labels');
  const { data: brands, loading, error, reload } = useAsync(() => listBrands(), []);
  const [term, setTerm] = useState('');
  const [scope, setScope] = useState('all');

  const visible = useMemo(() => {
    const list = brands ?? [];
    const needle = term.trim().toLowerCase();
    return list
      .filter((brand) => (scope === 'featured' ? brand.featured : true))
      .filter(
        (brand) =>
          !needle ||
          brand.name.toLowerCase().includes(needle) ||
          brand.country.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.productCount - a.productCount);
  }, [brands, term, scope]);

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="The labels"
        description="Thirty houses, from Milanese tailoring to handloom ateliers. Every piece in the store belongs to one of them."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Labels' }]}
      />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        <TextField
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by label or country"
          sx={{ minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={scope}
          onChange={(_, next) => next && setScope(next)}
        >
          <ToggleButton value="all">All labels</ToggleButton>
          <ToggleButton value="featured">House picks</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <ErrorState error={error} onRetry={reload} />}

      {loading && (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={280} />
          ))}
        </Box>
      )}

      {!loading && !error && visible.length === 0 && (
        <EmptyState
          title="No label matches that"
          description="Try a shorter search, or clear it to see all thirty houses."
          actionLabel="Clear search"
          onAction={() => {
            setTerm('');
            setScope('all');
          }}
        />
      )}

      {!loading && visible.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {visible.map((brand) => (
            <LabelCard key={brand.id} brand={brand} />
          ))}
        </Box>
      )}
    </Container>
  );
}
