import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ShopLayout from '@/layouts/ShopLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ROLES } from '@/utils/constants';

/* Route-level code splitting: the admin console is never downloaded by a
   shopper who does not open it. */
const HomePage = lazy(() => import('@/pages/shop/HomePage'));
const ListingPage = lazy(() => import('@/pages/shop/ListingPage'));
const ProductPage = lazy(() => import('@/pages/shop/ProductPage'));
const CartPage = lazy(() => import('@/pages/shop/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/shop/CheckoutPage'));
const OrderPlacedPage = lazy(() => import('@/pages/shop/OrderPlacedPage'));
const OrdersPage = lazy(() => import('@/pages/shop/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/shop/OrderDetailPage'));
const WishlistPage = lazy(() => import('@/pages/shop/WishlistPage'));
const ProfilePage = lazy(() => import('@/pages/shop/ProfilePage'));
const LabelsPage = lazy(() => import('@/pages/shop/LabelsPage'));
const LabelPage = lazy(() => import('@/pages/shop/LabelPage'));
const NotFoundPage = lazy(() => import('@/pages/shop/NotFoundPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));

const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'));
const AdminLabelsPage = lazy(() => import('@/pages/admin/AdminLabelsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ShopLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/shop" element={<ListingPage />} />
          <Route path="/category/:slug" element={<ListingPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/labels" element={<LabelsPage />} />
          <Route path="/label/:slug" element={<LabelPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id/placed" element={<OrderPlacedPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RoleRoute allow={[ROLES.admin]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id" element={<AdminProductFormPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="labels" element={<AdminLabelsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
