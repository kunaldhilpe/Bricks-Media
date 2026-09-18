const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Rupee amount without decimals: 22129 -> "₹22,129". */
export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return inr.format(Math.round(Number(value)));
}

/** Short form for dashboard tiles: 1240000 -> "12.4L". */
export function formatCompactPrice(value) {
  if (value == null) return '—';
  return `₹${compact.format(Number(value))}`;
}

export function formatNumber(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN').format(Number(value));
}

export function formatDate(value, options) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "3 days ago" / "in 2 hours" for activity feeds. */
export function formatRelative(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const units = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(-Math.round(diff / ms), unit);
  }
  return 'just now';
}

export function pluralise(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function truncate(text = '', max = 120) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
