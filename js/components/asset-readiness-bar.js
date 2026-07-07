import { ASSET_CHECKLIST_ITEMS } from '../constants/lifecycle.js';
import { isSyncReady } from '../services/lifecycle.js';
import { el } from '../utils/dom.js';

export function renderAssetReadinessBar(assetFolder, { compact = false } = {}) {
  const wrap = el('div', `asset-readiness${compact ? ' asset-readiness--compact' : ''}`);

  const total = ASSET_CHECKLIST_ITEMS.length;
  const done = ASSET_CHECKLIST_ITEMS.filter(item => assetFolder[item.key]).length;
  const pct = Math.round((done / total) * 100);
  const syncReady = isSyncReady(assetFolder);

  const header = el('div', 'asset-readiness__header');
  const title = el('span', 'asset-readiness__title', 'Asset Readiness');
  const badge = el('span', `asset-readiness__badge${syncReady ? ' asset-readiness__badge--ready' : ''}`,
    syncReady ? '✓ Sync Ready' : `${pct}% Ready`);
  header.append(title, badge);
  wrap.appendChild(header);

  const barTrack = el('div', 'asset-readiness__track');
  const barFill = el('div', 'asset-readiness__fill');
  barFill.style.width = `${pct}%`;
  if (syncReady) barFill.classList.add('asset-readiness__fill--complete');
  barTrack.appendChild(barFill);
  wrap.appendChild(barTrack);

  const list = el('ul', 'asset-readiness__list');
  ASSET_CHECKLIST_ITEMS.forEach(item => {
    const li = el('li', `asset-readiness__item${assetFolder[item.key] ? ' done' : ''}`);
    const check = el('span', 'asset-readiness__check', assetFolder[item.key] ? '✓' : '○');
    const label = el('span', 'asset-readiness__label', item.label);
    li.append(check, label);
    list.appendChild(li);
  });
  wrap.appendChild(list);

  return wrap;
}
