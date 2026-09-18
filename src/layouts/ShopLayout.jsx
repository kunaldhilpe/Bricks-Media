import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '@/components/shop/Navbar';
import Footer from '@/components/shop/Footer';
import CartDrawer from '@/components/shop/CartDrawer';

export default function ShopLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <CartDrawer />
    </Box>
  );
}
