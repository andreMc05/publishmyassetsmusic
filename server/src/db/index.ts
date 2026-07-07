import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AssetFolder, LifecycleFields, Split, Track } from '../types.js';
import {
  computeLifecycleFields,
  defaultAssetFolder,
  defaultLifecycleFields,
} from '../services/lifecycle.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '../../data/pma-music.db');

let db: Database.Database | null = null;

function boolToInt(v: boolean): number {
  return v ? 1 : 0;
}

function intToBool(v: number | null | undefined): boolean {
  return v === 1;
}

function rowToTrack(row: Record<string, unknown>): Track {
  const assetFolder: AssetFolder = {
    has_full_mix: intToBool(row.has_full_mix as number),
    has_instrumental: intToBool(row.has_instrumental as number),
    has_stems_zipped: intToBool(row.has_stems_zipped as number),
    has_clean_version: intToBool(row.has_clean_version as number),
    has_embedded_metadata: intToBool(row.has_embedded_metadata as number),
    sync_folder_url: (row.sync_folder_url as string) ?? '',
  };

  const lifecycle: LifecycleFields = {
    release_date: (row.release_date as string) ?? null,
    lifecycle_phase: (row.lifecycle_phase as LifecycleFields['lifecycle_phase']) ?? 'ESCAPE_VELOCITY',
    recoupment_status: (row.recoupment_status as LifecycleFields['recoupment_status']) ?? 'UNRECOUPED_DEBT_BLACK_HOLE',
    unrecouped_balance: Number(row.unrecouped_balance ?? 0),
    next_milestone_anniversary: row.next_milestone_anniversary != null
      ? Number(row.next_milestone_anniversary)
      : null,
    next_milestone_date: (row.next_milestone_date as string) ?? null,
    termination_rights_date: (row.termination_rights_date as string) ?? null,
    is_clearance_seamless: intToBool(row.is_clearance_seamless as number),
    ready_for_active_curation: intToBool(row.ready_for_active_curation as number),
    milestone_flagged_at: (row.milestone_flagged_at as string) ?? null,
  };

  return {
    id: row.id as string,
    title: row.title as string,
    isrc: (row.isrc as string) ?? '',
    splits: JSON.parse((row.splits as string) || '[]') as Split[],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    assetFolder,
    lifecycle,
  };
}

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  return db;
}

export function listTracks(): Track[] {
  const rows = getDb().prepare('SELECT * FROM tracks ORDER BY created_at DESC').all();
  return rows.map(r => rowToTrack(r as Record<string, unknown>));
}

export function getTrackById(id: string): Track | null {
  const row = getDb().prepare('SELECT * FROM tracks WHERE id = ?').get(id);
  return row ? rowToTrack(row as Record<string, unknown>) : null;
}

