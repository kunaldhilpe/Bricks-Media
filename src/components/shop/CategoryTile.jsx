import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

/** Category entry point: image, name, and the styles inside it. */
export default function CategoryTile({ category, count, tall = false }) {
  return (
    <Box
      component={Link}
      to={`/category/${category.slug}`}
      sx={{
        position: 'relative',
        display: 'block',
        textDecoration: 'none',
        color: 'surface.inverseText',
        overflow: 'hidden',
        aspectRatio: tall ? '3 / 4' : '4 / 3',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover .tile-image': { transform: 'scale(1.03)' },
      }}
    >
      <Box
        className="tile-image"
        component="img"
        src={category.image}
        alt=""
        loading="lazy"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 320ms ease',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(12,9,8,0.82) 0%, rgba(12,9,8,0.1) 55%)',
        }}
      />
      <Box sx={{ position: 'absolute', inset: 'auto 0 0 0', p: 2.5, color: '#F6F2ED' }}>
        <Typography variant="h5" component="h3">
          {category.name}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.82, display: 'block', mt: 0.5 }}>
          {category.subcategories.slice(0, 3).join(' · ')}
          {count != null && ` · ${count} pieces`}
        </Typography>
      </Box>
    </Box>
  );
}
