export function validateISRC(code) {
  return /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/.test(code.replace(/-/g, ''));
}

export function formatISRC(code) {
  const c = code.replace(/-/g, '');
  if (c.length < 12) return code;
  return `${c.slice(0, 2)}-${c.slice(2, 5)}-${c.slice(5, 7)}-${c.slice(7)}`;
}

export function ownerClass(owner) {
  if (owner === 'Self-Owned') return 'owner-self';
  if (owner === 'Distributor-Owned') return 'owner-dist';
  return 'owner-unk';
}

export function ownerColor(owner) {
  if (owner === 'Self-Owned') return 'var(--color-green)';
  if (owner === 'Distributor-Owned') return 'var(--color-red)';
  return 'var(--color-muted)';
}
