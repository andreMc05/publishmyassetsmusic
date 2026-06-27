/**
 * Publish My Assets Music — app.js
 * Modular vanilla ES6+, no framework dependencies.
 * Security: all DOM writes use textContent or setAttribute —
 * never innerHTML with user data. href values are validated
 * before insertion. CSP-friendly: no eval, no inline handlers.
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const ROLES = ['Artist','Producer','Songwriter','Engineer','Co-Writer','Featured','Publisher','Label','Other'];
const TRACK_VERSIONS = ['Original','Radio Edit','Remix','Acoustic','Instrumental','Extended','Live','Demo','Other'];
const CODE_OWNERS = ['Self-Owned','Distributor-Owned','Unknown'];

const SPLIT_COLORS = [
  '#C9A84C','#5B7FA6','#4CAF7A','#CF6679',
  '#A06DB3','#E88C3A','#59BAB5','#D4C97A',
];

const CAT_COLORS = {
  Streaming: '#1DB954',
  Promotion: '#E040FB',
  Licensing: '#E88C3A',
  Live:      '#E17055',
};

const PLATFORMS = [
  { name:'Spotify for Artists',      cat:'Streaming', color:'#1DB954', icon:'🎧', desc:'Upload via distributor. Claim your artist profile to access analytics, pitch to editorial playlists, and track streams.', url:'https://artists.spotify.com',             tags:['Free to claim','Playlist pitching','Analytics'] },
  { name:'Apple Music for Artists',  cat:'Streaming', color:'#FC3C44', icon:'🍎', desc:'Claim your profile to see real-time streaming data, Shazam stats, and radio play across 100+ countries.',             url:'https://artists.apple.com',               tags:['Free to claim','Global reach','Radio tracking'] },
  { name:'Tidal',                    cat:'Streaming', color:'#00FFFF', icon:'🌊', desc:'Artist-first platform with higher royalty rates than most DSPs. Strong among audiophiles and hip-hop/R&B.',             url:'https://tidal.com/artist',                tags:['Higher royalties','HiFi audio','Artist-friendly'] },
  { name:'SoundCloud for Artists',   cat:'Streaming', color:'#FF5500', icon:'☁️', desc:'Upload directly — no distributor needed for free tier. SoundCloud Premier unlocks monetization.',                      url:'https://soundcloud.com/upload',           tags:['Direct upload','Fan discovery','Monetization tier'] },
  { name:'YouTube Music',            cat:'Streaming', color:'#FF0000', icon:'▶️', desc:'Your distributor auto-generates Art Tracks. Separately claim your channel for Content ID royalty collection.',         url:'https://artists.youtube.com',             tags:['Content ID','Auto-generated','Video integration'] },
  { name:'Amazon Music for Artists', cat:'Streaming', color:'#00A8E0', icon:'📦', desc:'Claim your artist profile. Eligible for Alexa integrations and Amazon Music Unlimited features.',                     url:'https://artists.amazon.com',              tags:['Free to claim','Alexa integration','Prime audience'] },
  { name:'Audiomack',                cat:'Streaming', color:'#FFA500', icon:'🔊', desc:'Free direct uploads with no gating. Popular in hip-hop, Afrobeats, and gospel. Monetization via Audiomack Direct.',   url:'https://audiomack.com/upload',            tags:['Free direct upload','No gates','Hip-hop/Gospel'] },
  { name:'Bandcamp',                 cat:'Streaming', color:'#1DA0C3', icon:'🎸', desc:'Sell directly to fans. Keep 85–90% of revenue. Set your own price including pay-what-you-want.',                     url:'https://bandcamp.com',                    tags:['Direct-to-fan','High revenue cut','Name your price'] },
  { name:'Symphonic Distribution',   cat:'Streaming', color:'#9B59B6', icon:'🎻', desc:'Independent-friendly distributor that cleanly supports ingestion of your own ISRC and UPC codes. Catalog sovereignty.', url:'https://symphonicdistribution.com',      tags:['Custom ISRC/UPC','Catalog sovereignty','Marketing tools'] },
  { name:'TooLost',                  cat:'Streaming', color:'#E91E8C', icon:'🔑', desc:'Artist-owned distribution built for catalog sovereignty. Supports custom ISRC ingestion — your code, not theirs.',    url:'https://toolost.com',                     tags:['Custom ISRC','Catalog ownership','Independent-first'] },
  { name:'SubmitHub',                cat:'Promotion', color:'#6C5CE7', icon:'📨', desc:'Submit tracks to blogs, playlist curators, YouTube channels, and influencers. Pay-per-submission with guaranteed feedback.', url:'https://www.submithub.com',          tags:['Blog pitching','Playlist curators','Feedback guaranteed'] },
  { name:'Groover',                  cat:'Promotion', color:'#E040FB', icon:'📡', desc:'Submit music to 2,000+ curators, radios, blogs, and labels. Response guaranteed within 7 days.',                     url:'https://groover.co',                      tags:['2000+ curators','Guaranteed reply','7-day window'] },
  { name:'Playlist Push',            cat:'Promotion', color:'#00BCD4', icon:'📋', desc:'Connects artists to independent Spotify playlist curators. Campaigns start around $100.',                              url:'https://playlistpush.com',                tags:['Spotify playlists','Campaign-based','Independent curators'] },
  { name:'Musosoup',                 cat:'Promotion', color:'#FF6B6B', icon:'🍲', desc:'Submit to blogs, playlists, and radio with a flat-fee model. Good UK/European reach.',                                 url:'https://musosoup.com',                    tags:['Flat fee','Blog coverage','UK/EU reach'] },
  { name:'One Submit',               cat:'Promotion', color:'#4CAF7A', icon:'✅', desc:'Submit to Spotify playlists, YouTube channels, and TikTok influencers in one place. Credit-based system.',             url:'https://onesubmit.com',                   tags:['Multi-platform','TikTok','Credit-based'] },
  { name:'Daily Playlists',          cat:'Promotion', color:'#C9A84C', icon:'📅', desc:'Freemium submission to Spotify playlist curators. Good for indie/lo-fi/ambient genres.',                              url:'https://dailyplaylists.com',              tags:['Free tier','Spotify','Indie/ambient'] },
  { name:'Indiemono',                cat:'Promotion', color:'#A06DB3', icon:'🎹', desc:'Free playlist submission. Strong for indie pop, folk, and alternative.',                                               url:'https://indiemono.com',                   tags:['Free','Indie pop/folk','Curation community'] },
  { name:'Soundplate',               cat:'Promotion', color:'#59BAB5', icon:'🎙️', desc:'Submit to free playlists and connect with playlist curators across genres.',                                           url:'https://soundplate.com',                  tags:['Free submission','Multi-genre','Curator network'] },
  { name:'Musicbed',                 cat:'Licensing', color:'#E88C3A', icon:'🎬', desc:'Premium sync licensing for film, TV, and ads. Best for cinematic, indie, and emotional music. Application required.',  url:'https://www.musicbed.com/artists/apply',  tags:['Film & TV','Application required','High quality bar'] },
  { name:'Artlist',                  cat:'Licensing', color:'#2563EB', icon:'🎞️', desc:'License your music to 25M+ content creators worldwide. Revenue share model.',                                         url:'https://artlist.io/artist-application',   tags:['25M+ creators','Revenue share','Application review'] },
  { name:'Epidemic Sound',           cat:'Licensing', color:'#FF4444', icon:'🔈', desc:'Partner program for sync licensing. Catalog buy-out model — they own future rights after deal.',                       url:'https://www.epidemicsound.com/artist-application/', tags:['YouTube creators','Buy-out model','Brand deals'] },
  { name:'Pond5',                    cat:'Licensing', color:'#00B4D8', icon:'🌊', desc:'Marketplace for music, video, and SFX. Set your own prices and keep 35–50%.',                                          url:'https://www.pond5.com/sell-music',        tags:['Self-priced','Production music','35–50% cut'] },
  { name:'Musicosmos',               cat:'Licensing', color:'#A29BFE', icon:'🌌', desc:'Sync licensing connecting independent artists to film, TV, and ad placements. Royalty-free and rights-managed options.', url:'https://musicosmos.com',               tags:['Indie-friendly','Film & ads','Rights-managed'] },
  { name:'Songtradr',                cat:'Licensing', color:'#FD79A8', icon:'🎵', desc:'Upload your catalog for sync opportunities across TV, film, games, and brands. Free to join, non-exclusive.',           url:'https://www.songtradr.com',               tags:['Non-exclusive','Free to join','Games & brands'] },
  { name:'AudioJungle',              cat:'Licensing', color:'#81ECEC', icon:'🌿', desc:'High-volume marketplace for royalty-free music. Good for production, background, and loop music.',                     url:'https://audiojungle.net/become-an-author', tags:['High volume','Royalty-free','Production music'] },
  { name:'Musicxray',                cat:'Licensing', color:'#FDCB6E', icon:'🔍', desc:'Pitch music directly to A&R, supervisors, and playlist curators. Industry-facing paid-submission platform.',            url:'https://www.musicxray.com',               tags:['A&R pitching','Supervisors','Industry-facing'] },
  { name:'Sofar Sounds',             cat:'Live',      color:'#E17055', icon:'🕯️', desc:'Intimate secret concert series in 400+ cities. Great for building a dedicated live audience.',                          url:'https://www.sofarsounds.com/artists',     tags:['400+ cities','Intimate venues','Concert video'] },
  { name:'Bandsintown for Artists',  cat:'Live',      color:'#00C4B3', icon:'📍', desc:'Free artist tool to post tour dates, notify fans, and track attendance. Integrates with Spotify and Apple Music.',     url:'https://artists.bandsintown.com',         tags:['Free','Tour dates','Fan alerts'] },
  { name:'Songkick for Artists',     cat:'Live',      color:'#F80046', icon:'🎤', desc:'Claim your artist profile to list concerts and reach fans who track you.',                                              url:'https://www.songkick.com/artist-signup',  tags:['Free','Concert listings','Fan tracking'] },
  { name:'GigSalad',                 cat:'Live',      color:'#3D9970', icon:'🥗', desc:'Book private events, corporate gigs, weddings, and festivals. Good revenue stream for independent artists.',            url:'https://www.gigsalad.com/become-a-vendor', tags:['Private events','Weddings/corporate','Booking requests'] },
  { name:'Gigsster',                 cat:'Live',      color:'#74B9FF', icon:'🏛️', desc:'Venue marketplace for booking event spaces and connecting with promoters.',                                             url:'https://gigsster.com',                    tags:['Venue booking','Self-produced shows','Promoter network'] },
  { name:'StageIt',                  cat:'Live',      color:'#FFEAA7', icon:'🖥️', desc:'Live streaming concerts where fans pay to attend. You keep 70% of ticket revenue.',                                   url:'https://www.stageit.com/become_a_performer', tags:['Live streaming','70% revenue','Fan ticketing'] },
];

const STEPS = [
  { phase:'Entity & Business', color:'#C9A84C', items:[
    { title:'Form Your LLC', detail:'File Articles of Organization in your state through the Secretary of State website. Choose a name that doesn\'t conflict with existing entities. Pay the filing fee ($50–$500 depending on state). Illinois filers go to ilsos.gov.', links:[{label:'Illinois SOS',url:'https://www.ilsos.gov/departments/business_services/llc.html'}] },
    { title:'Get an EIN', detail:'Apply free at IRS.gov. You\'ll need this to open a business bank account, file taxes as the LLC, and receive royalty payments properly.', links:[{label:'IRS EIN Application',url:'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online'}] },
    { title:'Open a Business Bank Account', detail:'Keep all music revenue separate from personal funds. This protects your LLC status and simplifies royalty accounting.' },
    { title:'Operating Agreement', detail:'Draft an operating agreement — especially critical if the LLC has multiple members (e.g., band or co-producer). This governs how splits are paid out to the LLC and how the LLC distributes internally.' },
  ]},
  { phase:'Metadata Sovereignty (ISRC & UPC Ownership)', color:'#F06292', items:[
    { title:'⚠️ The Distributor Code Trap', detail:'When distributors assign "free" ISRC and UPC codes, their registrant prefix is baked permanently into your metadata — not yours. If you ever switch distributors, you lose continuity: play counts, playlist placements, and algorithmic momentum won\'t transfer. Distributors also pool millions of tracks under their prefixes and capture unclaimed "black box" royalties that belong to you.' },
    { title:'Own Your ISRC Registrant Code', detail:'Apply for your own permanent 3-character Registrant Code at USISRC.org under your LLC name. Once approved, you self-assign ISRCs to every track using the ISRC Registry tab in this app. This ties your catalog to your entity permanently.', links:[{label:'USISRC.org',url:'https://www.usisrc.org'}] },
    { title:'Own Your UPC via GS1 US', detail:'Purchase a Company Prefix from GS1 US. Your LLC name gets permanently tied to the GS1 GEPIR ownership database — every barcode you generate is legally yours.', links:[{label:'GS1 US',url:'https://www.gs1us.org'}] },
    { title:'Understand ISRC vs UPC vs ISWC', detail:'ISRC (12 chars) = unique ID for a specific sound recording. Every version needs its own ISRC. UPC = the barcode on the release package (single, EP, LP). ISWC = the identifier for the underlying composition, assigned by CISAC through your PRO.' },
    { title:'Waterfall Releases: Reuse ISRCs, New UPCs', detail:'When moving a previously released single onto an EP or album, reuse the exact same ISRC for that audio file. This merges stream histories on DSPs. Assign a brand-new UPC to the album package — reusing the single\'s UPC causes ingestion errors.' },
    { title:'Audit Your Existing Catalog', detail:'Use ISRCFinder.com and UPCFinder.com to look up codes already assigned to your tracks and identify distributor-owned vs. self-owned codes.', links:[{label:'ISRCFinder',url:'https://isrcfinder.com'},{label:'UPCFinder',url:'https://upcfinder.com'}] },
    { title:'Register with Luminate & Mediabase', detail:'Once you own your ISRC prefix, register titles natively with Luminate (Billboard charts) and Mediabase (radio airplay). This unlocks chart eligibility and accurate royalty attribution.' },
    { title:'Use Distributor-Sovereign Platforms', detail:'Symphonic Distribution and TooLost cleanly support ingestion of artist-owned ISRCs and UPCs without overwriting your metadata.', links:[{label:'Symphonic',url:'https://symphonicdistribution.com'},{label:'TooLost',url:'https://toolost.com'}] },
  ]},
  { phase:'Copyright Registration', color:'#5B7FA6', items:[
    { title:'Register with the U.S. Copyright Office', detail:'Register each composition (lyrics + melody) and sound recording separately at copyright.gov. File online for $45–$65 per work.', links:[{label:'Copyright.gov',url:'https://www.copyright.gov/registration/'}] },
    { title:'Understand the Two Copyrights', detail:'(1) The Composition — melody and lyrics, owned by the songwriter/publisher. (2) The Sound Recording (Master) — the specific recorded performance. Register BOTH.' },
    { title:'Register Early', detail:'Register within 3 months of publication to be eligible for statutory damages ($750–$150,000 per work) and attorney\'s fees.' },
  ]},
  { phase:'PRO & ISWC Registration', color:'#4CAF7A', items:[
    { title:'Join a PRO', detail:'Choose one: ASCAP, BMI, or SESAC. Register as a songwriter/publisher member AND register your LLC as a publishing entity to capture both the writer\'s share and publisher\'s share of performance royalties.', links:[{label:'ASCAP',url:'https://www.ascap.com/music-creators/join'},{label:'BMI',url:'https://www.bmi.com/creators'},{label:'SESAC',url:'https://www.sesac.com'}] },
    { title:'Register Each Song with Your PRO', detail:'After joining, register every track with its title, ISRC, co-writer splits, and publisher info. This triggers royalty collection and distribution.' },
    { title:'Register Your LLC as Publisher', detail:'This captures the publisher\'s share (50%) of performance royalties on top of your writer\'s share.' },
    { title:'ISWC — The Composition Identifier', detail:'When you register a song with your PRO, CISAC assigns an ISWC (International Standard Musical Work Code) to the composition. This is separate from the ISRC. The ISWC is what collection societies worldwide use to route publishing royalties back to you.' },
  ]},
  { phase:'Mechanical Royalties', color:'#A06DB3', items:[
    { title:'Register with MLC', detail:'The MLC collects mechanical royalties from U.S. digital streaming services (Spotify, Apple Music, etc.). Free to join. Register your songs separately from your PRO.', links:[{label:'The MLC',url:'https://www.themlc.com'}] },
    { title:'Distributor + Mechanical Collection', detail:'Confirm your distributor handles mechanical licensing or register separately with MLC.' },
    { title:'⚠️ The Black Box Royalty Trap', detail:'Collection societies hold massive pools of unclaimed royalties due to messy metadata. After a set period, they redistribute these funds proportionally to top catalog holders. Distributors pooling millions of tracks under their own ISRC prefixes routinely capture this money. Owning your own ISRC prefix routes royalties to you — not the distributor.' },
  ]},
  { phase:'Distribution & Sync', color:'#E88C3A', items:[
    { title:'Choose a Music Distributor', detail:'DistroKid, TuneCore, CD Baby, or AWAL get your music on DSPs. For catalog sovereignty, use Symphonic or TooLost — they support your own ISRC/UPC ingestion.' },
    { title:'Get an ISRC Code for Every Track', detail:'Do NOT rely on distributor-assigned codes. Own your registrant prefix via USISRC.org and track every assignment in the ISRC Registry tab.', links:[{label:'USISRC.org',url:'https://www.usisrc.org'}] },
    { title:'Register for Sync Licensing', detail:'Sync royalties come from TV, film, ads, and games. Register with Musicbed or Artlist, or work with a sync agent. Your LLC owns and licenses the master.' },
  ]},
  { phase:'Neighboring Rights & International', color:'#59BAB5', items:[
    { title:'Collect Neighboring Rights', detail:'Collect through SoundExchange in the US for digital/satellite radio performance royalties paid to master owners.', links:[{label:'SoundExchange',url:'https://www.soundexchange.com'}] },
    { title:'Use Songtrust for Global Collection', detail:'Songtrust registers your songs with 60+ collection societies worldwide for international mechanical royalties.', links:[{label:'Songtrust',url:'https://www.songtrust.com'}] },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// Secure DOM Utilities
// ═══════════════════════════════════════════════════════════════

/** Create an element with optional class and textContent */
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Sanitise a URL — only allow https:// and http:// schemes */
function safeUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
  } catch (_) { /* fall through */ }
  return '#';
}

