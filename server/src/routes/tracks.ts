import { Router } from 'express';
import {
  deleteTrack,
  getTrackById,
  listTracks,
  refreshAllTrackLifecycles,
  upsertTrack,
} from '../db/index.js';
import { computeLifecycleFields, isSyncReady } from '../services/lifecycle.js';
import type { Split } from '../types.js';

export const tracksRouter = Router();

tracksRouter.get('/', (_req, res) => {
  try {
    const tracks = listTracks().map(track => ({
      ...track,
      syncReady: isSyncReady(track.assetFolder),
    }));
    res.json({ tracks });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to list tracks' });
  }
});

tracksRouter.get('/:id', (req, res) => {
  try {
    const track = getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }
    res.json({
      track: { ...track, syncReady: isSyncReady(track.assetFolder) },
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get track' });
  }
});

tracksRouter.post('/', (req, res) => {
  try {
    const { id, title, isrc, splits, assetFolder, lifecycle, created_at } = req.body ?? {};
    if (!id || !title || !Array.isArray(splits)) {
      res.status(400).json({ error: 'id, title, and splits are required' });
      return;
    }

    const track = upsertTrack({
      id,
      title,
      isrc: isrc ?? '',
      splits: splits as Split[],
      assetFolder,
      lifecycle,
      created_at,
    });

    res.status(201).json({ track: { ...track, syncReady: isSyncReady(track.assetFolder) } });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create track' });
  }
});

tracksRouter.put('/:id', (req, res) => {
  try {
    const existing = getTrackById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }

    const { title, isrc, splits, assetFolder, lifecycle } = req.body ?? {};
    const track = upsertTrack({
      ...existing,
      title: title ?? existing.title,
      isrc: isrc ?? existing.isrc,
      splits: splits ?? existing.splits,
      assetFolder: { ...existing.assetFolder, ...assetFolder },
      lifecycle: { ...existing.lifecycle, ...lifecycle },
    });

    res.json({ track: { ...track, syncReady: isSyncReady(track.assetFolder) } });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update track' });
  }
});

tracksRouter.delete('/:id', (req, res) => {
  try {
    const deleted = deleteTrack(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete track' });
  }
});

tracksRouter.post('/lifecycle/refresh', (_req, res) => {
  try {
    const result = refreshAllTrackLifecycles();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lifecycle refresh failed' });
  }
});

tracksRouter.post('/:id/lifecycle/compute', (req, res) => {
  try {
    const track = getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }

    const computed = computeLifecycleFields(track.lifecycle.release_date, track.lifecycle);
    const updated = upsertTrack({
      ...track,
      lifecycle: { ...track.lifecycle, ...computed },
    });

    res.json({ track: updated, computed });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Lifecycle compute failed' });
  }
});
