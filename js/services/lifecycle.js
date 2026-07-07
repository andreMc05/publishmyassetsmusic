import {
  MILESTONE_LEAD_MONTHS,
  MILESTONE_YEARS,
  TERMINATION_YEARS,
} from '../constants/lifecycle.js';

const MS_PER_DAY = 86_400_000;

export function defaultAssetFolder() {
  return {
    has_full_mix: false,
    has_instrumental: false,
    has_stems_zipped: false,
    has_clean_version: false,
    has_embedded_metadata: false,
    sync_folder_url: '',
  };
}

export function defaultLifecycleFields() {
  return {
    release_date: null,
    lifecycle_phase: 'ESCAPE_VELOCITY',
    recoupment_status: 'UNRECOUPED_DEBT_BLACK_HOLE',
    unrecouped_balance: 0,
    next_milestone_anniversary: null,
    next_milestone_date: null,
    termination_rights_date: null,
    is_clearance_seamless: false,
    ready_for_active_curation: false,
    milestone_flagged_at: null,
  };
}

function addYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function yearsSinceRelease(releaseDate, now = new Date()) {
  return (now.getTime() - releaseDate.getTime()) / (MS_PER_DAY * 365.25);
}

export function calculateLifecyclePhase(releaseDate, now = new Date()) {
  const years = yearsSinceRelease(releaseDate, now);
  if (years < 1.5) return 'ESCAPE_VELOCITY';
  if (years < 15) return 'SYNC_STAGNATION';
  return 'RETROACTIVE_RENAISSANCE';
}

export function calculateTerminationDate(releaseDate) {
  return addYears(releaseDate, TERMINATION_YEARS);
}

export function getNextMilestone(releaseDate, now = new Date()) {
  for (const year of MILESTONE_YEARS) {
    const milestoneDate = addYears(releaseDate, year);
    if (milestoneDate.getTime() > now.getTime()) {
      return { anniversary: year, milestoneDate };
    }
  }
  return { anniversary: null, milestoneDate: null };
}

function isMilestoneWithinLeadWindow(milestoneDate, now = new Date()) {
  const leadStart = addMonths(milestoneDate, -MILESTONE_LEAD_MONTHS);
  return now.getTime() >= leadStart.getTime() && now.getTime() < milestoneDate.getTime();
}

export function computeLifecycleFields(releaseDateIso, existing = {}, now = new Date()) {
  if (!releaseDateIso) {
    return {
      lifecycle_phase: existing.lifecycle_phase ?? 'ESCAPE_VELOCITY',
      next_milestone_anniversary: null,
      next_milestone_date: null,
      termination_rights_date: null,
      ready_for_active_curation: false,
      milestone_flagged_at: existing.milestone_flagged_at ?? null,
    };
  }

  const releaseDate = new Date(releaseDateIso);
  if (Number.isNaN(releaseDate.getTime())) {
    throw new Error('Invalid release_date');
  }

  const lifecycle_phase = calculateLifecyclePhase(releaseDate, now);
  const termination_rights_date = calculateTerminationDate(releaseDate).toISOString();
  const { anniversary, milestoneDate } = getNextMilestone(releaseDate, now);

  let ready_for_active_curation = false;
  let milestone_flagged_at = existing.milestone_flagged_at ?? null;

  if (milestoneDate && isMilestoneWithinLeadWindow(milestoneDate, now)) {
    ready_for_active_curation = true;
    if (!milestone_flagged_at) milestone_flagged_at = now.toISOString();
  } else if (milestoneDate && now.getTime() >= milestoneDate.getTime()) {
    ready_for_active_curation = true;
    if (!milestone_flagged_at) milestone_flagged_at = milestoneDate.toISOString();
  }

  return {
    lifecycle_phase,
    next_milestone_anniversary: anniversary,
    next_milestone_date: milestoneDate?.toISOString() ?? null,
    termination_rights_date,
    ready_for_active_curation,
    milestone_flagged_at,
  };
}

export function isSyncReady(assetFolder) {
  return (
    assetFolder.has_full_mix &&
    assetFolder.has_instrumental &&
    assetFolder.has_stems_zipped &&
    assetFolder.has_clean_version &&
    assetFolder.has_embedded_metadata
  );
}

export function hasSyncWindowAlert(lifecyclePhase, assetFolder, isClearanceSeamless) {
  return lifecyclePhase === 'SYNC_STAGNATION' &&
    (!isClearanceSeamless || !assetFolder.has_instrumental);
}

export function getTerminationCountdown(terminationDateIso, now = new Date()) {
  if (!terminationDateIso) {
    return { totalDays: 0, remainingDays: 0, elapsedPct: 0, isExpired: false };
  }

  const termination = new Date(terminationDateIso);
  const release = addYears(termination, -TERMINATION_YEARS);
  const totalMs = termination.getTime() - release.getTime();
  const elapsedMs = now.getTime() - release.getTime();
  const remainingMs = Math.max(0, termination.getTime() - now.getTime());

  return {
    totalDays: Math.round(totalMs / MS_PER_DAY),
    remainingDays: Math.round(remainingMs / MS_PER_DAY),
    elapsedPct: Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)),
    isExpired: now.getTime() >= termination.getTime(),
  };
}

export function enrichTrackLifecycle(track, now = new Date()) {
  const assetFolder = { ...defaultAssetFolder(), ...track.assetFolder };
  const lifecycleBase = { ...defaultLifecycleFields(), ...track.lifecycle };
  const computed = computeLifecycleFields(lifecycleBase.release_date, lifecycleBase, now);

  return {
    ...track,
    assetFolder,
    lifecycle: { ...lifecycleBase, ...computed },
    syncReady: isSyncReady(assetFolder),
  };
}

export function refreshAllTracksLifecycle(tracks, now = new Date()) {
  return tracks.map(t => enrichTrackLifecycle(t, now));
}

const LIFECYCLE_CRON_KEY = 'pma-lifecycle-last-run';
const ONE_DAY_MS = 86_400_000;

export function shouldRunDailyLifecycleSync() {
  try {
    const last = localStorage.getItem(LIFECYCLE_CRON_KEY);
    if (!last) return true;
    return Date.now() - Number(last) >= ONE_DAY_MS;
  } catch (_) {
    return true;
  }
}

export function markLifecycleSyncRun() {
  try {
    localStorage.setItem(LIFECYCLE_CRON_KEY, String(Date.now()));
  } catch (_) { /* ignore */ }
}
