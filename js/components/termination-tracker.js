import { MILESTONE_YEARS, TERMINATION_YEARS } from '../constants/lifecycle.js';
import { getTerminationCountdown } from '../services/lifecycle.js';
import { el } from '../utils/dom.js';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function renderTerminationTracker(track) {
  const wrap = el('div', 'termination-tracker');
  const terminationDate = track.lifecycle?.termination_rights_date;
  const releaseDate = track.lifecycle?.release_date;
  const countdown = getTerminationCountdown(terminationDate);

  const header = el('div', 'termination-tracker__header');
  header.append(
    el('span', 'termination-tracker__title', `${TERMINATION_YEARS}-Year Termination Clock`),
    el('span', 'termination-tracker__subtitle', 'Distribution lease lifespan'),
  );
  wrap.appendChild(header);

  if (!releaseDate || !terminationDate) {
    wrap.appendChild(el('p', 'termination-tracker__empty', 'Add a release date to start the termination countdown.'));
    return wrap;
  }

  const gauge = el('div', 'termination-tracker__gauge');
  const ring = el('div', 'termination-tracker__ring');
  const inner = el('div', 'termination-tracker__ring-inner');
  const pctLabel = el('div', 'termination-tracker__pct', `${Math.round(countdown.elapsedPct)}%`);
  const daysLabel = el('div', 'termination-tracker__days',
    countdown.isExpired ? 'Rights Returned' : `${countdown.remainingDays.toLocaleString()} days left`);
  inner.append(pctLabel, daysLabel);
  ring.appendChild(inner);
  ring.style.background = `conic-gradient(var(--color-gold) ${countdown.elapsedPct}%, var(--color-border) 0)`;
  gauge.appendChild(ring);
  wrap.appendChild(gauge);

  const dates = el('div', 'termination-tracker__dates');
  dates.append(
    el('div', 'termination-tracker__date-row', `Release: ${formatDate(releaseDate)}`),
    el('div', 'termination-tracker__date-row', `Termination: ${formatDate(terminationDate)}`),
  );
  wrap.appendChild(dates);

  if (countdown.isExpired) {
    const expired = el('div', 'termination-tracker__expired');
    expired.textContent = 'Termination rights window — review distribution leases and reclaim exploitation cycles.';
    wrap.appendChild(expired);
  } else if (countdown.elapsedPct >= 75) {
    const warn = el('div', 'termination-tracker__warn');
    warn.textContent = 'Lease nearing liquidation — pitch sample loops and acapellas to prevent catalog debris.';
    wrap.appendChild(warn);
  }

  const milestoneRow = el('div', 'termination-tracker__milestones');
  MILESTONE_YEARS.forEach(year => {
    const release = new Date(releaseDate);
    const milestoneAt = new Date(release);
    milestoneAt.setFullYear(milestoneAt.getFullYear() + year);
    const reached = Date.now() >= milestoneAt.getTime();
    const chip = el('span', `termination-tracker__chip${reached ? ' reached' : ''}`, `Y${year}`);
    chip.title = formatDate(milestoneAt.toISOString());
    milestoneRow.appendChild(chip);
  });
  wrap.appendChild(milestoneRow);

  return wrap;
}
