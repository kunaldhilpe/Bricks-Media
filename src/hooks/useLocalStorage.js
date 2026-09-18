import { useCallback, useState } from 'react';
import storage from '@/utils/storage';

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => storage.read(key, initialValue));

  const update = useCallback(
    (next) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? next(current) : next;
        storage.write(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    storage.remove(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, update, reset];
}
