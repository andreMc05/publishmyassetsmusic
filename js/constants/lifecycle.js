export const LIFECYCLE_PHASES = [
  'ESCAPE_VELOCITY',
  'SYNC_STAGNATION',
  'RETROACTIVE_RENAISSANCE',
];

export const RECOUPMENT_STATUSES = [
  'RECOUPED',
  'UNRECOUPED_DEBT_BLACK_HOLE',
];

export const MILESTONE_YEARS = [15, 20, 25, 30, 35];
export const TERMINATION_YEARS = 35;
export const MILESTONE_LEAD_MONTHS = 6;

export const PHASE_LABELS = {
  ESCAPE_VELOCITY: 'Phase 1: Escape Velocity',
  SYNC_STAGNATION: 'Phase 2: Sync / Stagnation',
  RETROACTIVE_RENAISSANCE: 'Phase 3: Retroactive Renaissance',
};

export const PHASE_RANGES = {
  ESCAPE_VELOCITY: 'Months 0–18',
  SYNC_STAGNATION: 'Years 1.5–15',
  RETROACTIVE_RENAISSANCE: 'Years 15–35',
};

export const ASSET_CHECKLIST_ITEMS = [
  { key: 'has_full_mix', label: 'Full Mix' },
  { key: 'has_instrumental', label: 'Instrumental' },
  { key: 'has_stems_zipped', label: 'Stems (Zipped)' },
  { key: 'has_clean_version', label: 'Clean Version' },
  { key: 'has_embedded_metadata', label: 'Embedded ID3 / AIF Tags' },
];

export const RECOUPMENT_LABELS = {
  RECOUPED: 'Recouped',
  UNRECOUPED_DEBT_BLACK_HOLE: 'Unrecouped — Debt Black Hole',
};
