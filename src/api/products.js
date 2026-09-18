import { PAGE_SIZE } from '@/utils/constants';
import { delay, getCatalog, readOverlay, writeOverlay } from './client';

/* ------------------------------------------------------------------ *
 * Query engine
 * ------------------------------------------------------------------ */

const tokenise = (value = '') =>
  value.toLowerCase().split(/[\s,-]+/).filter(Boolean);

function matchesSearch(product, tokens) {
  if (!tokens.length) return true;
  const haystack = `${product.name} ${product.brand} ${product.category} ${product.subcategory} ${product.material} ${product.sku} ${product.tags?.join(' ')} ${product.colors?.join(' ')}`.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Each filter dimension is its own predicate so facet counts can be computed
 * "all filters except this one" — the way a real storefront does it, meaning
 * the numbers next to each checkbox stay useful after you tick something.
 */
function buildPredicates(filters, catalog) {
  const tokens = tokenise(filters.q);
  const brandIds = new Set((filters.brandIds ?? []).map(Number));
  const genders = new Set(filters.genders ?? []);
  const materials = new Set(filters.materials ?? []);
  const colors = new Set(filters.colors ?? []);
  const sizes = new Set(filters.sizes ?? []);
  const tags = new Set(filters.tags ?? []);
  const subcategories = new Set(filters.subcategories ?? []);
  const category = filters.categorySlug
    ? catalog.categoryBySlug.get(filters.categorySlug)
    : null;

  return {
    q: (p) => matchesSearch(p, tokens),
    category: (p) => !category || p.categoryId === category.id,
    subcategory: (p) => !subcategories.size || subcategories.has(p.subcategory),
    brand: (p) => !brandIds.size || brandIds.has(p.brandId),
    gender: (p) => !genders.size || genders.has(p.gender),
    material: (p) => !materials.size || materials.has(p.material),
    color: (p) => !colors.size || p.colors?.some((c) => colors.has(c)),
    size: (p) => !sizes.size || p.sizes?.some((s) => sizes.has(s)),
    tag: (p) => !tags.size || p.tags?.some((t) => tags.has(t)),
    price: (p) =>
      (filters.minPrice == null || p.finalPrice >= filters.minPrice) &&
      (filters.maxPrice == null || p.finalPrice <= filters.maxPrice),
    rating: (p) => !filters.minRating || p.rating >= filters.minRating,
    stock: (p) => !filters.inStockOnly || p.inStock,
    /* Admin-side stock buckets: 'in' | 'low' | 'out'. */
    stockState: (p) => {
      if (filters.stockState === 'out') return !p.inStock;
      if (filters.stockState === 'low') return p.stock > 0 && p.stock <= 8;
      if (filters.stockState === 'in') return p.inStock;
      return true;
    },
    sale: (p) => !filters.onSale || p.discountPercent > 0,
    flags: (p) => {
      if (filters.isNewArrival && !p.isNewArrival) return false;
      if (filters.isBestSeller && !p.isBestSeller) return false;
      if (filters.isFeatured && !p.isFeatured) return false;
      return true;
    },
  };
}

const SORTERS = {
  featured: (a, b) =>
    Number(b.isFeatured) - Number(a.isFeatured) ||
    Number(b.isBestSeller) - Number(a.isBestSeller) ||
    b.rating - a.rating,
  newest: (a, b) => Number(b.isNewArrival) - Number(a.isNewArrival) || b.id - a.id,
  'price-asc': (a, b) => a.finalPrice - b.finalPrice,
  'price-desc': (a, b) => b.finalPrice - a.finalPrice,
  discount: (a, b) => b.discountPercent - a.discountPercent,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  popular: (a, b) => b.reviewCount - a.reviewCount,
  name: (a, b) => a.name.localeCompare(b.name),
  'stock-asc': (a, b) => a.stock - b.stock,
  'stock-desc': (a, b) => b.stock - a.stock,
};

function countBy(items, pick) {
  const counts = new Map();
  for (const item of items) {
    const values = pick(item);
    for (const value of Array.isArray(values) ? values : [values]) {
      if (value == null) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

/** Apply every predicate except the named one. */
function filterExcept(products, predicates, skip) {
  const active = Object.entries(predicates).filter(([key]) => key !== skip);
  return products.filter((product) => active.every(([, test]) => test(product)));
}

/**
 * The main listing query.
 * Returns the page of items, the total, and facet counts for the sidebar.
 */
export async function queryProducts(filters = {}, options = {}) {
  const {
    page = 1,
    perPage = PAGE_SIZE,
    sort = 'featured',
    withFacets = true,
    simulateLatency = true,
  } = options;

  if (simulateLatency) await delay();
  const catalog = await getCatalog();
  const predicates = buildPredicates(filters, catalog);

  const matched = catalog.products.filter((product) =>
    Object.values(predicates).every((test) => test(product)),
  );

  const sorted = [...matched].sort(SORTERS[sort] ?? SORTERS.featured);
  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * perPage;

  let facets = null;
  if (withFacets) {
    const forBrand = filterExcept(catalog.products, predicates, 'brand');
    const forCategory = filterExcept(catalog.products, predicates, 'category');
    const forSub = filterExcept(catalog.products, predicates, 'subcategory');
    const forColor = filterExcept(catalog.products, predicates, 'color');
    const forSize = filterExcept(catalog.products, predicates, 'size');
    const forMaterial = filterExcept(catalog.products, predicates, 'material');
    const forGender = filterExcept(catalog.products, predicates, 'gender');
    const forTag = filterExcept(catalog.products, predicates, 'tag');

    facets = {
      brands: countBy(forBrand, (p) => p.brandId),
      categories: countBy(forCategory, (p) => p.categoryId),
      subcategories: countBy(forSub, (p) => p.subcategory),
      colors: countBy(forColor, (p) => p.colors),
      sizes: countBy(forSize, (p) => p.sizes),
      materials: countBy(forMaterial, (p) => p.material),
      genders: countBy(forGender, (p) => p.gender),
      tags: countBy(forTag, (p) => p.tags),
      onSale: forBrand.filter((p) => p.discountPercent > 0).length,
    };
  }

  return {
    items: sorted.slice(start, start + perPage),
    total: sorted.length,
    page: safePage,
    perPage,
    pageCount,
    sort,
    facets,
    priceRange: catalog.priceRange,
  };
}

export async function getProductById(id) {
  await delay(90);
  const catalog = await getCatalog();
  const product = catalog.byId.get(Number(id));
  if (!product) {
    const created = catalog.products.find((p) => p.id === Number(id));
    if (!created) throw new Error('That piece is no longer in the collection.');
    return created;
  }
  return product;
}

export async function getProductsByIds(ids = []) {
  const catalog = await getCatalog();
  return ids.map((id) => catalog.byId.get(Number(id))).filter(Boolean);
}

/** Same subcategory first, then same brand, then same category. */
export async function getRelatedProducts(product, limit = 8) {
  await delay(120);
  const catalog = await getCatalog();
  const score = (candidate) => {
    let value = 0;
    if (candidate.subcategory === product.subcategory) value += 4;
    if (candidate.brandId === product.brandId) value += 3;
    if (candidate.categoryId === product.categoryId) value += 2;
    if (candidate.gender === product.gender) value += 1;
    const priceGap = Math.abs(candidate.finalPrice - product.finalPrice);
    return value - priceGap / 100000;
  };

  return catalog.products
    .filter((candidate) => candidate.id !== product.id && candidate.inStock)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

/** Curated rails for the home page, in one pass. */
export async function getHomeSections() {
  await delay(200);
  const catalog = await getCatalog();
  const { products } = catalog;

  const pick = (predicate, sorter, count) =>
    products.filter(predicate).sort(sorter).slice(0, count);

  return {
    hero: pick((p) => p.isFeatured && p.inStock, SORTERS.rating, 5),
    newArrivals: pick((p) => p.isNewArrival && p.inStock, SORTERS.newest, 12),
    bestSellers: pick((p) => p.isBestSeller && p.inStock, SORTERS.popular, 12),
    onSale: pick((p) => p.discountPercent >= 40 && p.inStock, SORTERS.discount, 12),
    topRated: pick((p) => p.reviewCount > 200 && p.inStock, SORTERS.rating, 12),
    categories: catalog.categories,
    brands: catalog.brands.filter((b) => b.featured),
    meta: catalog.meta,
  };
}

/** Typeahead for the search dialog. */
export async function suggest(term, limit = 7) {
  if (!term || term.trim().length < 2) return { products: [], brands: [], categories: [] };
  await delay(80);
  const catalog = await getCatalog();
  const tokens = tokenise(term);

  const products = [];
  for (const product of catalog.products) {
    if (matchesSearch(product, tokens)) {
      products.push(product);
      if (products.length >= limit) break;
    }
  }

  const lower = term.toLowerCase();
  return {
    products,
    brands: catalog.brands.filter((b) => b.name.toLowerCase().includes(lower)).slice(0, 4),
    categories: catalog.categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.subcategories.some((s) => s.toLowerCase().includes(lower)),
      )
      .slice(0, 4),
  };
}

/* ------------------------------------------------------------------ *
 * Catalogue analytics (admin dashboard)
 * ------------------------------------------------------------------ */

export async function getCatalogStats() {
  await delay(140);
  const catalog = await getCatalog();
  const { products, categories, brands } = catalog;

  const byCategory = categories.map((category) => {
    const items = products.filter((p) => p.categoryId === category.id);
    const value = items.reduce((sum, p) => sum + p.finalPrice * p.stock, 0);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      count: items.length,
      inventoryValue: value,
      avgPrice: items.length
        ? Math.round(items.reduce((s, p) => s + p.finalPrice, 0) / items.length)
        : 0,
      outOfStock: items.filter((p) => !p.inStock).length,
    };
  });

  const byBrand = brands
    .map((brand) => {
      const items = products.filter((p) => p.brandId === brand.id);
      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        country: brand.country,
        count: items.length,
        avgRating: items.length
          ? Number((items.reduce((s, p) => s + p.rating, 0) / items.length).toFixed(2))
          : 0,
        inventoryValue: items.reduce((s, p) => s + p.finalPrice * p.stock, 0),
      };
    })
    .sort((a, b) => b.inventoryValue - a.inventoryValue);

  const priceBands = [
    { label: 'Under ₹5k', min: 0, max: 5000 },
    { label: '₹5k–15k', min: 5000, max: 15000 },
    { label: '₹15k–30k', min: 15000, max: 30000 },
    { label: '₹30k–50k', min: 30000, max: 50000 },
    { label: 'Above ₹50k', min: 50000, max: Infinity },
  ].map((band) => ({
    ...band,
    count: products.filter((p) => p.finalPrice >= band.min && p.finalPrice < band.max).length,
  }));

  const lowStock = products
    .filter((p) => p.stock > 0 && p.stock <= 8)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 12);

  return {
    totals: {
      products: products.length,
      brands: brands.length,
      categories: categories.length,
      outOfStock: products.filter((p) => !p.inStock).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 8).length,
      onSale: products.filter((p) => p.discountPercent > 0).length,
      inventoryValue: products.reduce((s, p) => s + p.finalPrice * p.stock, 0),
      units: products.reduce((s, p) => s + p.stock, 0),
      avgRating: Number(
        (products.reduce((s, p) => s + p.rating, 0) / (products.length || 1)).toFixed(2),
      ),
      avgDiscount: Math.round(
        products.reduce((s, p) => s + p.discountPercent, 0) / (products.length || 1),
      ),
    },
    byCategory,
    byBrand,
    priceBands,
    lowStock,
    genderSplit: ['Men', 'Women', 'Unisex'].map((gender) => ({
      label: gender,
      count: products.filter((p) => p.gender === gender).length,
    })),
  };
}

