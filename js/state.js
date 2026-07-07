import { migrateTracks } from './utils/track-migration.js';
import {
  enrichTrackLifecycle,
  refreshAllTracksLifecycle,
  shouldRunDailyLifecycleSync,
  markLifecycleSyncRun,
} from './services/lifecycle.js';

const STORAGE_KEY = 'pma-music-state';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const tracks = migrateTracks(Array.isArray(parsed.tracks) ? parsed.tracks : []);
      const runSync = shouldRunDailyLifecycleSync();
      const syncedTracks = runSync
        ? refreshAllTracksLifecycle(tracks)
        : tracks.map(enrichTrackLifecycle);

      if (runSync) markLifecycleSyncRun();

      const nextState = {
        tracks: syncedTracks,
        isrcRecords: Array.isArray(parsed.isrcRecords) ? parsed.isrcRecords : [],
        registrantPrefix: typeof parsed.registrantPrefix === 'string' ? parsed.registrantPrefix : '',
        activeTab: 'tracker',
        editingTrack: null,
      };

      const needsPersist = runSync || (parsed.tracks?.length && !parsed.tracks[0]?.assetFolder);
      if (needsPersist) persistState(nextState);

      return nextState;
    }
  } catch (_) { /* ignore corrupt storage */ }
  return {
    tracks: [],
    isrcRecords: [],
    registrantPrefix: '',
    activeTab: 'tracker',
    editingTrack: null,
  };
}

function persistState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tracks: s.tracks,
      isrcRecords: s.isrcRecords,
      registrantPrefix: s.registrantPrefix,
    }));
  } catch (_) { /* storage full or unavailable */ }
}

function reduce(s, action) {
  switch (action.type) {
    case 'ADD_TRACK':
    case 'UPDATE_TRACK': {
      const track = enrichTrackLifecycle(action.track);
      if (action.type === 'ADD_TRACK') {
        return { ...s, tracks: [...s.tracks, track], editingTrack: null };
      }
      return {
        ...s,
        tracks: s.tracks.map(t => t.id === track.id ? track : t),
        editingTrack: null,
      };
    }
    case 'DELETE_TRACK': return { ...s, tracks: s.tracks.filter(t => t.id !== action.id) };
    case 'ADD_ISRC':     return { ...s, isrcRecords: [...s.isrcRecords, action.record] };
    case 'UPDATE_ISRC':  return { ...s, isrcRecords: s.isrcRecords.map(r => r.id === action.record.id ? action.record : r) };
    case 'DELETE_ISRC':  return { ...s, isrcRecords: s.isrcRecords.filter(r => r.id !== action.id) };
    case 'SET_PREFIX':   return { ...s, registrantPrefix: action.prefix };
    case 'SET_TAB':      return { ...s, activeTab: action.tab, editingTrack: null };
    case 'SET_EDITING':  return { ...s, editingTrack: action.track };
    case 'REFRESH_LIFECYCLE': {
      markLifecycleSyncRun();
      return { ...s, tracks: refreshAllTracksLifecycle(s.tracks) };
    }
    default: return s;
  }
}

let state = loadState();
const listeners = new Set();

export function getState() { return state; }

export function subscribe(fn) { listeners.add(fn); }

export function dispatch(action) {
  state = reduce(state, action);
  persistState(state);
  listeners.forEach(fn => fn(state));
}
