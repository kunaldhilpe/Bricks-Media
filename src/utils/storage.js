const PREFIX = 'BRICKS Media';

/** localStorage wrapped so a private-mode browser or a bad value never throws. */
export const storage = {
  key: (name) => `${PREFIX}.${name}`,

  read(name, fallback = null) {
    try {
      const raw = window.localStorage.getItem(storage.key(name));
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  write(name, value) {
    try {
      window.localStorage.setItem(storage.key(name), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(name) {
    try {
      window.localStorage.removeItem(storage.key(name));
    } catch {
      /* ignore */
    }
  },

  clearAll() {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith(`${PREFIX}.`))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  },
};

export default storage;
