import { useEffect } from 'react';

const SUFFIX = 'BRICKS Media';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : `${SUFFIX} — Premium Clothing Collection`;
  }, [title]);
}
