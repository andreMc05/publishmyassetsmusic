-- Migration 000: Base tracks table (prerequisite for lifecycle extension)
-- Run before 001 if bootstrapping a fresh database.

CREATE TABLE IF NOT EXISTS tracks (
  id          UUID PRIMARY KEY,
  title       TEXT NOT NULL,
  isrc        TEXT,
  splits      JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks (created_at);
