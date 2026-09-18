import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const listKey = (userId) => `${STORAGE_KEYS.wishlist}.${userId ?? 'guest'}`;

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    const stored = storage.read(listKey(user?.id), []);
    setIds(Array.isArray(stored) ? stored : []);
  }, [user?.id]);

  useEffect(() => {
    storage.write(listKey(user?.id), ids);
  }, [ids, user?.id]);

  const toggle = useCallback((productId) => {
    let added = false;
    setIds((current) => {
      if (current.includes(productId)) return current.filter((id) => id !== productId);
      added = true;
      return [productId, ...current];
    });
    return added;
  }, []);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      has: (productId) => ids.includes(productId),
      toggle,
      remove: (productId) => setIds((current) => current.filter((id) => id !== productId)),
      clear: () => setIds([]),
    }),
    [ids, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider');
  return context;
}

export default WishlistContext;
