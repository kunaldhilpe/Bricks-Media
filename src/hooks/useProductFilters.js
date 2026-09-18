import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGE_SIZE } from '@/utils/constants';

const LIST_KEYS = ['brand', 'color', 'size', 'material', 'gender', 'tag', 'sub'];
const FLAG_KEYS = ['sale', 'stock', 'new', 'best', 'featured'];

/**
 * Filter state lives in the URL, so a filtered listing is shareable, the back
 * button behaves, and a reload keeps the shopper where they were.
 */
export default function useProductFilters({ categorySlug } = {}) {
  const [params, setParams] = useSearchParams();

  const readList = useCallback((key) => params.getAll(key).filter(Boolean), [params]);

  const filters = useMemo(
    () => ({
      q: params.get('q') ?? '',
      categorySlug: categorySlug ?? params.get('category') ?? '',
      subcategories: params.getAll('sub'),
      brandIds: params.getAll('brand').map(Number).filter(Boolean),
      colors: params.getAll('color'),
      sizes: params.getAll('size'),
      materials: params.getAll('material'),
      genders: params.getAll('gender'),
      tags: params.getAll('tag'),
      minPrice: params.get('min') ? Number(params.get('min')) : null,
      maxPrice: params.get('max') ? Number(params.get('max')) : null,
      minRating: params.get('rating') ? Number(params.get('rating')) : null,
      onSale: params.get('sale') === '1',
      inStockOnly: params.get('stock') === '1',
      isNewArrival: params.get('new') === '1',
      isBestSeller: params.get('best') === '1',
      isFeatured: params.get('featured') === '1',
    }),
    [params, categorySlug],
  );

  const sort = params.get('sort') ?? 'featured';
  const page = Number(params.get('page') ?? 1);
  const perPage = Number(params.get('per') ?? PAGE_SIZE);

  const mutate = useCallback(
    (mutator, { resetPage = true } = {}) => {
      const next = new URLSearchParams(params);
      mutator(next);
      if (resetPage) next.delete('page');
      setParams(next, { replace: false });
    },
    [params, setParams],
  );

  const toggleValue = useCallback(
    (key, value) => {
      mutate((next) => {
        const current = next.getAll(key);
        next.delete(key);
        const stringValue = String(value);
        const remaining = current.includes(stringValue)
          ? current.filter((entry) => entry !== stringValue)
          : [...current, stringValue];
        remaining.forEach((entry) => next.append(key, entry));
      });
    },
    [mutate],
  );

  const setValue = useCallback(
    (key, value) => {
      mutate((next) => {
        if (value === null || value === '' || value === undefined) next.delete(key);
        else next.set(key, String(value));
      });
    },
    [mutate],
  );

  const setPriceRange = useCallback(
    ([min, max], bounds) => {
      mutate((next) => {
        if (bounds && min <= bounds[0]) next.delete('min');
        else next.set('min', String(min));
        if (bounds && max >= bounds[1]) next.delete('max');
        else next.set('max', String(max));
      });
    },
    [mutate],
  );

  const setPage = useCallback(
    (value) => {
      mutate(
        (next) => {
          if (value <= 1) next.delete('page');
          else next.set('page', String(value));
        },
        { resetPage: false },
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [mutate],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams();
    const q = params.get('q');
    const sortValue = params.get('sort');
    if (q) next.set('q', q);
    if (sortValue) next.set('sort', sortValue);
    setParams(next);
  }, [params, setParams]);

  const removeChip = useCallback(
    (key, value) => {
      if (LIST_KEYS.includes(key)) return toggleValue(key, value);
      return setValue(key, null);
    },
    [setValue, toggleValue],
  );

  const activeCount = useMemo(() => {
    let count = 0;
    LIST_KEYS.forEach((key) => {
      count += params.getAll(key).length;
    });
    FLAG_KEYS.forEach((key) => {
      if (params.get(key) === '1') count += 1;
    });
    if (params.get('min') || params.get('max')) count += 1;
    if (params.get('rating')) count += 1;
    return count;
  }, [params]);

  return {
    filters,
    sort,
    page,
    perPage,
    params,
    activeCount,
    readList,
    toggleValue,
    setValue,
    setPriceRange,
    setPage,
    clearAll,
    removeChip,
  };
}
