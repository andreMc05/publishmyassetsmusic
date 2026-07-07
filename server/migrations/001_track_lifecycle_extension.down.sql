-- Migration 001 down: remove lifecycle & asset readiness columns

ALTER TABLE tracks
  DROP COLUMN IF EXISTS has_full_mix,
  DROP COLUMN IF EXISTS has_instrumental,
  DROP COLUMN IF EXISTS has_stems_zipped,
  DROP COLUMN IF EXISTS has_clean_version,
  DROP COLUMN IF EXISTS has_embedded_metadata,
  DROP COLUMN IF EXISTS sync_folder_url,
  DROP COLUMN IF EXISTS release_date,
  DROP COLUMN IF EXISTS lifecycle_phase,
  DROP COLUMN IF EXISTS recoupment_status,
  DROP COLUMN IF EXISTS unrecouped_balance,
  DROP COLUMN IF EXISTS next_milestone_anniversary,
  DROP COLUMN IF EXISTS next_milestone_date,
  DROP COLUMN IF EXISTS termination_rights_date,
  DROP COLUMN IF EXISTS is_clearance_seamless,
  DROP COLUMN IF EXISTS ready_for_active_curation,
  DROP COLUMN IF EXISTS milestone_flagged_at;

DROP TYPE IF EXISTS lifecycle_phase;
DROP TYPE IF EXISTS recoupment_status;
