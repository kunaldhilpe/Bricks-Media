import { BrowserRouter } from 'react-router-dom';
import { ColorModeProvider } from '@/context/ColorModeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CatalogProvider } from '@/context/CatalogContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ScrollToTop from '@/components/common/ScrollToTop';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  return (
    <ColorModeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <CatalogProvider>
              <CartProvider>
                <WishlistProvider>
                  <ErrorBoundary>
                    <ScrollToTop />
                    <AppRoutes />
                  </ErrorBoundary>
                </WishlistProvider>
              </CartProvider>
            </CatalogProvider>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ColorModeProvider>
  );
}
