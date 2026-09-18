import { delay, getCatalog } from './client';

export async function listCategories() {
  const { categories } = await getCatalog();
  return categories;
}

export async function getCategoryBySlug(slug) {
  const { categoryBySlug } = await getCatalog();
  const category = categoryBySlug.get(slug);
  if (!category) throw new Error('We do not have that category.');
  return category;
}

export async function listBrands({ featuredOnly = false } = {}) {
  await delay(120);
  const { brands, products } = await getCatalog();
  const counts = new Map();
  products.forEach((p) => counts.set(p.brandId, (counts.get(p.brandId) ?? 0) + 1));

  return brands
    .filter((brand) => (featuredOnly ? brand.featured : true))
    .map((brand) => ({ ...brand, productCount: counts.get(brand.id) ?? 0 }));
}

export async function getBrandBySlug(slug) {
  await delay(120);
  const { brandBySlug, products } = await getCatalog();
  const brand = brandBySlug.get(slug);
  if (!brand) throw new Error('We do not carry that label.');
  const items = products.filter((p) => p.brandId === brand.id);
  return {
    ...brand,
    productCount: items.length,
    priceFrom: items.length ? Math.min(...items.map((p) => p.finalPrice)) : 0,
    avgRating: items.length
      ? Number((items.reduce((s, p) => s + p.rating, 0) / items.length).toFixed(1))
      : 0,
  };
}

export async function getMeta() {
  const { meta } = await getCatalog();
  return meta;
}
