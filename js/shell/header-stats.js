import { PLATFORMS } from '../constants/platforms.js';
import { el } from '../utils/dom.js';
import { subscribe, getState } from '../state.js';

export function mountHeaderStats(container) {
  function render(s) {
    container.innerHTML = '';
    const totalTracks = s.tracks.length;
    const totalCollabs = new Set(s.tracks.flatMap(t => t.splits.map(sp => sp.name.toLowerCase().trim()))).size;
    const totalISRCs = s.isrcRecords.length;
    const selfOwned = s.isrcRecords.filter(r => r.owner === 'Self-Owned').length;

    [
      [totalTracks,       'TRACKS',        'var(--color-gold)'],
      [totalCollabs,      'COLLABORATORS', 'var(--color-blue)'],
      [totalISRCs,        'ISRCs',         'var(--color-pink)'],
      [selfOwned,         'SELF-OWNED',    'var(--color-green)'],
      [PLATFORMS.length,  'PLATFORMS',     'var(--color-orange)'],
    ].forEach(([val, label, color]) => {
      const stat = el('div', 'stat');
      const v = el('div', 'stat__value', String(val));
      v.style.color = color;
      const l = el('div', 'stat__label', label);
      stat.append(v, l);
      container.appendChild(stat);
    });
  }

  subscribe(render);
  render(getState());
}
