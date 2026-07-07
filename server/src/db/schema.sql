-- SQLite bootstrap schema (mirrors PostgreSQL migrations for local API)

CREATE TABLE IF NOT EXISTS tracks (
  id                          TEXT PRIMARY KEY,
  title                       TEXT NOT NULL,
  isrc                        TEXT,
  splits                      TEXT NOT NULL DEFAULT '[]',
  created_at                  TEXT NOT NULL,
  updated_at                  TEXT NOT NULL,

  has_full_mix                INTEGER NOT NULL DEFAULT 0,
  has_instrumental            INTEGER NOT NULL DEFAULT 0,
  has_stems_zipped            INTEGER NOT NULL DEFAULT 0,
  has_clean_version           INTEGER NOT NULL DEFAULT 0,
  has_embedded_metadata       INTEGER NOT NULL DEFAULT 0,
  sync_folder_url             TEXT,

  release_date                TEXT,
  lifecycle_phase             TEXT NOT NULL DEFAULT 'ESCAPE_VELOCITY',
  recoupment_status           TEXT NOT NULL DEFAULT 'UNRECOUPED_DEBT_BLACK_HOLE',
  unrecouped_balance          REAL NOT NULL DEFAULT 0,

  next_milestone_anniversary  INTEGER,
  next_milestone_date         TEXT,
  termination_rights_date     TEXT,
  is_clearance_seamless       INTEGER NOT NULL DEFAULT 0,
  ready_for_active_curation   INTEGER NOT NULL DEFAULT 0,
  milestone_flagged_at        TEXT
);

CREATE INDEX IF NOT EXISTS idx_tracks_lifecycle_phase ON tracks (lifecycle_phase);
CREATE INDEX IF NOT EXISTS idx_tracks_release_date ON tracks (release_date);
