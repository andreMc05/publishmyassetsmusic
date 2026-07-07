export const LIFECYCLE_PHASES = [
  'ESCAPE_VELOCITY',
  'SYNC_STAGNATION',
  'RETROACTIVE_RENAISSANCE',
] as const;

export type LifecyclePhase = (typeof LIFECYCLE_PHASES)[number];

export const RECOUPMENT_STATUSES = [
  'RECOUPED',
  'UNRECOUPED_DEBT_BLACK_HOLE',
] as const;

export type RecoupmentStatus = (typeof RECOUPMENT_STATUSES)[number];

export const MILESTONE_YEARS = [15, 20, 25, 30, 35] as const;
export const TERMINATION_YEARS = 35;
export const MILESTONE_LEAD_MONTHS = 6;

export interface AssetFolder {
  has_full_mix: boolean;
  has_instrumental: boolean;
  has_stems_zipped: boolean;
  has_clean_version: boolean;
  has_embedded_metadata: boolean;
  sync_folder_url: string;
}

export interface LifecycleFields {
  release_date: string | null;
  lifecycle_phase: LifecyclePhase;
  recoupment_status: RecoupmentStatus;
  unrecouped_balance: number;
  next_milestone_anniversary: number | null;
  next_milestone_date: string | null;
  termination_rights_date: string | null;
  is_clearance_seamless: boolean;
  ready_for_active_curation: boolean;
  milestone_flagged_at: string | null;
}

export interface Split {
  id: string;
  name: string;
  role: string;
  pct: number;
}

export interface Track {
  id: string;
  title: string;
  isrc: string;
  splits: Split[];
  created_at: string;
  updated_at: string;
  assetFolder: AssetFolder;
  lifecycle: LifecycleFields;
}

export interface LifecycleComputation {
  lifecycle_phase: LifecyclePhase;
  next_milestone_anniversary: number | null;
  next_milestone_date: string | null;
  termination_rights_date: string | null;
  ready_for_active_curation: boolean;
  milestone_flagged_at: string | null;
}
