import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function PageHeader({ title, description, crumbs = [], action, children }) {
  return (
    <Box sx={{ mb: 4 }}>
      {crumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1.5, fontSize: '0.8125rem' }}>
          {crumbs.map((crumb, index) =>
            crumb.to && index < crumbs.length - 1 ? (
              <MuiLink key={crumb.label} component={Link} to={crumb.to} color="text.secondary">
                {crumb.label}
              </MuiLink>
            ) : (
              <Typography key={crumb.label} sx={{ fontSize: 'inherit', color: 'text.primary' }}>
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ maxWidth: '64ch' }}>
          <Typography variant="h3" component="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.25 }}>
              {description}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}
