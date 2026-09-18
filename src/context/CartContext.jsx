import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { priceBag } from '@/api/orders';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

/** One line per product + size + colour, the way a real bag works. */
const lineKey = (productId, size, color) => `${productId}::${size ?? '-'}::${color ?? '-'}`;

const MAX_PER_LINE = 8;

function reducer(state, action) {
  switch (action.type) {
    case 'load':
      return action.items;

    case 'add': {
      const { product, size, color, quantity } = action;
      const key = lineKey(product.id, size, color);
      const existing = state.find((item) => item.key === key);

      if (existing) {
        return state.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: Math.min(MAX_PER_LINE, item.quantity + quantity),
                addedAt: Date.now(),
              }
            : item,
        );
      }

      return [
        {
          key,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          thumbnail: product.thumbnail,
          price: product.price,
          finalPrice: product.finalPrice,
          discountPercent: product.discountPercent,
          size,
          color,
          quantity: Math.min(MAX_PER_LINE, quantity),
          stock: product.stock,
          addedAt: Date.now(),
        },
        ...state,
      ];
    }

    case 'setQuantity':
      return state
        .map((item) =>
          item.key === action.key
            ? { ...item, quantity: Math.max(0, Math.min(MAX_PER_LINE, action.quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0);

    case 'remove':
      return state.filter((item) => item.key !== action.key);

    case 'clear':
      return [];

    default:
      return state;
  }
}

/** Guests get their own bag; signing in swaps to that customer's bag. */
const bagKey = (userId) => `${STORAGE_KEYS.cart}.${userId ?? 'guest'}`;

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, dispatch] = useReducer(reducer, []);
  const [promoCode, setPromoCode] = useState(() => storage.read('promoCode', null));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: 'load', items: storage.read(bagKey(user?.id), []) });
  }, [user?.id]);

  useEffect(() => {
    storage.write(bagKey(user?.id), items);
  }, [items, user?.id]);

  useEffect(() => {
    storage.write('promoCode', promoCode);
  }, [promoCode]);

  const addItem = useCallback((product, { size, color, quantity = 1 } = {}) => {
    dispatch({
      type: 'add',
      product,
      size: size ?? product.sizes?.[0],
      color: color ?? product.colors?.[0],
      quantity,
    });
  }, []);

  const totals = useMemo(() => priceBag(items, promoCode), [items, promoCode]);

  const value = useMemo(
    () => ({
      items,
      totals,
      promoCode,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem,
      setQuantity: (key, quantity) => dispatch({ type: 'setQuantity', key, quantity }),
      increment: (key) => {
        const line = items.find((item) => item.key === key);
        if (line) dispatch({ type: 'setQuantity', key, quantity: line.quantity + 1 });
      },
      decrement: (key) => {
        const line = items.find((item) => item.key === key);
        if (line) dispatch({ type: 'setQuantity', key, quantity: line.quantity - 1 });
      },
      removeItem: (key) => dispatch({ type: 'remove', key }),
      clearCart: () => dispatch({ type: 'clear' }),
      applyPromo: setPromoCode,
      clearPromo: () => setPromoCode(null),
      hasLine: (productId, size, color) =>
        items.some((item) => item.key === lineKey(productId, size, color)),
      countFor: (productId) =>
        items
          .filter((item) => item.productId === productId)
          .reduce((sum, item) => sum + item.quantity, 0),
      maxPerLine: MAX_PER_LINE,
    }),
    [items, totals, promoCode, drawerOpen, addItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

export default CartContext;