/** Build a secure external anchor */
function externalLink(label, url, cls) {
  const a = el('a', cls, label);
  a.href = safeUrl(url);
  a.target = '_blank';
  a.rel = 'noreferrer noopener';
  return a;
}

/** UUID v4-ish (crypto.randomUUID preferred, fallback for older browsers) */
function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// ═══════════════════════════════════════════════════════════════
// State — immutable reducer pattern (no framework needed)
// ═══════════════════════════════════════════════════════════════

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

let state = loadState();

const listeners = new Set();

function subscribe(fn) { listeners.add(fn); }

function dispatch(action) {
  state = reduce(state, action);
  persistState(state);
  listeners.forEach(fn => fn(state));
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

// ═══════════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════════

function validateISRC(code) {
  return /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/.test(code.replace(/-/g, ''));
}

function formatISRC(code) {
  const c = code.replace(/-/g, '');
  if (c.length < 12) return code;
  return `${c.slice(0,2)}-${c.slice(2,5)}-${c.slice(5,7)}-${c.slice(7)}`;
}

function ownerClass(owner) {
  if (owner === 'Self-Owned') return 'owner-self';
  if (owner === 'Distributor-Owned') return 'owner-dist';
  return 'owner-unk';
}

function ownerColor(owner) {
  if (owner === 'Self-Owned') return 'var(--color-green)';
  if (owner === 'Distributor-Owned') return 'var(--color-red)';
  return 'var(--color-muted)';
}

// ═══════════════════════════════════════════════════════════════
// Split Bar Component
// ═══════════════════════════════════════════════════════════════

function renderSplitBar(splits) {
  const bar = el('div', 'split-bar');
  const total = splits.reduce((s, sp) => s + Number(sp.pct), 0);
  splits.forEach((sp, i) => {
    const seg = el('div', 'split-bar__segment');
    seg.style.width = `${total > 0 ? (sp.pct / total) * 100 : 0}%`;
    seg.style.background = SPLIT_COLORS[i % SPLIT_COLORS.length];
    seg.title = `${sp.name}: ${sp.pct}%`;
    bar.appendChild(seg);
  });
  return bar;
}

// ═══════════════════════════════════════════════════════════════
// Track Form
// ═══════════════════════════════════════════════════════════════

function mountTrackForm(container, initial, onSave, onCancel) {
  container.innerHTML = '';
  let splits = initial?.splits ? structuredClone(initial.splits) : [{ id: uuid(), name: '', role: 'Artist', pct: 0 }];

  const card = el('div', 'card splits-form');

  // Title
  const heading = el('h3', 'splits-form__header', initial ? 'Edit Track' : 'Add New Track');
  card.appendChild(heading);

  // Grid: title + isrc
  const grid = el('div', 'grid-2');
  card.appendChild(grid);

  const titleField = el('div', 'field');
  const titleLabel = el('label', 'label', 'Track Title *');
  const titleInput = el('input');
  titleInput.placeholder = 'e.g. Midnight Drive';
  titleInput.value = initial?.title || '';
  titleInput.setAttribute('aria-label', 'Track Title');
  titleField.append(titleLabel, titleInput);

  const isrcField = el('div', 'field');
  const isrcLabel = el('label', 'label', 'ISRC (optional)');
  const isrcInput = el('input', 'input-mono');
  isrcInput.placeholder = 'e.g. USRC17607839';
  isrcInput.value = initial?.isrc || '';
  isrcInput.setAttribute('aria-label', 'ISRC code');
  isrcField.append(isrcLabel, isrcInput);
  grid.append(titleField, isrcField);

  // Splits header
  const splitsHeader = el('div', 'flex items-center justify-between gap-2');
  const splitsLabel = el('span', 'label', 'Splits');
  const btns = el('div', 'flex gap-2');
  const balanceBtn = el('button', 'btn btn-sm btn-icon-blue2', 'Auto-Balance');
  const addBtn = el('button', 'btn btn-sm btn-icon-gold', '+ Add Person');
  btns.append(balanceBtn, addBtn);
  splitsHeader.append(splitsLabel, btns);
  card.appendChild(splitsHeader);

  // Bar container
  const barWrap = el('div');
  barWrap.style.margin = '8px 0 4px';
  const totalEl = el('div', 'split-total');
  barWrap.append(document.createTextNode(''), totalEl);
  card.appendChild(barWrap);

  // Split rows container
  const rowsContainer = el('div');
  card.appendChild(rowsContainer);

  const errorEl = el('p', 'form-error hidden');
  card.appendChild(errorEl);

  const formBtns = el('div', 'flex gap-2');
  const saveBtn = el('button', 'btn btn-primary', initial ? 'Save Changes' : 'Add Track');
  const cancelBtn = el('button', 'btn btn-ghost', 'Cancel');
  formBtns.append(saveBtn, cancelBtn);
  card.appendChild(formBtns);

  container.appendChild(card);

  function refreshBar() {
    const total = splits.reduce((s, sp) => s + Number(sp.pct), 0);
    const balanced = Math.abs(total - 100) < 0.01;
    barWrap.innerHTML = '';
    barWrap.appendChild(renderSplitBar(splits));
    const tot = el('div', `split-total ${balanced ? 'ok' : 'err'}`, `${total.toFixed(2)}% / 100%`);
    tot.style.textAlign = 'right';
    tot.style.marginTop = '4px';
    barWrap.appendChild(tot);
  }

  function renderRows() {
    rowsContainer.innerHTML = '';
    splits.forEach((sp, i) => {
      const row = el('div', 'split-row');

      const nameInput = el('input');
      nameInput.placeholder = 'Name';
      nameInput.value = sp.name;
      nameInput.setAttribute('aria-label', `Split holder ${i + 1} name`);
      nameInput.addEventListener('input', e => {
        splits[i].name = e.target.value;
        refreshBar();
      });

      const roleSelect = el('select');
      roleSelect.setAttribute('aria-label', `Split holder ${i + 1} role`);
      ROLES.forEach(r => {
        const opt = el('option', '', r);
        opt.value = r;
        if (r === sp.role) opt.selected = true;
        roleSelect.appendChild(opt);
      });
      roleSelect.addEventListener('change', e => { splits[i].role = e.target.value; });

      const pctWrap = el('div', 'input-percent');
      const pctInput = el('input');
      pctInput.type = 'number';
      pctInput.min = '0';
      pctInput.max = '100';
      pctInput.step = '0.01';
      pctInput.value = sp.pct;
      pctInput.setAttribute('aria-label', `Split holder ${i + 1} percentage`);
      pctInput.addEventListener('input', e => {
        splits[i].pct = Math.max(0, Math.min(100, Number(e.target.value)));
        refreshBar();
      });
      pctWrap.appendChild(pctInput);

      const removeBtn = el('button', 'split-row__remove', '×');
      removeBtn.setAttribute('aria-label', `Remove split holder ${i + 1}`);
      removeBtn.disabled = splits.length === 1;
      removeBtn.addEventListener('click', () => {
        splits.splice(i, 1);
        renderRows();
        refreshBar();
      });

      row.append(nameInput, roleSelect, pctWrap, removeBtn);
      rowsContainer.appendChild(row);
    });
    refreshBar();
  }

  addBtn.addEventListener('click', () => {
    splits.push({ id: uuid(), name: '', role: 'Artist', pct: 0 });
    renderRows();
  });

  balanceBtn.addEventListener('click', () => {
    const even = +(100 / splits.length).toFixed(2);
    splits = splits.map((s, i) => ({
      ...s,
      pct: i === splits.length - 1 ? +(100 - even * (splits.length - 1)).toFixed(2) : even,
    }));
    renderRows();
  });

  saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const total = splits.reduce((s, sp) => s + Number(sp.pct), 0);
    const balanced = Math.abs(total - 100) < 0.01;
    errorEl.classList.add('hidden');

    if (!title) { errorEl.textContent = 'Track title is required.'; errorEl.classList.remove('hidden'); return; }
    if (splits.some(s => !s.name.trim())) { errorEl.textContent = 'All split holders need a name.'; errorEl.classList.remove('hidden'); return; }
    if (!balanced) { errorEl.textContent = `Splits must add up to 100%. Currently: ${total.toFixed(2)}%`; errorEl.classList.remove('hidden'); return; }

    onSave({
      id: initial?.id || uuid(),
      title,
      isrc: isrcInput.value.trim(),
      splits: structuredClone(splits),
      createdAt: initial?.createdAt || new Date().toISOString(),
    });
  });

  cancelBtn.addEventListener('click', onCancel);
  renderRows();
}

