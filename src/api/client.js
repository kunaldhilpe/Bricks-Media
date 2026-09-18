import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * Stand-in for a REST backend.
 *
 * The five JSON files ship in /public/data and are fetched once, then held in
 * a module cache. Every read goes through here so that admin edits (kept in
 * localStorage as an overlay) are visible everywhere in the app without
 * mutating the source files.
 */

const DATA_BASE = `${import.meta.env.BASE_URL}data/`;
const fileCache = new Map();
const inflight = new Map();

/** Simulated network latency, so loading states are real rather than decorative. */
export const LATENCY = 160;

export const delay = (ms = LATENCY) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export async function loadJson(file) {
  if (fileCache.has(file)) return fileCache.get(file);
  if (inflight.has(file)) return inflight.get(file);

  const request = fetch(`${DATA_BASE}${file}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load ${file} (${response.status})`);
      }
      return response.json();
    })
    .then((data) => {
      fileCache.set(file, data);
      inflight.delete(file);
      return data;
    })
    .catch((error) => {
      inflight.delete(file);
      throw error;
    });

  inflight.set(file, request);
  return request;
}

/* ------------------------------------------------------------------ *
 * Admin overlay
 * ------------------------------------------------------------------ */

const emptyOverlay = { updated: {}, created: [], deleted: [] };

export function readOverlay() {
  const stored = storage.read(STORAGE_KEYS.productOverrides, emptyOverlay);
  return {
    updated: stored?.updated ?? {},
    created: Array.isArray(stored?.created) ? stored.created : [],
    deleted: Array.isArray(stored?.deleted) ? stored.deleted : [],
  };
}

export function writeOverlay(overlay) {
  storage.write(STORAGE_KEYS.productOverrides, overlay);
  catalogCache = null;
  notify();
}

export function resetOverlay() {
  storage.remove(STORAGE_KEYS.productOverrides);
  catalogCache = null;
  notify();
}

/* ------------------------------------------------------------------ *
 * Catalogue index
 * ------------------------------------------------------------------ */

let catalogCache = null;
let catalogPromise = null;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

/** Subscribe to catalogue invalidation (used by CatalogProvider). */
export function onCatalogChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyOverlay(products) {
  const overlay = readOverlay();
  const deleted = new Set(overlay.deleted);

  const merged = products
    .filter((product) => !deleted.has(product.id))
    .map((product) =>
      overlay.updated[product.id]
        ? { ...product, ...overlay.updated[product.id] }
        : product,
    );

  // Admin-created products sit at the front so they are easy to find.
  return [...overlay.created.filter((p) => !deleted.has(p.id)), ...merged];
}

/**
 * Returns the fully indexed catalogue: products with overlay applied, plus
 * lookup maps and the facet vocabularies derived from the data itself.
 */
export async function getCatalog() {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = Promise.all([
    loadJson('products.json'),
    loadJson('brands.json'),
    loadJson('categories.json'),
    loadJson('meta.json'),
  ]).then(([rawProducts, brands, categories, meta]) => {
    const products = applyOverlay(rawProducts);

    const byId = new Map(products.map((p) => [p.id, p]));
    const brandById = new Map(brands.map((b) => [b.id, b]));
    const brandBySlug = new Map(brands.map((b) => [b.slug, b]));
    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

    const vocab = {
      materials: new Set(),
      colors: new Set(),
      sizes: new Set(),
      tags: new Set(),
      genders: new Set(),
    };
    let priceFloor = Infinity;
    let priceCeil = 0;

    for (const product of products) {
      vocab.materials.add(product.material);
      vocab.genders.add(product.gender);
      product.colors?.forEach((c) => vocab.colors.add(c));
      product.sizes?.forEach((s) => vocab.sizes.add(s));
      product.tags?.forEach((t) => vocab.tags.add(t));
      priceFloor = Math.min(priceFloor, product.finalPrice);
      priceCeil = Math.max(priceCeil, product.finalPrice);
    }

    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sortedSizes = [...vocab.sizes].sort((a, b) => {
      const ai = sizeOrder.indexOf(a);
      const bi = sizeOrder.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return Number(a) - Number(b);
    });

    catalogCache = {
      products,
      byId,
      brands,
      brandById,
      brandBySlug,
      categories,
      categoryById,
      categoryBySlug,
      meta,
      vocab: {
        materials: [...vocab.materials].sort(),
        colors: [...vocab.colors].sort(),
        sizes: sortedSizes,
        tags: [...vocab.tags].sort(),
        genders: [...vocab.genders].sort(),
      },
      priceRange: [Math.floor(priceFloor / 100) * 100, Math.ceil(priceCeil / 100) * 100],
    };

    catalogPromise = null;
    return catalogCache;
  });

  return catalogPromise;
}

export function invalidateCatalog() {
  catalogCache = null;
  catalogPromise = null;
  notify();
}
