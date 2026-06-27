/** Secure DOM helpers — textContent only, validated hrefs, no eval. */

export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function safeUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
  } catch (_) { /* fall through */ }
  return '#';
}

export function externalLink(label, url, cls) {
  const a = el('a', cls, label);
  a.href = safeUrl(url);
  a.target = '_blank';
  a.rel = 'noreferrer noopener';
  return a;
}

export function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
