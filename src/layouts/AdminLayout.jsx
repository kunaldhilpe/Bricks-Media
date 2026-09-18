import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '@/components/common/Logo';
import { useColorMode } from '@/context/ColorModeContext';
import { useAuth } from '@/context/AuthContext';
import { initials } from '@/utils/format';
import { layout } from '@/theme/tokens';

const navItems = [
  { label: 'Overview', to: '/admin', icon: DashboardOutlinedIcon, end: true },
  { label: 'Products', to: '/admin/products', icon: Inventory2OutlinedIcon },
  { label: 'Orders', to: '/admin/orders', icon: ReceiptLongOutlinedIcon },
  { label: 'Customers', to: '/admin/customers', icon: GroupOutlinedIcon },
  { label: 'Categories', to: '/admin/categories', icon: CategoryOutlinedIcon },
  { label: 'Labels', to: '/admin/labels', icon: StorefrontOutlinedIcon },
  { label: 'Settings', to: '/admin/settings', icon: SettingsOutlinedIcon },
];

function SidebarContent({ onNavigate }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Logo to="/admin" size={22} />
        <Chip label="Console" size="small" variant="outlined" sx={{ mt: 1.5 }} />
      </Box>
      <Divider />

      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            sx={{
              mb: 0.5,
              '&.active': {
                bgcolor: 'surface.tint',
                color: 'text.primary',
                fontWeight: 500,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
              <item.icon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.9062rem' }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar src={user?.avatar} sx={{ width: 34, height: 34 }}>
            {initials(user?.name ?? '')}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              Administrator
            </Typography>
          </Box>
        </Box>
        <Button component={Link} to="/" fullWidth size="small" variant="outlined" sx={{ mb: 1 }}>
          View the storefront
        </Button>
        <Button
          fullWidth
          size="small"
          startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
          onClick={() => {
            signOut();
            navigate('/login');
          }}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleMode } = useColorMode();

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'surface.sunken' }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: layout.adminDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: layout.adminDrawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' } }}
        slotProps={{ paper: { sx: { width: layout.adminDrawerWidth } } }}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            display: { md: 'none' },
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
            <Logo to="/admin" size={20} />
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
              <IconButton onClick={toggleMode} aria-label="Toggle colour mode">
                {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'flex-end',
            px: 4,
            pt: 2.5,
          }}
        >
          <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            <IconButton onClick={toggleMode} aria-label="Toggle colour mode">
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          component="main"
          sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 2 }, pb: 8 }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
