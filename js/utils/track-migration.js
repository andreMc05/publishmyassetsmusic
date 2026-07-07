import { defaultAssetFolder, defaultLifecycleFields } from '../services/lifecycle.js';

export function migrateTrack(track) {
  return {
    ...track,
    assetFolder: { ...defaultAssetFolder(), ...track.assetFolder },
    lifecycle: { ...defaultLifecycleFields(), ...track.lifecycle },
  };
}

export function migrateTracks(tracks) {
  return Array.isArray(tracks) ? tracks.map(migrateTrack) : [];
}
