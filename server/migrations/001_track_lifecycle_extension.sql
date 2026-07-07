-- Migration 001: Track Life Cycle & Asset Readiness Module
-- Up: extend tracks table with asset folder checklist and lifecycle fields

CREATE TYPE lifecycle_phase AS ENUM (
  'ESCAPE_VELOCITY',
  'SYNC_STAGNATION',
  'RETROACTIVE_RENAISSANCE'
);

CREATE TYPE recoupment_status AS ENUM (
  'RECOUPED',
  'UNRECOUPED_DEBT_BLACK_HOLE'
);

ALTER TABLE tracks
  -- Track Asset Folder (Sync & Sample Ready Checklist)
  ADD COLUMN has_full_mix            BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN has_instrumental        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN has_stems_zipped        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN has_clean_version       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN has_embedded_metadata   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN sync_folder_url         TEXT,

  -- Life Cycle Time & Performance Tracking
  ADD COLUMN release_date            TIMESTAMPTZ,
  ADD COLUMN lifecycle_phase         lifecycle_phase NOT NULL DEFAULT 'ESCAPE_VELOCITY',
  ADD COLUMN recoupment_status       recoupment_status NOT NULL DEFAULT 'UNRECOUPED_DEBT_BLACK_HOLE',
  ADD COLUMN unrecouped_balance      NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Anniversary & Sampling Triggers
  ADD COLUMN next_milestone_anniversary INTEGER,
  ADD COLUMN next_milestone_date        TIMESTAMPTZ,
  ADD COLUMN termination_rights_date    TIMESTAMPTZ,
  ADD COLUMN is_clearance_seamless      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN ready_for_active_curation  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN milestone_flagged_at       TIMESTAMPTZ;

CREATE INDEX idx_tracks_lifecycle_phase ON tracks (lifecycle_phase);
CREATE INDEX idx_tracks_release_date ON tracks (release_date);
CREATE INDEX idx_tracks_next_milestone_date ON tracks (next_milestone_date);
CREATE INDEX idx_tracks_ready_for_curation ON tracks (ready_for_active_curation)
  WHERE ready_for_active_curation = TRUE;
