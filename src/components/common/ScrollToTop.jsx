import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Route changes should start at the top; filter changes should not. */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