// ═══════════════════════════════════════════════════════════════
// Tracker Tab
// ═══════════════════════════════════════════════════════════════

function renderTrackCard(track, onEdit, onDelete) {
  const card = el('div', 'track-card');

  const header = el('div', 'track-card__header');
  const info = el('div');
  const title = el('div', 'track-card__title', track.title);
  info.appendChild(title);
  if (track.isrc) {
    const isrcEl = el('div', 'track-card__isrc', `ISRC: ${track.isrc}`);
    info.appendChild(isrcEl);
  }
  header.appendChild(info);

  const actions = el('div', 'track-card__actions');
  const editBtn = el('button', 'btn btn-xs btn-icon-blue2', 'Edit');
  const delBtn = el('button', 'btn btn-xs btn-icon-red', 'Delete');
  editBtn.addEventListener('click', () => onEdit(track));
  delBtn.addEventListener('click', () => {
    if (confirm(`Delete "${track.title}"?`)) onDelete(track.id);
  });
  actions.append(editBtn, delBtn);
  header.appendChild(actions);
  card.appendChild(header);

  card.appendChild(renderSplitBar(track.splits));

  let expanded = false;
  const toggle = el('button', 'track-card__toggle');
  toggle.textContent = `▼ Show ${track.splits.length} split${track.splits.length !== 1 ? 's' : ''}`;

  const chips = el('div', 'split-chips hidden');
  track.splits.forEach((sp, i) => {
    const chip = el('div', 'split-chip');
    chip.style.borderLeft = `3px solid ${SPLIT_COLORS[i % SPLIT_COLORS.length]}`;
    chip.style.borderColor = SPLIT_COLORS[i % SPLIT_COLORS.length] + '44';
    chip.style.border = `1px solid ${SPLIT_COLORS[i % SPLIT_COLORS.length]}44`;
    chip.style.borderLeft = `3px solid ${SPLIT_COLORS[i % SPLIT_COLORS.length]}`;

    const name = el('div', 'split-chip__name', sp.name);
    const role = el('div', 'split-chip__role', sp.role);
    const pct  = el('div', 'split-chip__pct', `${sp.pct}%`);
    pct.style.color = SPLIT_COLORS[i % SPLIT_COLORS.length];
    chip.append(name, role, pct);
    chips.appendChild(chip);
  });

  toggle.addEventListener('click', () => {
    expanded = !expanded;
    toggle.textContent = `${expanded ? '▲ Hide' : '▼ Show'} ${track.splits.length} split${track.splits.length !== 1 ? 's' : ''}`;
    chips.classList.toggle('hidden', !expanded);
  });

  card.append(toggle, chips);
  return card;
}