/* ------------------------------------------------------------------ *
 * Admin mutations — written to the localStorage overlay, never to the
 * source JSON. Clearing app data restores the original catalogue.
 * ------------------------------------------------------------------ */

function derivePricing(patch, existing = {}) {
  const price = Number(patch.price ?? existing.price ?? 0);
  const discountPercent = Number(patch.discountPercent ?? existing.discountPercent ?? 0);
  const stock = Number(patch.stock ?? existing.stock ?? 0);
  return {
    price,
    discountPercent,
    finalPrice: Math.round(price * (1 - discountPercent / 100)),
    stock,
    inStock: stock > 0,
  };
}

export async function updateProduct(id, patch) {
  const catalog = await getCatalog();
  const existing = catalog.byId.get(Number(id));
  if (!existing) throw new Error('Product not found.');

  const overlay = readOverlay();
  const numericId = Number(id);
  const isCreated = overlay.created.some((p) => p.id === numericId);
  const merged = { ...patch, ...derivePricing(patch, existing) };

  if (isCreated) {
    overlay.created = overlay.created.map((p) =>
      p.id === numericId ? { ...p, ...merged } : p,
    );
  } else {
    overlay.updated[numericId] = { ...(overlay.updated[numericId] ?? {}), ...merged };
  }

  writeOverlay(overlay);
  return { ...existing, ...merged };
}

