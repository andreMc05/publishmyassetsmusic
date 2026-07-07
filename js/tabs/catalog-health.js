import { el } from '../utils/dom.js';
import { getState, subscribe } from '../state.js';
import { enrichTrackLifecycle, isSyncReady } from '../services/lifecycle.js';
import { renderAssetReadinessBar } from '../components/asset-readiness-bar.js';
import { renderLifecycleTimeline } from '../components/lifecycle-timeline.js';
import { renderTerminationTracker } from '../components/termination-tracker.js';

export function mountCatalogHealthTab(container) {
  function render(s) {
    if (s.activeTab !== 'catalog') return;

    container.innerHTML = '';

    const header = el('div', 'page-header');
    header.append(
      el('h2', 'page-title', 'Catalog Architecture & Asset Health'),
      el('p', 'page-subtitle', 'Track life cycle phases, sync readiness, and termination rights across your catalog.'),
    );
    container.appendChild(header);

    if (s.tracks.length === 0) {
      const empty = el('div', 'card-dashed');
      empty.append(
        el('span', 'empty-icon', '📊'),
        el('p', 'empty-text', 'Add tracks in Splits Tracker to monitor asset health and life cycle status.'),
      );
      container.appendChild(empty);
      return;
    }

    const summary = el('div', 'catalog-summary card-sm');
    const enriched = s.tracks.map(t => enrichTrackLifecycle(t));
    const syncReadyCount = enriched.filter(t => isSyncReady(t.assetFolder)).length;
    const curationCount = enriched.filter(t => t.lifecycle.ready_for_active_curation).length;
    const alertCount = enriched.filter(t =>
      t.lifecycle.lifecycle_phase === 'SYNC_STAGNATION' &&
      (!t.lifecycle.is_clearance_seamless || !t.assetFolder.has_instrumental)
    ).length;

    [
      [`${syncReadyCount}/${enriched.length}`, 'Sync Ready', 'var(--color-green)'],
      [String(curationCount), 'Curation Windows', 'var(--color-gold)'],
      [String(alertCount), 'Sync Alerts', 'var(--color-red)'],
    ].forEach(([val, label, color]) => {
      const stat = el('div', 'catalog-summary__stat');
      const v = el('div', 'catalog-summary__value', val);
      v.style.color = color;
      stat.append(v, el('div', 'catalog-summary__label', label));
      summary.appendChild(stat);
    });
    container.appendChild(summary);

    enriched.forEach(track => {
      const card = el('article', 'catalog-track card');
      const cardHeader = el('div', 'catalog-track__header');
      cardHeader.append(
        el('h3', 'catalog-track__title', track.title),
        track.syncReady
          ? el('span', 'catalog-track__badge catalog-track__badge--ready', 'Sync Ready')
          : el('span', 'catalog-track__badge', 'In Progress'),
      );
      if (track.lifecycle.ready_for_active_curation) {
        cardHeader.appendChild(el('span', 'catalog-track__badge catalog-track__badge--curation', 'Active Curation'));
      }
      card.appendChild(cardHeader);

      const grid = el('div', 'catalog-track__grid');
      grid.append(
        renderAssetReadinessBar(track.assetFolder),
        renderLifecycleTimeline(track),
        renderTerminationTracker(track),
      );
      card.appendChild(grid);
      container.appendChild(card);
    });
  }

  subscribe(render);
  render(getState());
}