function mountTrackerTab(container) {
  let showForm = false;
  let editingTrack = null;

  function render(s) {
    if (s.activeTab !== 'tracker') {
      showForm = false;
      editingTrack = null;
      return;
    }

    container.innerHTML = '';

    if (showForm) {
      const formWrap = el('div');
      container.appendChild(formWrap);
      mountTrackForm(formWrap, editingTrack,
        track => {
          const isEdit = !!editingTrack;
          showForm = false;
          editingTrack = null;
          dispatch({ type: isEdit ? 'UPDATE_TRACK' : 'ADD_TRACK', track });
        },
        () => {
          showForm = false;
          editingTrack = null;
          render(state);
        }
      );
      if (s.tracks.length === 0) return;
    }

    if (!showForm) {
      const header = el('div', 'page-header');
      const title = el('h2', 'page-title', 'Your Tracks');
      const addBtn = el('button', 'btn btn-primary', '+ Add Track');
      addBtn.addEventListener('click', () => {
        showForm = true;
        editingTrack = null;
        render(state);
      });
      header.append(title, addBtn);
      container.appendChild(header);
    }

    if (s.tracks.length === 0) {
      const empty = el('div', 'card-dashed');
      const icon = el('span', 'empty-icon', '🎵');
      const txt = el('p', 'empty-text', 'No tracks yet. Add your first track to start tracking splits.');
      const btn = el('button', 'btn btn-primary', 'Add Your First Track');
      btn.addEventListener('click', () => {
        showForm = true;
        editingTrack = null;
        render(state);
      });
      empty.append(icon, txt, btn);
      container.appendChild(empty);
      return;
    }

    s.tracks.forEach(track => {
      const card = renderTrackCard(
        track,
        t => {
          showForm = true;
          editingTrack = t;
          render(state);
        },
        id => dispatch({ type: 'DELETE_TRACK', id })
      );
      container.appendChild(card);
    });
  }

  subscribe(render);
  render(state);
}