export async function createProduct(draft) {
  const catalog = await getCatalog();
  const overlay = readOverlay();
  const nextId =
    Math.max(
      0,
      ...catalog.products.map((p) => p.id),
      ...overlay.created.map((p) => p.id),
    ) + 1;

  const brand = catalog.brandById.get(Number(draft.brandId));
  const category = catalog.categoryById.get(Number(draft.categoryId));
  const seed = `product${nextId}`;

  const product = {
    id: nextId,
    name: draft.name,
    brandId: Number(draft.brandId),
    brand: brand?.name ?? 'House label',
    categoryId: Number(draft.categoryId),
    category: category?.name ?? 'Stylish Clothes',
    subcategory: draft.subcategory ?? category?.subcategories?.[0] ?? 'Everyday',
    currency: 'INR',
    description: draft.description ?? '',
    material: draft.material ?? 'Pure Silk',
    colors: draft.colors?.length ? draft.colors : ['Ivory'],
    sizes: draft.sizes?.length ? draft.sizes : ['S', 'M', 'L', 'XL'],
    images: [
      `https://picsum.photos/seed/${seed}a/500/650`,
      `https://picsum.photos/seed/${seed}b/500/650`,
      `https://picsum.photos/seed/${seed}c/500/650`,
    ],
    thumbnail: `https://picsum.photos/seed/${seed}a/300/400`,
    rating: 0,
    reviewCount: 0,
    isNewArrival: true,
    isBestSeller: false,
    isFeatured: Boolean(draft.isFeatured),
    gender: draft.gender ?? 'Unisex',
    tags: draft.tags?.length ? draft.tags : ['new-in'],
    sku: `LUX-NEW-${String(nextId).padStart(5, '0')}`,
    ...derivePricing(draft),
  };

  overlay.created = [product, ...overlay.created];
  writeOverlay(overlay);
  return product;
}

export async function deleteProduct(id) {
  const overlay = readOverlay();
  const numericId = Number(id);
  overlay.created = overlay.created.filter((p) => p.id !== numericId);
  delete overlay.updated[numericId];
  if (!overlay.deleted.includes(numericId)) overlay.deleted.push(numericId);
  writeOverlay(overlay);
  return numericId;
}

export async function adjustStock(id, delta) {
  const catalog = await getCatalog();
  const existing = catalog.byId.get(Number(id));
  if (!existing) throw new Error('Product not found.');
  const stock = Math.max(0, existing.stock + delta);
  return updateProduct(id, { stock });
}

export { readOverlay, resetOverlay } from './client';
