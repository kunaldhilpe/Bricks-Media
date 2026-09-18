import storage from '@/utils/storage';
import { GST_RATE, ORDER_FLOW, PROMO_CODES, SHIPPING, STORAGE_KEYS } from '@/utils/constants';
import { delay } from './client';

/**
 * Orders live in localStorage as one shared list with a userId on each record,
 * so a customer sees their own history and an admin sees the whole book.
 */

function readAll() {
  const orders = storage.read(STORAGE_KEYS.orders, []);
  return Array.isArray(orders) ? orders : [];
}

function writeAll(orders) {
  storage.write(STORAGE_KEYS.orders, orders);
}

/** Bag maths in one place so cart, checkout and order records always agree. */
export function priceBag(items, promoCode) {
  const subtotal = items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const listTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const catalogueSaving = listTotal - subtotal;

  const promo = promoCode ? PROMO_CODES[promoCode.toUpperCase()] : null;
  let promoDiscount = 0;
  let freeShipping = false;

  if (promo) {
    if (promo.type === 'percent') promoDiscount = Math.round((subtotal * promo.value) / 100);
    if (promo.type === 'flat' && subtotal >= (promo.min ?? 0)) promoDiscount = promo.value;
    if (promo.type === 'shipping') freeShipping = true;
  }

  const discounted = Math.max(0, subtotal - promoDiscount);
  const shipping =
    items.length === 0 || freeShipping || discounted >= SHIPPING.threshold ? 0 : SHIPPING.fee;
  const tax = Math.round(discounted * GST_RATE);

  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    lineCount: items.length,
    listTotal,
    subtotal,
    catalogueSaving,
    promoCode: promoDiscount > 0 || freeShipping ? promoCode?.toUpperCase() : null,
    promoDiscount,
    shipping,
    tax,
    total: discounted + shipping + tax,
  };
}

function orderNumber() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const noise = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `LX-${stamp}${noise}`;
}

export async function placeOrder({ user, items, address, payment, promoCode, note }) {
  await delay(700);
  if (!items?.length) throw new Error('Your bag is empty.');
  if (!address?.line1 || !address?.city || !address?.pincode) {
    throw new Error('A delivery address with street, city and pincode is required.');
  }

  const totals = priceBag(items, promoCode);
  const now = new Date();
  const eta = new Date(now.getTime() + 5 * 86400000);

  const order = {
    id: orderNumber(),
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    placedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expectedBy: eta.toISOString(),
    status: 'placed',
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      thumbnail: item.thumbnail,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
      finalPrice: item.finalPrice,
    })),
    address,
    payment: { method: payment.method, reference: `PAY-${orderNumber().slice(3)}` },
    note: note ?? '',
    totals,
    timeline: [{ status: 'placed', at: now.toISOString(), note: 'Order received.' }],
  };

  writeAll([order, ...readAll()]);
  return order;
}

export async function listOrders({ userId, status, q } = {}) {
  await delay(180);
  let orders = readAll();
  if (userId) orders = orders.filter((order) => order.userId === userId);
  if (status && status !== 'all') orders = orders.filter((order) => order.status === status);
  if (q) {
    const term = q.toLowerCase();
    orders = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term),
    );
  }
  return orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
}

export async function getOrder(id) {
  await delay(120);
  const order = readAll().find((candidate) => candidate.id === id);
  if (!order) throw new Error('We could not find that order.');
  return order;
}

export async function updateOrderStatus(id, status, note) {
  await delay(240);
  const orders = readAll();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) throw new Error('We could not find that order.');

  const now = new Date().toISOString();
  const updated = {
    ...orders[index],
    status,
    updatedAt: now,
    timeline: [...orders[index].timeline, { status, at: now, note: note ?? '' }],
  };
  orders[index] = updated;
  writeAll(orders);
  return updated;
}

export async function cancelOrder(id, reason) {
  const order = await getOrder(id);
  if (['shipped', 'delivered'].includes(order.status)) {
    throw new Error('This order has already shipped. Contact the concierge to arrange a return.');
  }
  return updateOrderStatus(id, 'cancelled', reason ?? 'Cancelled by customer.');
}

export function nextStatus(status) {
  const index = ORDER_FLOW.indexOf(status);
  if (index === -1 || index === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1];
}

/** Sales analytics for the admin dashboard. */
export async function getSalesStats(days = 30) {
  await delay(200);
  const orders = readAll().filter((order) => order.status !== 'cancelled');
  const cancelled = readAll().filter((order) => order.status === 'cancelled');

  const revenue = orders.reduce((sum, order) => sum + order.totals.total, 0);
  const units = orders.reduce((sum, order) => sum + order.totals.itemCount, 0);

  const buckets = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);
    const next = new Date(day.getTime() + 86400000);
    const inDay = orders.filter((order) => {
      const at = new Date(order.placedAt);
      return at >= day && at < next;
    });
    buckets.push({
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      orders: inDay.length,
      revenue: inDay.reduce((sum, order) => sum + order.totals.total, 0),
    });
  }

  const productTally = new Map();
  orders.forEach((order) =>
    order.items.forEach((item) => {
      const entry = productTally.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        thumbnail: item.thumbnail,
        units: 0,
        revenue: 0,
      };
      entry.units += item.quantity;
      entry.revenue += item.finalPrice * item.quantity;
      productTally.set(item.productId, entry);
    }),
  );

  const statusTally = ORDER_FLOW.concat('cancelled').map((status) => ({
    status,
    count: readAll().filter((order) => order.status === status).length,
  }));

  return {
    revenue,
    orderCount: orders.length,
    cancelledCount: cancelled.length,
    units,
    averageOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
    buckets,
    topProducts: [...productTally.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    statusTally,
    recent: readAll()
      .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
      .slice(0, 6),
  };
}

/** Customer roll-up for the admin customers table. */
export async function getCustomerStats() {
  await delay(140);
  const orders = readAll();
  const tally = new Map();
  orders.forEach((order) => {
    const entry = tally.get(order.userId) ?? {
      userId: order.userId,
      orders: 0,
      spend: 0,
      lastOrderAt: null,
      cancelled: 0,
    };
    entry.orders += 1;
    if (order.status === 'cancelled') entry.cancelled += 1;
    else entry.spend += order.totals.total;
    if (!entry.lastOrderAt || new Date(order.placedAt) > new Date(entry.lastOrderAt)) {
      entry.lastOrderAt = order.placedAt;
    }
    tally.set(order.userId, entry);
  });
  return tally;
}

export function clearOrders() {
  storage.remove(STORAGE_KEYS.orders);
}