export function upsertTrack(input: Partial<Track> & { id: string; title: string; splits: Split[] }): Track {
  const now = new Date().toISOString();
  const existing = getTrackById(input.id);
  const assetFolder = { ...defaultAssetFolder(), ...existing?.assetFolder, ...input.assetFolder };
  const lifecycleBase = { ...defaultLifecycleFields(), ...existing?.lifecycle, ...input.lifecycle };

  const computed = computeLifecycleFields(lifecycleBase.release_date, lifecycleBase);
  const lifecycle: LifecycleFields = { ...lifecycleBase, ...computed };

  const track: Track = {
    id: input.id,
    title: input.title,
    isrc: input.isrc ?? existing?.isrc ?? '',
    splits: input.splits,
    created_at: input.created_at ?? existing?.created_at ?? now,
    updated_at: now,
    assetFolder,
    lifecycle,
  };

  getDb().prepare(`
    INSERT INTO tracks (
      id, title, isrc, splits, created_at, updated_at,
      has_full_mix, has_instrumental, has_stems_zipped, has_clean_version,
      has_embedded_metadata, sync_folder_url,
      release_date, lifecycle_phase, recoupment_status, unrecouped_balance,
      next_milestone_anniversary, next_milestone_date, termination_rights_date,
      is_clearance_seamless, ready_for_active_curation, milestone_flagged_at
    ) VALUES (
      @id, @title, @isrc, @splits, @created_at, @updated_at,
      @has_full_mix, @has_instrumental, @has_stems_zipped, @has_clean_version,
      @has_embedded_metadata, @sync_folder_url,
      @release_date, @lifecycle_phase, @recoupment_status, @unrecouped_balance,
      @next_milestone_anniversary, @next_milestone_date, @termination_rights_date,
      @is_clearance_seamless, @ready_for_active_curation, @milestone_flagged_at
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      isrc = excluded.isrc,
      splits = excluded.splits,
      updated_at = excluded.updated_at,
      has_full_mix = excluded.has_full_mix,
      has_instrumental = excluded.has_instrumental,
      has_stems_zipped = excluded.has_stems_zipped,
      has_clean_version = excluded.has_clean_version,
      has_embedded_metadata = excluded.has_embedded_metadata,
      sync_folder_url = excluded.sync_folder_url,
      release_date = excluded.release_date,
      lifecycle_phase = excluded.lifecycle_phase,
      recoupment_status = excluded.recoupment_status,
      unrecouped_balance = excluded.unrecouped_balance,
      next_milestone_anniversary = excluded.next_milestone_anniversary,
      next_milestone_date = excluded.next_milestone_date,
      termination_rights_date = excluded.termination_rights_date,
      is_clearance_seamless = excluded.is_clearance_seamless,
      ready_for_active_curation = excluded.ready_for_active_curation,
      milestone_flagged_at = excluded.milestone_flagged_at
  `).run({
    id: track.id,
    title: track.title,
    isrc: track.isrc,
    splits: JSON.stringify(track.splits),
    created_at: track.created_at,
    updated_at: track.updated_at,
    has_full_mix: boolToInt(assetFolder.has_full_mix),
    has_instrumental: boolToInt(assetFolder.has_instrumental),
    has_stems_zipped: boolToInt(assetFolder.has_stems_zipped),
    has_clean_version: boolToInt(assetFolder.has_clean_version),
    has_embedded_metadata: boolToInt(assetFolder.has_embedded_metadata),
    sync_folder_url: assetFolder.sync_folder_url || null,
    release_date: lifecycle.release_date,
    lifecycle_phase: lifecycle.lifecycle_phase,
    recoupment_status: lifecycle.recoupment_status,
    unrecouped_balance: lifecycle.unrecouped_balance,
    next_milestone_anniversary: lifecycle.next_milestone_anniversary,
    next_milestone_date: lifecycle.next_milestone_date,
    termination_rights_date: lifecycle.termination_rights_date,
    is_clearance_seamless: boolToInt(lifecycle.is_clearance_seamless),
    ready_for_active_curation: boolToInt(lifecycle.ready_for_active_curation),
    milestone_flagged_at: lifecycle.milestone_flagged_at,
  });

  return track;
}

export function deleteTrack(id: string): boolean {
  const result = getDb().prepare('DELETE FROM tracks WHERE id = ?').run(id);
  return result.changes > 0;
}

export function refreshAllTrackLifecycles(now = new Date()): { updated: number; flagged: string[] } {
  const tracks = listTracks();
  let updated = 0;
  const flagged: string[] = [];

  for (const track of tracks) {
    if (!track.lifecycle.release_date) continue;

    const computed = computeLifecycleFields(track.lifecycle.release_date, track.lifecycle, now);
    const changed =
      computed.lifecycle_phase !== track.lifecycle.lifecycle_phase ||
      computed.next_milestone_anniversary !== track.lifecycle.next_milestone_anniversary ||
      computed.ready_for_active_curation !== track.lifecycle.ready_for_active_curation;

    if (changed) {
      upsertTrack({
        ...track,
        lifecycle: { ...track.lifecycle, ...computed },
      });
      updated += 1;
    }

    if (computed.ready_for_active_curation) {
      flagged.push(track.id);
    }
  }

  return { updated, flagged };
}
