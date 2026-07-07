import {
  LIFECYCLE_PHASES,
  MILESTONE_LEAD_MONTHS,
  MILESTONE_YEARS,
  TERMINATION_YEARS,
  type AssetFolder,
  type LifecycleComputation,
  type LifecycleFields,
  type LifecyclePhase,
} from '../types.js';

const MS_PER_DAY = 86_400_000;

export function defaultAssetFolder(): AssetFolder {
  return {
    has_full_mix: false,
    has_instrumental: false,
    has_stems_zipped: false,
    has_clean_version: false,
    has_embedded_metadata: false,
    sync_folder_url: '',
  };
}

export function defaultLifecycleFields(): LifecycleFields {
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

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function yearsSinceRelease(releaseDate: Date, now = new Date()): number {
  const ms = now.getTime() - releaseDate.getTime();
  return ms / (MS_PER_DAY * 365.25);
}

export function calculateLifecyclePhase(releaseDate: Date, now = new Date()): LifecyclePhase {
  const years = yearsSinceRelease(releaseDate, now);

  if (years < 1.5) return 'ESCAPE_VELOCITY';
  if (years < 15) return 'SYNC_STAGNATION';
  if (years <= TERMINATION_YEARS) return 'RETROACTIVE_RENAISSANCE';
  return 'RETROACTIVE_RENAISSANCE';
}

export function calculateTerminationDate(releaseDate: Date): Date {
  return addYears(releaseDate, TERMINATION_YEARS);
}

export function getNextMilestone(releaseDate: Date, now = new Date()): {
  anniversary: number | null;
  milestoneDate: Date | null;
} {
  for (const year of MILESTONE_YEARS) {
    const milestoneDate = addYears(releaseDate, year);
    if (milestoneDate.getTime() > now.getTime()) {
      return { anniversary: year, milestoneDate };
    }
  }
  return { anniversary: null, milestoneDate: null };
}

export function isMilestoneWithinLeadWindow(
  milestoneDate: Date,
  now = new Date(),
  leadMonths = MILESTONE_LEAD_MONTHS,
): boolean {
  const leadStart = addMonths(milestoneDate, -leadMonths);
  return now.getTime() >= leadStart.getTime() && now.getTime() < milestoneDate.getTime();
}

export function computeLifecycleFields(
  releaseDateIso: string | null,
  existing: Partial<LifecycleFields> = {},
  now = new Date(),
): LifecycleComputation {
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
    if (!milestone_flagged_at) {
      milestone_flagged_at = now.toISOString();
    }
  } else if (milestoneDate && now.getTime() >= milestoneDate.getTime()) {
    ready_for_active_curation = true;
    if (!milestone_flagged_at) {
      milestone_flagged_at = milestoneDate.toISOString();
    }
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

export function isSyncReady(assetFolder: AssetFolder): boolean {
  return (
    assetFolder.has_full_mix &&
    assetFolder.has_instrumental &&
    assetFolder.has_stems_zipped &&
    assetFolder.has_clean_version &&
    assetFolder.has_embedded_metadata
  );
}

export function hasSyncWindowAlert(
  lifecyclePhase: LifecyclePhase,
  assetFolder: AssetFolder,
  isClearanceSeamless: boolean,
): boolean {
  return lifecyclePhase === 'SYNC_STAGNATION' &&
    (!isClearanceSeamless || !assetFolder.has_instrumental);
}

export function getTerminationCountdown(terminationDateIso: string | null, now = new Date()): {
  totalDays: number;
  remainingDays: number;
  elapsedPct: number;
  isExpired: boolean;
} {
  if (!terminationDateIso) {
    return { totalDays: 0, remainingDays: 0, elapsedPct: 0, isExpired: false };
  }

  const termination = new Date(terminationDateIso);
  const release = addYears(termination, -TERMINATION_YEARS);
  const totalMs = termination.getTime() - release.getTime();
  const elapsedMs = now.getTime() - release.getTime();
  const remainingMs = Math.max(0, termination.getTime() - now.getTime());

  const totalDays = Math.round(totalMs / MS_PER_DAY);
  const remainingDays = Math.round(remainingMs / MS_PER_DAY);
  const elapsedPct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

  return {
    totalDays,
    remainingDays,
    elapsedPct,
    isExpired: now.getTime() >= termination.getTime(),
  };
}

export function assertLifecyclePhase(value: string): asserts value is LifecyclePhase {
  if (!LIFECYCLE_PHASES.includes(value as LifecyclePhase)) {
    throw new Error(`Invalid lifecycle_phase: ${value}`);
  }
}
