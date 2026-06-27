import { SPLIT_COLORS } from '../constants/catalog.js';
import { el } from '../utils/dom.js';
import { renderSplitBar } from './split-bar.js';

export function renderTrackCard(track, onEdit, onDelete) {
  const card = el('div', 'track-card');

  const header = el('div', 'track-card__header');
  const info = el('div');
  const title = el('div', 'track-card__title', track.title);
  info.appendChild(title);
  if (track.isrc) {
    const isrcEl = el('div', 'track-card__isrc', `ISRC: ${track.isrc}`);
    info.appendChild(isrcEl);
  }
  header.appendChild(info);

  const actions = el('div', 'track-card__actions');
  const editBtn = el('button', 'btn btn-xs btn-icon-blue2', 'Edit');
  const delBtn = el('button', 'btn btn-xs btn-icon-red', 'Delete');
  editBtn.addEventListener('click', () => onEdit(track));
  delBtn.addEventListener('click', () => {
    if (confirm(`Delete "${track.title}"?`)) onDelete(track.id);
  });
  actions.append(editBtn, delBtn);
  header.appendChild(actions);
  card.appendChild(header);

  card.appendChild(renderSplitBar(track.splits));

  let expanded = false;
  const toggle = el('button', 'track-card__toggle');
  toggle.textContent = `▼ Show ${track.splits.length} split${track.splits.length !== 1 ? 's' : ''}`;

  const chips = el('div', 'split-chips hidden');
  track.splits.forEach((sp, i) => {
    const chip = el('div', 'split-chip');
    chip.style.borderLeft = `3px solid ${SPLIT_COLORS[i % SPLIT_COLORS.length]}`;
    chip.style.borderColor = SPLIT_COLORS[i % SPLIT_COLORS.length] + '44';
    chip.style.border = `1px solid ${SPLIT_COLORS[i % SPLIT_COLORS.length]}44`;
    chip.style.borderLeft = `3px solid ${SPLIT_COLORS[i % SPLIT_COLORS.length]}`;

    const name = el('div', 'split-chip__name', sp.name);
    const role = el('div', 'split-chip__role', sp.role);
    const pct  = el('div', 'split-chip__pct', `${sp.pct}%`);
    pct.style.color = SPLIT_COLORS[i % SPLIT_COLORS.length];
    chip.append(name, role, pct);
    chips.appendChild(chip);
  });

  toggle.addEventListener('click', () => {
    expanded = !expanded;
    toggle.textContent = `${expanded ? '▲ Hide' : '▼ Show'} ${track.splits.length} split${track.splits.length !== 1 ? 's' : ''}`;
    chips.classList.toggle('hidden', !expanded);
  });

  card.append(toggle, chips);
  return card;
}
