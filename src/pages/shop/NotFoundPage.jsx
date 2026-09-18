import { Link, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import Container from '@/components/common/Container';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useCatalog } from '@/context/CatalogContext';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const { categories } = useCatalog();
  useDocumentTitle('Page not found');

  return (
    <Container sx={{ py: { xs: 8, md: 14 } }}>
      <Box sx={{ maxWidth: '58ch' }}>
        <Typography variant="h1" sx={{ lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h4" component="p" sx={{ mt: 2 }}>
          There is no rail at this address.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2 }}>
          <Box component="code" sx={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
            {pathname}
          </Box>{' '}
          does not match anything in the store. The piece may have been removed, or the link may
          have been mistyped.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 4, flexWrap: 'wrap' }}>
          <Button component={Link} to="/" variant="contained">
            Back to the storefront
          </Button>
          <Button component={Link} to="/shop" variant="outlined">
            Browse everything
          </Button>
        </Box>

        {categories.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Or start from a category
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  component={Link}
                  to={`/category/${category.slug}`}
                  size="small"
                  color="inherit"
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}
