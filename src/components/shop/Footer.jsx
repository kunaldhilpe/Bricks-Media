import { Link } from 'react-router-dom';
import { Box, Divider, Typography } from '@mui/material';
import Logo from '@/components/common/Logo';
import Container from '@/components/common/Container';
import { useCatalog } from '@/context/CatalogContext';
import { formatNumber } from '@/utils/format';

const columns = [
  {
    heading: 'Shop',
    links: [
      { label: 'All pieces', to: '/shop' },
      { label: 'New arrivals', to: '/shop?new=1' },
      { label: 'Reduced', to: '/shop?sale=1&sort=discount' },
      { label: 'Best sellers', to: '/shop?best=1&sort=popular' },
      { label: 'Labels', to: '/labels' },
    ],
  },
  {
    heading: 'Your account',
    links: [
      { label: 'Orders', to: '/orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Profile', to: '/profile' },
      { label: 'Sign in', to: '/login' },
    ],
  },
];

export default function Footer() {
  const { categories, productCount } = useCatalog();

  return (
    <Box
      component="footer"
      sx={{ mt: 10, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'surface.tint' }}
    >
      <Container>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, md: 6 },
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.4fr 1fr 1fr 1fr' },
            py: { xs: 5, md: 7 },
          }}
        >
          <Box>
            <Logo showTagline />
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2.5, maxWidth: '34ch' }}>
              {formatNumber(productCount)} pieces from thirty ateliers, held in Mumbai and shipped
              across India.
            </Typography>
          </Box>

          {columns.map((column) => (
            <Box key={column.heading}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                {column.heading}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {column.links.map((link) => (
                  <Box
                    key={link.label}
                    component={Link}
                    to={link.to}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    {link.label}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {categories.map((category) => (
                <Box
                  key={category.id}
                  component={Link}
                  to={`/category/${category.slug}`}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {category.name}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider />
        <Box
          sx={{
            py: 3,
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            A demonstration storefront. No payment is taken and no data leaves your browser.
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Built with React, Vite and Material UI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
