import { PHASE_LABELS, PHASE_RANGES, MILESTONE_YEARS } from '../constants/lifecycle.js';
import { hasSyncWindowAlert } from '../services/lifecycle.js';
import { el } from '../utils/dom.js';

function yearsSinceReleaseLocal(releaseDateIso) {
  if (!releaseDateIso) return 0;
  const release = new Date(releaseDateIso);
  return (Date.now() - release.getTime()) / (86_400_000 * 365.25);
}

export function renderLifecycleTimeline(track) {
  const wrap = el('div', 'lifecycle-timeline');
  const phase = track.lifecycle?.lifecycle_phase ?? 'ESCAPE_VELOCITY';
  const releaseDate = track.lifecycle?.release_date;
  const years = releaseDate ? yearsSinceReleaseLocal(releaseDate) : null;

  const header = el('div', 'lifecycle-timeline__header');
  header.append(
    el('span', 'lifecycle-timeline__title', 'Life Cycle Timeline'),
    el('span', 'lifecycle-timeline__phase', PHASE_LABELS[phase] ?? phase),
  );
  wrap.appendChild(header);

  const phases = ['ESCAPE_VELOCITY', 'SYNC_STAGNATION', 'RETROACTIVE_RENAISSANCE'];
  const rail = el('div', 'lifecycle-timeline__rail');

  phases.forEach(p => {
    const node = el('div', `lifecycle-timeline__node${p === phase ? ' active' : ''}${phases.indexOf(p) < phases.indexOf(phase) ? ' past' : ''}`);
    const dot = el('div', 'lifecycle-timeline__dot');
    const label = el('div', 'lifecycle-timeline__node-label', PHASE_LABELS[p].replace(/^Phase \d+: /, ''));
    const range = el('div', 'lifecycle-timeline__node-range', PHASE_RANGES[p]);
    node.append(dot, label, range);
    rail.appendChild(node);
  });
  wrap.appendChild(rail);

  if (releaseDate && years != null) {
    const meta = el('div', 'lifecycle-timeline__meta');
    meta.textContent = `${years.toFixed(1)} years since release · Next heartbeat: ${
      track.lifecycle.next_milestone_anniversary
        ? `Year ${track.lifecycle.next_milestone_anniversary}`
        : 'Past final milestone'
    }`;
    wrap.appendChild(meta);
  } else {
    wrap.appendChild(el('p', 'lifecycle-timeline__empty', 'Set a release date to activate the timeline.'));
  }

  if (track.lifecycle?.ready_for_active_curation) {
    const curation = el('div', 'lifecycle-timeline__curation-alert');
    curation.textContent = '★ Ready for Active Curation — milestone window open for vinyl, merch, or remix campaigns.';
    wrap.appendChild(curation);
  }

  const assetFolder = track.assetFolder ?? {};
  if (hasSyncWindowAlert(phase, assetFolder, track.lifecycle?.is_clearance_seamless)) {
    const alert = el('div', 'lifecycle-timeline__sync-alert');
    alert.textContent = '⚠ Sync window active but clearance path incomplete — add instrumental and mark seamless clearance.';
    wrap.appendChild(alert);
  }

  const milestones = el('div', 'lifecycle-timeline__milestones');
  MILESTONE_YEARS.forEach(year => {
    const chip = el('span', `lifecycle-timeline__milestone${
      track.lifecycle?.next_milestone_anniversary === year ? ' next' : ''
    }${releaseDate && yearsSinceReleaseLocal(releaseDate) >= year ? ' reached' : ''}`);
    chip.textContent = `Yr ${year}`;
    milestones.appendChild(chip);
  });
  wrap.appendChild(milestones);

  return wrap;
}
