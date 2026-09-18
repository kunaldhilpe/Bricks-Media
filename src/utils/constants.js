export const STORAGE_KEYS = {
  mode: 'colorMode',
  session: 'session',
  cart: 'cart',
  wishlist: 'wishlist',
  orders: 'orders',
  addresses: 'addresses',
  productOverrides: 'productOverrides',
  recentlyViewed: 'recentlyViewed',
  searchHistory: 'searchHistory',
};

export const ROLES = { admin: 'admin', customer: 'customer' };

export const PAGE_SIZE = 24;

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'New arrivals' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest saving' },
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most reviewed' },
  { value: 'name', label: 'Name A–Z' },
];

export const ORDER_STATUS = {
  placed: { label: 'Placed', color: 'info', step: 0 },
  packed: { label: 'Packed', color: 'info', step: 1 },
  shipped: { label: 'Shipped', color: 'warning', step: 2 },
  delivered: { label: 'Delivered', color: 'success', step: 3 },
  cancelled: { label: 'Cancelled', color: 'error', step: -1 },
};

export const ORDER_FLOW = ['placed', 'packed', 'shipped', 'delivered'];

export const PAYMENT_METHODS = [
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'netbanking', label: 'Net banking' },
  { value: 'cod', label: 'Cash on delivery' },
];

/** Free shipping above this, otherwise a flat fee. */
export const SHIPPING = { threshold: 4999, fee: 249 };
export const GST_RATE = 0.05;

export const PROMO_CODES = {
  LUXE10: { type: 'percent', value: 10, label: '10% off your bag' },
  ATELIER500: { type: 'flat', value: 500, label: '₹500 off orders over ₹9,999', min: 9999 },
  FREESHIP: { type: 'shipping', value: 0, label: 'Free shipping' },
};

export const GENDERS = ['Men', 'Women', 'Unisex'];

export const RATING_FILTERS = [4.5, 4, 3.5, 3];