// ═══════════════════════════════════════════════════════════════
// ISRC Form
// ═══════════════════════════════════════════════════════════════

function defaultISRCRecord() {
  return {
    id: uuid(), isrc: '', title: '', version: 'Original', artist: '',
    year: String(new Date().getFullYear()), owner: 'Self-Owned',
    registrant: '', upc: '', upcOwner: 'Self-Owned', notes: '',
    linkedTrackId: '', createdAt: new Date().toISOString(),
  };
}

function mountISRCForm(container, initial, tracks, registrantPrefix, onSave, onCancel) {
  container.innerHTML = '';
  const rec = initial ? structuredClone(initial) : defaultISRCRecord();

  const card = el('div', 'card splits-form');
  const heading = el('h3', 'splits-form__header pink', initial ? 'Edit ISRC Record' : 'Register New ISRC');
  card.appendChild(heading);

  function field(labelText, inputEl) {
    const wrap = el('div', 'field');
    const lbl = el('label', 'label', labelText);
    wrap.append(lbl, inputEl);
    return wrap;
  }

  function makeInput(val, placeholder, cls) {
    const inp = el('input', cls || '');
    inp.value = val;
    inp.placeholder = placeholder || '';
    return inp;
  }

  function makeSelect(options, val) {
    const sel = el('select');
    options.forEach(o => {
      const opt = el('option', '', o);
      opt.value = o;
      if (o === val) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }

  // Row 1
  const grid1 = el('div', 'grid-2');
  const titleInp = makeInput(rec.title, 'e.g. Midnight Drive');
  titleInp.setAttribute('aria-label', 'Track title');
  const versionSel = makeSelect(TRACK_VERSIONS, rec.version);
  grid1.append(field('Track Title *', titleInp), field('Version', versionSel));
  card.appendChild(grid1);

  // Row 2
  const grid2 = el('div', 'grid-2');
  const artistInp = makeInput(rec.artist, 'e.g. Your LLC Name');
  const yearInp = makeInput(rec.year, '2024');
  yearInp.type = 'number';
  grid2.append(field('Artist / Rights Holder', artistInp), field('Year of Recording', yearInp));
  card.appendChild(grid2);

  // ISRC row
  const isrcField = el('div', 'field');
  const isrcLabel = el('label', 'label', 'ISRC Code');
  const isrcRow = el('div', 'input-row');
  const isrcInp = makeInput(rec.isrc, 'e.g. USABC2400001', 'input-mono');
  isrcInp.maxLength = 15;
  isrcInp.setAttribute('aria-label', 'ISRC Code');

  const autoBtn = el('button', 'btn btn-sm btn-icon-pink', '⚡ Auto-Generate');
  isrcRow.append(isrcInp, autoBtn);

  const isrcStatus = el('div');
  isrcField.append(isrcLabel, isrcRow, isrcStatus);
  card.appendChild(isrcField);

  function refreshISRCStatus() {
    const v = isrcInp.value.trim();
    isrcStatus.textContent = '';
    if (!v) return;
    if (validateISRC(v)) {
      isrcStatus.className = 'isrc-valid';
      isrcStatus.textContent = '✓ Valid ISRC format';
    } else {
      isrcStatus.className = 'isrc-invalid';
      isrcStatus.textContent = '✗ Invalid — must be 12 chars: CC + 3-char registrant + 2-digit year + 5-digit sequence';
    }
  }

  isrcInp.addEventListener('input', e => {
    isrcInp.value = e.target.value.toUpperCase();
    refreshISRCStatus();
  });

  autoBtn.addEventListener('click', () => {
    if (!registrantPrefix || registrantPrefix.length !== 3) {
      errorEl.textContent = 'Set your 3-character Registrant Prefix in the settings bar above first.';
      errorEl.classList.remove('hidden');
      return;
    }
    const year = String(new Date().getFullYear()).slice(2);
    const seq = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
    isrcInp.value = `US${registrantPrefix.toUpperCase()}${year}${seq}`;
    ownerSel.value = 'Self-Owned';
    registrantInp.value = registrantPrefix.toUpperCase();
    refreshISRCStatus();
    errorEl.classList.add('hidden');
  });

  refreshISRCStatus();

  // Ownership + registrant
  const grid3 = el('div', 'grid-2');
  const ownerSel = makeSelect(CODE_OWNERS, rec.owner);
  ownerSel.style.color = ownerColor(rec.owner);
  ownerSel.addEventListener('change', () => { ownerSel.style.color = ownerColor(ownerSel.value); });
  const registrantInp = makeInput(rec.registrant, 'e.g. ABC', 'input-mono');
  registrantInp.maxLength = 3;
  registrantInp.addEventListener('input', e => { registrantInp.value = e.target.value.toUpperCase().slice(0, 3); });
  grid3.append(field('Code Ownership', ownerSel), field('Registrant Prefix (3 chars)', registrantInp));
  card.appendChild(grid3);

  // UPC row
  const grid4 = el('div', 'grid-2');
  const upcInp = makeInput(rec.upc, 'e.g. 012345678901', 'input-mono');
  const upcOwnerSel = makeSelect(CODE_OWNERS, rec.upcOwner);
  upcOwnerSel.style.color = ownerColor(rec.upcOwner);
  upcOwnerSel.addEventListener('change', () => { upcOwnerSel.style.color = ownerColor(upcOwnerSel.value); });
  grid4.append(field('Release UPC (if assigned)', upcInp), field('UPC Ownership', upcOwnerSel));
  card.appendChild(grid4);

  // Linked track
  const linkSel = makeSelect([], rec.linkedTrackId);
  const defaultOpt = el('option', '', '— Not linked —');
  defaultOpt.value = '';
  linkSel.prepend(defaultOpt);
  tracks.forEach(t => {
    const opt = el('option', '', t.title);
    opt.value = t.id;
    if (t.id === rec.linkedTrackId) opt.selected = true;
    linkSel.appendChild(opt);
  });
  card.appendChild(field('Link to Splits Track (optional)', linkSel));

  // Notes
  const notesInp = makeInput(rec.notes, 'e.g. Use this ISRC when adding to album — do not reassign');
  card.appendChild(field('Notes', notesInp));

  const errorEl = el('p', 'form-error hidden');
  card.appendChild(errorEl);

  const formBtns = el('div', 'flex gap-2');
  const saveBtn = el('button', 'btn btn-primary-pink', initial ? 'Save Changes' : 'Register ISRC');
  const cancelBtn = el('button', 'btn btn-ghost', 'Cancel');
  formBtns.append(saveBtn, cancelBtn);
  card.appendChild(formBtns);

  saveBtn.addEventListener('click', () => {
    const title = titleInp.value.trim();
    const isrc = isrcInp.value.trim().replace(/-/g, '').toUpperCase();
    errorEl.classList.add('hidden');
    if (!title) { errorEl.textContent = 'Track title is required.'; errorEl.classList.remove('hidden'); return; }
    if (isrc && !validateISRC(isrc)) { errorEl.textContent = 'ISRC format invalid. Expected: CC-XXX-YY-NNNNN (12 chars).'; errorEl.classList.remove('hidden'); return; }
    onSave({
      id: rec.id, isrc, title,
      version: versionSel.value,
      artist: artistInp.value.trim(),
      year: yearInp.value.trim(),
      owner: ownerSel.value,
      registrant: registrantInp.value.trim(),
      upc: upcInp.value.trim(),
      upcOwner: upcOwnerSel.value,
      linkedTrackId: linkSel.value,
      notes: notesInp.value.trim(),
      createdAt: rec.createdAt,
    });
  });

  cancelBtn.addEventListener('click', onCancel);
  container.appendChild(card);
}

// ═══════════════════════════════════════════════════════════════
// ISRC Registry Tab
// ═══════════════════════════════════════════════════════════════

function renderISRCRow(rec, tracks, onEdit, onDelete) {
  const row = el('div', `isrc-row ${ownerClass(rec.owner)}`);

  const top = el('div', 'isrc-row__top');
  const info = el('div');
  const titleRow = el('div', 'flex items-center gap-2 flex-wrap');
  const title = el('span', 'isrc-row__title', rec.title);
  titleRow.appendChild(title);
  if (rec.version !== 'Original') {
    const badge = el('span', 'isrc-row__version-badge', rec.version);
    titleRow.appendChild(badge);
  }
  info.appendChild(titleRow);
  if (rec.artist) {
    const meta = el('div', 'isrc-row__meta', `${rec.artist} · ${rec.year}`);
    info.appendChild(meta);
  }
  top.appendChild(info);

  const actions = el('div', 'flex gap-2 items-center');
  const editBtn = el('button', 'btn btn-xs btn-icon-blue2', 'Edit');
  const delBtn = el('button', 'btn btn-xs btn-icon-red', 'Delete');
  editBtn.addEventListener('click', () => onEdit(rec));
  delBtn.addEventListener('click', () => {
    if (confirm(`Delete ISRC record "${rec.title}"?`)) onDelete(rec.id);
  });
  actions.append(editBtn, delBtn);
  top.appendChild(actions);
  row.appendChild(top);

  // Badges
  const badges = el('div', 'isrc-badges');

  // ISRC badge
  const isrcBadge = el('div', 'isrc-badge');
  const isrcLbl = el('div', 'isrc-badge__label', 'ISRC');
  const isrcVal = el('div', 'isrc-badge__val');
  const valid = rec.isrc && validateISRC(rec.isrc);
  isrcVal.textContent = rec.isrc ? formatISRC(rec.isrc) : '—';
  isrcVal.style.color = rec.isrc ? (valid ? 'var(--color-text)' : 'var(--color-red)') : 'var(--color-muted)';
  isrcBadge.append(isrcLbl, isrcVal);
  badges.appendChild(isrcBadge);

  // Ownership badge
  const ownBadge = el('div', 'isrc-badge');
  ownBadge.style.background = ownerColor(rec.owner) + '18';
  ownBadge.style.borderColor = ownerColor(rec.owner) + '44';
  ownBadge.style.borderStyle = 'solid';
  ownBadge.style.borderWidth = '1px';
  const ownLbl = el('div', 'isrc-badge__label', 'Ownership');
  const ownVal = el('div', 'isrc-badge__val', rec.owner);
  ownVal.style.color = ownerColor(rec.owner);
  ownVal.style.fontWeight = 'var(--weight-bold)';
  ownBadge.append(ownLbl, ownVal);
  badges.appendChild(ownBadge);

  if (rec.registrant) {
    const regBadge = el('div', 'isrc-badge');
    const regLbl = el('div', 'isrc-badge__label', 'Registrant');
    const regVal = el('div', 'isrc-badge__val', rec.registrant);
    regVal.style.color = 'var(--color-pink)';
    regBadge.append(regLbl, regVal);
    badges.appendChild(regBadge);
  }

  if (rec.upc) {
    const upcBadge = el('div', 'isrc-badge');
    const upcLbl = el('div', 'isrc-badge__label', `UPC · ${rec.upcOwner}`);
    const upcVal = el('div', 'isrc-badge__val', rec.upc);
    upcVal.style.color = ownerColor(rec.upcOwner);
    upcBadge.append(upcLbl, upcVal);
    badges.appendChild(upcBadge);
  }

  if (rec.linkedTrackId) {
    const linked = tracks.find(t => t.id === rec.linkedTrackId);
    if (linked) {
      const lkBadge = el('div', 'isrc-badge');
      lkBadge.style.background = 'rgba(91,127,166,.15)';
      const lkLbl = el('div', 'isrc-badge__label', 'Linked Track');
      const lkVal = el('div', 'isrc-badge__val');
      lkVal.textContent = `🔗 ${linked.title}`;
      lkVal.style.color = 'var(--color-blue)';
      lkBadge.append(lkLbl, lkVal);
      badges.appendChild(lkBadge);
    }
  }

  row.appendChild(badges);

  if (rec.notes) {
    const notes = el('div', 'isrc-row__notes', `📝 ${rec.notes}`);
    row.appendChild(notes);
  }

  return row;
}

function mountISRCTab(container) {
  let showForm = false;
  let editingRecord = null;
  let filterOwner = 'All';
  let searchQ = '';

  function render(s) {
    container.innerHTML = '';

    const pageHeader = el('div', 'page-header');
    pageHeader.appendChild(el('h2', 'page-title', '🔢 ISRC & UPC Registry'));
    container.appendChild(pageHeader);

    // Prefix config
    const prefixCard = el('div', 'prefix-config');
    const prefixTitle = el('div', 'prefix-config__title', '🔑 Your ISRC Registrant Prefix');
    const prefixDesc = el('p', 'prefix-config__desc');
    prefixDesc.textContent = 'The 3-character code embedded in all your self-owned ISRCs. Get this from ';
    const uLink = externalLink('USISRC.org', 'https://www.usisrc.org', '');
    uLink.style.color = 'var(--color-pink)';
    prefixDesc.appendChild(uLink);
    prefixDesc.appendChild(document.createTextNode(' under your LLC name. Once set, the Auto-Generate button uses this prefix.'));

    const prefixRow = el('div', 'flex gap-2 items-center flex-wrap');
    const prefixInp = el('input', 'prefix-input');
    prefixInp.value = s.registrantPrefix;
    prefixInp.maxLength = 3;
    prefixInp.placeholder = 'ABC';
    prefixInp.setAttribute('aria-label', 'ISRC Registrant Prefix');
    prefixInp.addEventListener('input', e => { prefixInp.value = e.target.value.toUpperCase().slice(0, 3); });

    const savePrefix = el('button', 'btn btn-sm btn-icon-pink', 'Save Prefix');
    savePrefix.addEventListener('click', () => {
      dispatch({ type: 'SET_PREFIX', prefix: prefixInp.value.toUpperCase().slice(0, 3) });
    });
    prefixRow.append(prefixInp, savePrefix);

    if (s.registrantPrefix) {
      const activeEl = el('span', 'prefix-active');
      activeEl.textContent = '✓ Active prefix: ';
      const prefixSpan = el('span', '', s.registrantPrefix);
      activeEl.appendChild(prefixSpan);
      prefixRow.appendChild(activeEl);
    }

    prefixCard.append(prefixTitle, prefixDesc, prefixRow);
    container.appendChild(prefixCard);

    // Stats
    const selfOwned = s.isrcRecords.filter(r => r.owner === 'Self-Owned').length;
    const distOwned = s.isrcRecords.filter(r => r.owner === 'Distributor-Owned').length;
    const unknown   = s.isrcRecords.filter(r => r.owner === 'Unknown').length;

    const statRow = el('div', 'stat-row');
    [
      ['Total ISRCs', s.isrcRecords.length, 'var(--color-pink)'],
      ['Self-Owned', selfOwned, 'var(--color-green)'],
      ['Distributor-Owned', distOwned, 'var(--color-red)'],
      ['Unknown', unknown, 'var(--color-muted)'],
    ].forEach(([label, val, color]) => {
      const pill = el('div', 'stat-pill');
      const v = el('div', 'stat-pill__val', String(val));
      v.style.color = color;
      const l = el('div', 'stat-pill__label', label);
      pill.append(v, l);
      statRow.appendChild(pill);
    });
    container.appendChild(statRow);

    // Form
    const formContainer = el('div');
    container.appendChild(formContainer);

    if (showForm) {
      mountISRCForm(
        formContainer,
        editingRecord,
        s.tracks,
        s.registrantPrefix,
        record => {
          dispatch({ type: editingRecord ? 'UPDATE_ISRC' : 'ADD_ISRC', record });
          showForm = false;
          editingRecord = null;
        },
        () => { showForm = false; editingRecord = null; render(state); }
      );
      return;
    }

    // Controls
    const filterBar = el('div', 'filter-bar');
    const chips = el('div', 'filter-chips');

    [
      { label: 'All',                activeClass: 'active-pink' },
      { label: 'Self-Owned',         activeClass: 'active-green' },
      { label: 'Distributor-Owned',  activeClass: 'active-red' },
      { label: 'Unknown',            activeClass: 'active-muted' },
    ].forEach(({ label, activeClass }) => {
      const chip = el('button', `filter-chip${filterOwner === label ? ' ' + activeClass : ''}`, label);
      chip.addEventListener('click', () => { filterOwner = label; render(state); });
      chips.appendChild(chip);
    });

    const rightRow = el('div', 'flex gap-2');
    const searchInp = el('input');
    searchInp.placeholder = 'Search ISRCs…';
    searchInp.value = searchQ;
    searchInp.style.maxWidth = '180px';
    searchInp.style.fontSize = 'var(--text-sm)';
    searchInp.style.padding = '6px 12px';
    searchInp.addEventListener('input', e => { searchQ = e.target.value; render(state); });

    const addBtn = el('button', 'btn btn-primary-pink', '+ Register ISRC');
    addBtn.addEventListener('click', () => { showForm = true; editingRecord = null; render(state); });
    rightRow.append(searchInp, addBtn);
    filterBar.append(chips, rightRow);
    container.appendChild(filterBar);

    // Distributor warning
    if (distOwned > 0) {
      const warn = el('div', 'alert-warn');
      warn.textContent = `⚠️ You have ${distOwned} distributor-owned ISRC${distOwned !== 1 ? 's' : ''} in your catalog. These codes are controlled by a third party. Consider re-releasing under self-owned codes and migrating your catalog.`;
      container.appendChild(warn);
    }

    // Filter records
    const q = searchQ.toLowerCase();
    const filtered = s.isrcRecords.filter(r => {
      const ownerMatch = filterOwner === 'All' || r.owner === filterOwner;
      const searchMatch = !q || r.title.toLowerCase().includes(q) || r.isrc.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q);
      return ownerMatch && searchMatch;
    });

    if (filtered.length === 0) {
      const empty = el('div', 'card-dashed');
      const icon = el('span', 'empty-icon', '🔢');
      const txt = el('p', 'empty-text',
        s.isrcRecords.length === 0
          ? 'No ISRCs registered yet. Every track and version needs its own ISRC.'
          : 'No records match your filter.'
      );
      empty.append(icon, txt);
      if (s.isrcRecords.length === 0) {
        const btn = el('button', 'btn btn-primary-pink', 'Register Your First ISRC');
        btn.addEventListener('click', () => { showForm = true; render(state); });
        empty.appendChild(btn);
      }
      container.appendChild(empty);
      return;
    }

    filtered.forEach(rec => {
      container.appendChild(renderISRCRow(
        rec, s.tracks,
        r => { editingRecord = r; showForm = true; render(state); },
        id => dispatch({ type: 'DELETE_ISRC', id })
      ));
    });
  }

  subscribe(render);
  render(state);
}

// ═══════════════════════════════════════════════════════════════
// Platform Directory Tab
// ═══════════════════════════════════════════════════════════════

function mountPlatformsTab(container) {
  let activeCat = 'All';
  let searchQ = '';

  function render() {
    container.innerHTML = '';

    const pageHeader = el('div', 'page-header');
    pageHeader.appendChild(el('h2', 'page-title', 'Promote, License & Stream'));
    container.appendChild(pageHeader);

    const intro = el('p', 'platform-intro',
      `${PLATFORMS.length} platforms across streaming, promotion, sync licensing, and live performance. Use multiple channels together for maximum reach and revenue.`
    );
    container.appendChild(intro);

    // Category filter
    const filterBar = el('div', 'cat-filter-bar');
    ['All', 'Streaming', 'Promotion', 'Licensing', 'Live'].forEach(cat => {
      const btn = el('button', `filter-chip${activeCat === cat ? ' active-pink' : ''}`, cat);
      if (activeCat === cat && cat !== 'All') {
        const c = CAT_COLORS[cat] || 'var(--color-gold)';
        btn.style.background = c + '22';
        btn.style.borderColor = c + '66';
        btn.style.color = c;
      }
      btn.addEventListener('click', () => { activeCat = cat; render(); });
      filterBar.appendChild(btn);
    });

    const searchInp = el('input', 'search-input');
    searchInp.placeholder = 'Search platforms…';
    searchInp.value = searchQ;
    searchInp.style.marginLeft = 'auto';
    searchInp.style.maxWidth = '200px';
    searchInp.style.fontSize = 'var(--text-sm)';
    searchInp.style.padding = '6px 12px';
    searchInp.addEventListener('input', e => { searchQ = e.target.value; render(); });
    filterBar.appendChild(searchInp);
    container.appendChild(filterBar);

    // Category counts
    const catStats = el('div', 'cat-stats');
    Object.entries(CAT_COLORS).forEach(([cat, color]) => {
      const count = PLATFORMS.filter(p => p.cat === cat).length;
      const cs = el('div', 'cat-stat');
      const dot = el('div', 'cat-dot');
      dot.style.background = color;
      const name = el('span', 'cat-stat__name', cat);
      const cnt = el('span', 'cat-stat__count', String(count));
      cnt.style.color = color;
      cs.append(dot, name, cnt);
      catStats.appendChild(cs);
    });
    container.appendChild(catStats);

    const q = searchQ.toLowerCase();
    const filtered = PLATFORMS.filter(p => {
      const catMatch = activeCat === 'All' || p.cat === activeCat;
      const searchMatch = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      return catMatch && searchMatch;
    });

    if (filtered.length === 0) {
      const empty = el('div', 'text-muted');
      empty.style.textAlign = 'center';
      empty.style.padding = '40px';
      empty.textContent = 'No platforms match your search.';
      container.appendChild(empty);
      return;
    }

    const grid = el('div', 'grid-auto');
    filtered.forEach(p => {
      const card = el('div', 'platform-card');
      card.style.borderTopColor = p.color;

      const head = el('div', 'platform-card__head');
      const iconBlock = el('div', 'platform-card__icon-block');
      const icon = el('span', 'platform-card__icon', p.icon);
      const nameBlock = el('div');
      const name = el('div', 'platform-card__name', p.name);
      const cat = el('span', 'platform-card__cat', p.cat);
      cat.style.color = CAT_COLORS[p.cat] || 'var(--color-muted)';
      nameBlock.append(name, cat);
      iconBlock.append(icon, nameBlock);

      const visitLink = externalLink('Visit ↗', p.url, 'platform-card__visit');
      visitLink.style.background = p.color + '22';
      visitLink.style.border = `1px solid ${p.color}55`;
      visitLink.style.color = p.color;

      head.append(iconBlock, visitLink);
      card.appendChild(head);

      const desc = el('p', 'platform-card__desc', p.desc);
      card.appendChild(desc);

      const tags = el('div', 'platform-card__tags');
      p.tags.forEach(t => tags.appendChild(el('span', 'tag', t)));
      card.appendChild(tags);

      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  render();
}

// ═══════════════════════════════════════════════════════════════
// Registration Guide Tab
// ═══════════════════════════════════════════════════════════════

function mountGuideTab(container) {
  container.innerHTML = '';

  const pageHeader = el('div', 'page-header');
  pageHeader.appendChild(el('h2', 'page-title', 'Registration & LLC Roadmap'));
  container.appendChild(pageHeader);

  const intro = el('p', 'guide-intro', 'Follow these phases to fully protect and monetize your music as an LLC. Complete them in order for maximum legal protection.');
  container.appendChild(intro);

  STEPS.forEach(phase => {
    const phaseEl = el('div', 'guide-phase');

    const btn = el('button', 'guide-phase__btn');
    btn.setAttribute('aria-expanded', 'false');
    const left = el('div', 'guide-phase__btn-left');
    const dot = el('div', 'phase-dot');
    dot.style.background = phase.color;
    const phaseName = el('span', '', phase.phase);
    const count = el('span', 'phase-count', `${phase.items.length} step${phase.items.length !== 1 ? 's' : ''}`);
    left.append(dot, phaseName, count);
    const chevron = el('span', 'phase-chevron', '▼');
    btn.append(left, chevron);

    const body = el('div', 'guide-phase__body');
    body.setAttribute('role', 'region');

    phase.items.forEach((item, ii) => {
      const step = el('div', 'guide-step');

      const num = el('div', 'step-num', String(ii + 1));
      num.style.background = phase.color + '22';
      num.style.border = `1px solid ${phase.color}`;
      num.style.color = phase.color;

      const content = el('div');
      const stepTitle = el('div', 'guide-step__title', item.title);
      const stepDetail = el('div', 'guide-step__detail', item.detail);
      content.append(stepTitle, stepDetail);

      if (item.links?.length) {
        const linksRow = el('div', 'guide-step__links');
        item.links.forEach(link => {
          const a = externalLink(`${link.label} ↗`, link.url, 'guide-link');
          a.style.color = phase.color;
          a.style.borderColor = phase.color + '44';
          linksRow.appendChild(a);
        });
        content.appendChild(linksRow);
      }

      step.append(num, content);
      body.appendChild(step);
    });

    btn.addEventListener('click', () => {
      const open = phaseEl.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

    phaseEl.append(btn, body);
    container.appendChild(phaseEl);
  });
}

// ═══════════════════════════════════════════════════════════════
// Header Stats
// ═══════════════════════════════════════════════════════════════

function mountHeaderStats(container) {
  function render(s) {
    container.innerHTML = '';
    const totalTracks = s.tracks.length;
    const totalCollabs = new Set(s.tracks.flatMap(t => t.splits.map(sp => sp.name.toLowerCase().trim()))).size;
    const totalISRCs = s.isrcRecords.length;
    const selfOwned = s.isrcRecords.filter(r => r.owner === 'Self-Owned').length;

    [
      [totalTracks,       'TRACKS',        'var(--color-gold)'],
      [totalCollabs,      'COLLABORATORS', 'var(--color-blue)'],
      [totalISRCs,        'ISRCs',         'var(--color-pink)'],
      [selfOwned,         'SELF-OWNED',    'var(--color-green)'],
      [PLATFORMS.length,  'PLATFORMS',     'var(--color-orange)'],
    ].forEach(([val, label, color]) => {
      const stat = el('div', 'stat');
      const v = el('div', 'stat__value', String(val));
      v.style.color = color;
      const l = el('div', 'stat__label', label);
      stat.append(v, l);
      container.appendChild(stat);
    });
  }

  subscribe(render);
  render(state);
}

// ═══════════════════════════════════════════════════════════════
// Tab Router
// ═══════════════════════════════════════════════════════════════

function initTabs() {
  const tabs = [
    { id: 'tracker',   label: 'Splits Tracker',     mount: mountTrackerTab },
    { id: 'isrc',      label: '🔢 ISRC Registry',    mount: mountISRCTab },
    { id: 'platforms', label: 'Promote & Stream',   mount: mountPlatformsTab },
    { id: 'guide',     label: 'Registration Guide', mount: mountGuideTab },
  ];

  const tabBar = document.getElementById('tab-bar');
  const panelsContainer = document.getElementById('tab-panels');

  tabs.forEach(tab => {
    // Tab button
    const btn = el('button', `tab-btn${state.activeTab === tab.id ? ' active' : ''}`, tab.label);
    btn.dataset.tab = tab.id;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(state.activeTab === tab.id));
    btn.addEventListener('click', () => {
      dispatch({ type: 'SET_TAB', tab: tab.id });
    });
    tabBar.appendChild(btn);

    // Panel
    const panel = el('div', `tab-panel${state.activeTab === tab.id ? ' active' : ''}`);
    panel.id = `panel-${tab.id}`;
    panel.setAttribute('role', 'tabpanel');
    panelsContainer.appendChild(panel);

    // Static mounts (platforms & guide don't need re-renders)
    if (tab.id === 'platforms' || tab.id === 'guide') {
      tab.mount(panel);
    }
  });

  // Dynamic mounts (tracker & isrc react to state)
  mountTrackerTab(document.getElementById('panel-tracker'));
  mountISRCTab(document.getElementById('panel-isrc'));

  // Tab switching
  subscribe(s => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const active = btn.dataset.tab === s.activeTab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${s.activeTab}`);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  mountHeaderStats(document.getElementById('header-stats'));
  initTabs();
});
