import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCatalog, onCatalogChange } from '@/api/client';

const CatalogContext = createContext(null);

/**
 * Categories, brands and the facet vocabularies are needed by the navbar and
 * every filter panel, so they load once here and refresh when an admin edits
 * the catalogue.
 */
export function CatalogProvider({ children }) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
    getCatalog()
      .then((catalog) =>
        setState({
          loading: false,
          error: null,
          data: {
            categories: catalog.categories,
            brands: catalog.brands,
            meta: catalog.meta,
            vocab: catalog.vocab,
            priceRange: catalog.priceRange,
            productCount: catalog.products.length,
            categoryBySlug: catalog.categoryBySlug,
            brandById: catalog.brandById,
          },
        }),
      )
      .catch((error) => setState({ loading: false, error, data: null }));
  }, []);

  useEffect(load, [load]);
  useEffect(() => onCatalogChange(load), [load]);

  const value = useMemo(
    () => ({
      ...state,
      categories: state.data?.categories ?? [],
      brands: state.data?.brands ?? [],
      vocab: state.data?.vocab ?? { materials: [], colors: [], sizes: [], tags: [], genders: [] },
      priceRange: state.data?.priceRange ?? [0, 100000],
      meta: state.data?.meta ?? null,
      productCount: state.data?.productCount ?? 0,
      brandName: (id) => state.data?.brandById?.get(id)?.name ?? '',
      categoryFor: (slug) => state.data?.categoryBySlug?.get(slug) ?? null,
      refresh: load,
    }),
    [state, load],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider');
  return context;
}

export default CatalogContext;
