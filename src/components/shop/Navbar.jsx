import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Popper,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Logo from '@/components/common/Logo';
import Container from '@/components/common/Container';
import SearchDialog from './SearchDialog';
import { useColorMode } from '@/context/ColorModeContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import { initials } from '@/utils/format';
import { layout } from '@/theme/tokens';

const navLinkStyles = ({ isActive }) => ({
  textDecoration: 'none',
  color: 'inherit',
  fontSize: '0.875rem',
  paddingBottom: 4,
  borderBottom: isActive ? '1px solid currentColor' : '1px solid transparent',
});

export default function Navbar() {
  const navigate = useNavigate();
  const { mode, toggleMode } = useColorMode();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const { categories } = useCatalog();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [hovered, setHovered] = useState({ anchor: null, category: null });

  const condensed = useScrollTrigger({ threshold: 90, disableHysteresis: true });

  const closeAccount = () => setAccountAnchor(null);

  const onSignOut = () => {
    closeAccount();
    signOut();
    navigate('/');
  };

  const megaMenu = hovered.category && hovered.category.subcategories?.length > 0;

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'saturate(180%) blur(8px)',
        }}
      >
        <Container>
          <Toolbar
            disableGutters
            sx={{
              minHeight: condensed ? 58 : layout.navHeight,
              transition: 'min-height 160ms ease',
              gap: 1,
            }}
          >
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              sx={{ display: { md: 'none' }, mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>

            <Logo size={condensed ? 22 : 25} />
            

            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 3,
                ml: 5,
              }}
            >
              <NavLink to="/shop" style={navLinkStyles}>
                All pieces
              </NavLink>
              <NavLink to="/shop?new=1" style={navLinkStyles}>
                New in
              </NavLink>
              <NavLink to="/labels" style={navLinkStyles}>
                Labels
              </NavLink>
              <NavLink to="/shop?sale=1&sort=discount" style={navLinkStyles}>
                Reduced
              </NavLink>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Tooltip title="Search the collection">
              <IconButton onClick={() => setSearchOpen(true)} aria-label="Search">
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
              <IconButton onClick={toggleMode} aria-label="Toggle colour mode">
                {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Wishlist">
              <IconButton component={Link} to="/wishlist" aria-label="Wishlist">
                <Badge badgeContent={wishlist.count} color="primary">
                  <FavoriteBorderIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Your bag">
              <IconButton onClick={cart.openDrawer} aria-label="Open bag">
                <Badge badgeContent={cart.totals.itemCount} color="primary">
                  <ShoppingBagOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <Tooltip title={user.name}>
                <IconButton
                  onClick={(event) => setAccountAnchor(event.currentTarget)}
                  aria-label="Account menu"
                  sx={{ ml: 0.5 }}
                >
                  <Avatar src={user.avatar} alt={user.name} sx={{ width: 30, height: 30 }}>
                    {initials(user.name)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                component={Link}
                to="/login"
                size="small"
                variant="outlined"
                startIcon={<PersonOutlineIcon />}
                sx={{ ml: 1, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Sign in
              </Button>
            )}
          </Toolbar>
        </Container>

        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
          onMouseLeave={() => setHovered({ anchor: null, category: null })}
        >
          <Container>
            <Box
              component="nav"
              aria-label="Categories"
              sx={{ display: 'flex', gap: 3.5, height: layout.navSubHeight, alignItems: 'center' }}
            >
              {categories.map((category) => (
                <Box
                  key={category.id}
                  component={Link}
                  to={`/category/${category.slug}`}
                  onMouseEnter={(event) =>
                    setHovered({ anchor: event.currentTarget, category })
                  }
                  sx={{
                    textDecoration: 'none',
                    color: 'text.secondary',
                    fontSize: '0.8125rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    height: '100%',
                    borderBottom: '2px solid transparent',
                    '&:hover': { color: 'text.primary', borderBottomColor: 'primary.main' },
                  }}
                >
                  <span aria-hidden>{category.icon}</span>
                  {category.name}
                </Box>
              ))}
            </Box>
          </Container>

          <Popper
            open={Boolean(megaMenu)}
            anchorEl={hovered.anchor}
            placement="bottom-start"
            sx={{ zIndex: (theme) => theme.zIndex.appBar + 1 }}
          >
            <Paper
              variant="outlined"
              sx={{ minWidth: 220, py: 1, borderTop: 'none', borderRadius: 0 }}
            >
              {hovered.category?.subcategories.map((sub) => (
                <MenuItem
                  key={sub}
                  component={Link}
                  to={`/category/${hovered.category.slug}?sub=${encodeURIComponent(sub)}`}
                  onClick={() => setHovered({ anchor: null, category: null })}
                  sx={{ fontSize: '0.875rem' }}
                >
                  {sub}
                </MenuItem>
              ))}
            </Paper>
          </Popper>
        </Box>
      </AppBar>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={closeAccount}
        slotProps={{ paper: { variant: 'outlined', sx: { minWidth: 232 } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="subtitle2">{user?.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        {isAdmin && (
          <MenuItem component={Link} to="/admin" onClick={closeAccount}>
            Admin console
          </MenuItem>
        )}
        <MenuItem component={Link} to="/orders" onClick={closeAccount}>
          Your orders
        </MenuItem>
        <MenuItem component={Link} to="/wishlist" onClick={closeAccount}>
          Wishlist
        </MenuItem>
        <MenuItem component={Link} to="/profile" onClick={closeAccount}>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={onSignOut}>Sign out</MenuItem>
      </Menu>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: 300 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={22} />
          <IconButton onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1 }} onClick={() => setMobileOpen(false)}>
          <ListItemButton component={Link} to="/shop">
            <ListItemText primary="All pieces" />
          </ListItemButton>
          <ListItemButton component={Link} to="/shop?new=1">
            <ListItemText primary="New in" />
          </ListItemButton>
          <ListItemButton component={Link} to="/shop?sale=1&sort=discount">
            <ListItemText primary="Reduced" />
          </ListItemButton>
          <ListItemButton component={Link} to="/labels">
            <ListItemText primary="Labels" />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />
          {categories.map((category) => (
            <ListItemButton
              key={category.id}
              component={Link}
              to={`/category/${category.slug}`}
            >
              <Box component="span" aria-hidden sx={{ mr: 1.5 }}>
                {category.icon}
              </Box>
              <ListItemText primary={category.name} />
            </ListItemButton>
          ))}
          <Divider sx={{ my: 1 }} />
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <ListItemButton component={Link} to="/admin">
                  <ListItemText primary="Admin console" />
                </ListItemButton>
              )}
              <ListItemButton component={Link} to="/orders">
                <ListItemText primary="Your orders" />
              </ListItemButton>
              <ListItemButton component={Link} to="/profile">
                <ListItemText primary="Profile" />
              </ListItemButton>
              <ListItemButton onClick={signOut}>
                <ListItemText primary="Sign out" />
              </ListItemButton>
            </>
          ) : (
            <ListItemButton component={Link} to="/login">
              <ListItemText primary="Sign in" />
            </ListItemButton>
          )}
        </List>
      </Drawer>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
