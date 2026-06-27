const STORAGE_KEY = 'pma-music-state';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        tracks: Array.isArray(parsed.tracks) ? parsed.tracks : [],
        isrcRecords: Array.isArray(parsed.isrcRecords) ? parsed.isrcRecords : [],
        registrantPrefix: typeof parsed.registrantPrefix === 'string' ? parsed.registrantPrefix : '',
        activeTab: 'tracker',
        editingTrack: null,
      };
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
    case 'ADD_TRACK':    return { ...s, tracks: [...s.tracks, action.track] };
    case 'UPDATE_TRACK': return { ...s, tracks: s.tracks.map(t => t.id === action.track.id ? action.track : t), editingTrack: null };
    case 'DELETE_TRACK': return { ...s, tracks: s.tracks.filter(t => t.id !== action.id) };
    case 'ADD_ISRC':     return { ...s, isrcRecords: [...s.isrcRecords, action.record] };
    case 'UPDATE_ISRC':  return { ...s, isrcRecords: s.isrcRecords.map(r => r.id === action.record.id ? action.record : r) };
    case 'DELETE_ISRC':  return { ...s, isrcRecords: s.isrcRecords.filter(r => r.id !== action.id) };
    case 'SET_PREFIX':   return { ...s, registrantPrefix: action.prefix };
    case 'SET_TAB':      return { ...s, activeTab: action.tab, editingTrack: null };
    case 'SET_EDITING':  return { ...s, editingTrack: action.track };
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
