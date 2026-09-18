// src/utils/productImage.js

/**
 * Eagerly bundle every product image at build time.
 * Vite rewrites each match to a hashed URL.
 * Keys look like: '../../assets/images/products/graphic-tee-blush-front.svg'
 */
const modules = import.meta.glob(
  '../assets/images/products/**/*.{svg,png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

/**
 * Re-key by the public-style path your JSON already uses:
 *   '/images/products/graphic-tee-blush-front.svg' -> hashed URL
 */
const assetMap = Object.fromEntries(
  Object.entries(modules).map(([key, url]) => {
    const publicPath = key.replace(/^.*\/assets/, ''); // strip up to /assets
    return [publicPath, url];
  })
);

const PLACEHOLDER =
  assetMap['/images/products/placeholder.svg'] ??
  assetMap['/images/placeholder.svg'] ??
  '';

/**
 * Resolve any image reference coming from JSON.
 * Accepts:
 *   "/images/products/foo.svg"      -> looked up in the bundle map
 *   "https://cdn.example.com/x.jpg" -> passed through
 *   "data:image/..."                -> passed through
 *   already-bundled module URL      -> passed through
 */
export function resolveImage(ref) {
  if (!ref) return PLACEHOLDER;

  // Remote / data / blob URLs — leave alone
  if (/^(https?:|data:|blob:)/.test(ref)) return ref;

  // Already a bundled asset
  if (ref.startsWith('/assets/')) return ref;

  // Normalise: ensure leading slash, collapse duplicate slashes
  const normalised = ('/' + ref.replace(/^\.?\//, '')).replace(/\/{2,}/g, '/');

  return assetMap[normalised] ?? PLACEHOLDER;
}

/** Resolve a whole array, dropping any that fail. */
export function resolveImages(list = []) {
  return list.map(resolveImage).filter(Boolean);
}

export { PLACEHOLDER as PLACEHOLDER_IMAGE };