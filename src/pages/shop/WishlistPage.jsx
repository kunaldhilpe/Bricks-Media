import { Button } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import ProductGrid from '@/components/shop/ProductGrid';
import useAsync from '@/hooks/useAsync';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { getProductsByIds } from '@/api/products';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { pluralise } from '@/utils/format';

export default function WishlistPage() {
  useDocumentTitle('Wishlist');
  const wishlist = useWishlist();
  const toast = useToast();

  const { data: products, loading } = useAsync(
    () => getProductsByIds(wishlist.ids),
    [wishlist.ids.join(',')],
  );

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Wishlist"
        description={
          wishlist.count
            ? `${pluralise(wishlist.count, 'piece')} put aside. Wishlists are kept in this browser.`
            : undefined
        }
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]}
        action={
          wishlist.count > 0 && (
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                wishlist.clear();
                toast.info('Wishlist cleared.');
              }}
            >
              Clear the list
            </Button>
          )
        }
      />

      {!loading && wishlist.count === 0 ? (
        <EmptyState
          icon={FavoriteBorderIcon}
          title="Nothing saved yet"
          description="Tap the heart on any piece and it will wait for you here."
          actionLabel="Browse the collection"
          actionTo="/shop"
        />
      ) : (
        <ProductGrid products={products ?? []} loading={loading} skeletonCount={wishlist.count || 4} />
      )}
    </Container>
  );
}
