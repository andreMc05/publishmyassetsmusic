import { el } from '../utils/dom.js';
import { validateISRC, formatISRC, ownerClass, ownerColor } from '../utils/isrc.js';

export function renderISRCRow(rec, tracks, onEdit, onDelete) {
  const row = el('div', `isrc-row ${ownerClass(rec.owner)}`);

  const top = el('div', 'isrc-row__top');
  const info = el('div');
  const titleRow = el('div', 'flex items-center gap-2 flex-wrap');
  const title = el('span', 'isrc-row__title', rec.title);
  titleRow.appendChild(title);
  if (rec.version !== 'Original') {
    const badge = el('span', 'isrc-row__version-badge', rec.version);
    titleRow.appendChild(badge);
  }
  info.appendChild(titleRow);
  if (rec.artist) {
    const meta = el('div', 'isrc-row__meta', `${rec.artist} · ${rec.year}`);
    info.appendChild(meta);
  }
  top.appendChild(info);

  const actions = el('div', 'flex gap-2 items-center');
  const editBtn = el('button', 'btn btn-xs btn-icon-blue2', 'Edit');
  const delBtn = el('button', 'btn btn-xs btn-icon-red', 'Delete');
  editBtn.addEventListener('click', () => onEdit(rec));
  delBtn.addEventListener('click', () => {
    if (confirm(`Delete ISRC record "${rec.title}"?`)) onDelete(rec.id);
  });
  actions.append(editBtn, delBtn);
  top.appendChild(actions);
  row.appendChild(top);

  // Badges
  const badges = el('div', 'isrc-badges');

  // ISRC badge
  const isrcBadge = el('div', 'isrc-badge');
  const isrcLbl = el('div', 'isrc-badge__label', 'ISRC');
  const isrcVal = el('div', 'isrc-badge__val');
  const valid = rec.isrc && validateISRC(rec.isrc);
  isrcVal.textContent = rec.isrc ? formatISRC(rec.isrc) : '—';
  isrcVal.style.color = rec.isrc ? (valid ? 'var(--color-text)' : 'var(--color-red)') : 'var(--color-muted)';
  isrcBadge.append(isrcLbl, isrcVal);
  badges.appendChild(isrcBadge);

  // Ownership badge
  const ownBadge = el('div', 'isrc-badge');
  ownBadge.style.background = ownerColor(rec.owner) + '18';
  ownBadge.style.borderColor = ownerColor(rec.owner) + '44';
  ownBadge.style.borderStyle = 'solid';
  ownBadge.style.borderWidth = '1px';
  const ownLbl = el('div', 'isrc-badge__label', 'Ownership');
  const ownVal = el('div', 'isrc-badge__val', rec.owner);
  ownVal.style.color = ownerColor(rec.owner);
  ownVal.style.fontWeight = 'var(--weight-bold)';
  ownBadge.append(ownLbl, ownVal);
  badges.appendChild(ownBadge);

  if (rec.registrant) {
    const regBadge = el('div', 'isrc-badge');
    const regLbl = el('div', 'isrc-badge__label', 'Registrant');
    const regVal = el('div', 'isrc-badge__val', rec.registrant);
    regVal.style.color = 'var(--color-pink)';
    regBadge.append(regLbl, regVal);
    badges.appendChild(regBadge);
  }

  if (rec.upc) {
    const upcBadge = el('div', 'isrc-badge');
    const upcLbl = el('div', 'isrc-badge__label', `UPC · ${rec.upcOwner}`);
    const upcVal = el('div', 'isrc-badge__val', rec.upc);
    upcVal.style.color = ownerColor(rec.upcOwner);
    upcBadge.append(upcLbl, upcVal);
    badges.appendChild(upcBadge);
  }

  if (rec.linkedTrackId) {
    const linked = tracks.find(t => t.id === rec.linkedTrackId);
    if (linked) {
      const lkBadge = el('div', 'isrc-badge');
      lkBadge.style.background = 'rgba(91,127,166,.15)';
      const lkLbl = el('div', 'isrc-badge__label', 'Linked Track');
      const lkVal = el('div', 'isrc-badge__val');
      lkVal.textContent = `🔗 ${linked.title}`;
      lkVal.style.color = 'var(--color-blue)';
      lkBadge.append(lkLbl, lkVal);
      badges.appendChild(lkBadge);
    }
  }

  row.appendChild(badges);

  if (rec.notes) {
    const notes = el('div', 'isrc-row__notes', `📝 ${rec.notes}`);
    row.appendChild(notes);
  }

  return row;
}
