import { useState, useReducer } from "react";

const COLORS = {
  bg: "#0D0D0D", surface: "#161616", card: "#1E1E1E", border: "#2A2A2A",
  gold: "#C9A84C", goldDim: "#8A6E2F", green: "#4CAF7A", red: "#CF6679",
  text: "#EDE8DC", muted: "#8A8A8A", accent2: "#5B7FA6", pink: "#F06292",
};

const ROLES = ["Artist","Producer","Songwriter","Engineer","Co-Writer","Featured","Publisher","Label","Other"];
const SPLIT_COLORS = ["#C9A84C","#5B7FA6","#4CAF7A","#CF6679","#A06DB3","#E88C3A","#59BAB5","#D4C97A"];
const TRACK_VERSIONS = ["Original","Radio Edit","Remix","Acoustic","Instrumental","Extended","Live","Demo","Other"];
const CODE_OWNERS = ["Self-Owned","Distributor-Owned","Unknown"];

function uuid() { return Math.random().toString(36).slice(2, 10); }

// ─── State & Reducer ──────────────────────────────────────────────────────────
const initialState = {
  tracks: [],
  isrcRecords: [],   // { id, isrc, title, version, artist, year, owner, registrant, notes, linkedTrackId, upc }
  releases: [],      // { id, title, type, upc, upcOwner, releaseDate, tracks: [isrcId] }
  registrantPrefix: "",
  activeTab: "tracker",
  editingTrack: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TRACK":    return { ...state, tracks: [...state.tracks, action.track] };
    case "UPDATE_TRACK": return { ...state, tracks: state.tracks.map(t => t.id===action.track.id ? action.track : t), editingTrack: null };
    case "DELETE_TRACK": return { ...state, tracks: state.tracks.filter(t => t.id!==action.id) };
    case "ADD_ISRC":     return { ...state, isrcRecords: [...state.isrcRecords, action.record] };
    case "UPDATE_ISRC":  return { ...state, isrcRecords: state.isrcRecords.map(r => r.id===action.record.id ? action.record : r) };
    case "DELETE_ISRC":  return { ...state, isrcRecords: state.isrcRecords.filter(r => r.id!==action.id) };
    case "ADD_RELEASE":     return { ...state, releases: [...state.releases, action.release] };
    case "UPDATE_RELEASE":  return { ...state, releases: state.releases.map(r => r.id===action.release.id ? action.release : r) };
    case "DELETE_RELEASE":  return { ...state, releases: state.releases.filter(r => r.id!==action.id) };
    case "SET_PREFIX":   return { ...state, registrantPrefix: action.prefix };
    case "SET_TAB":      return { ...state, activeTab: action.tab, editingTrack: null };
    case "SET_EDITING":  return { ...state, editingTrack: action.track };
    default: return state;
  }
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const labelStyle = { display:"block", color:COLORS.muted, fontSize:12, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" };
const inputStyle = { width:"100%", background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:6, color:COLORS.text, padding:"9px 12px", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"Inter,sans-serif" };
const primaryBtnStyle = { background:COLORS.gold, color:"#0D0D0D", border:"none", borderRadius:7, padding:"10px 20px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif" };
const ghostBtnStyle = { background:"none", border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:7, padding:"10px 20px", fontSize:14, cursor:"pointer" };
const dangerBtnStyle = { background:COLORS.red+"18", border:`1px solid ${COLORS.red}44`, color:COLORS.red, borderRadius:5, padding:"4px 10px", fontSize:12, cursor:"pointer", fontWeight:600 };
function smallBtnStyle(color) { return { background:color+"22", border:`1px solid ${color}44`, color, borderRadius:5, padding:"5px 12px", fontSize:12, cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600 }; }
function iconBtnStyle(color) { return { background:color+"18", border:`1px solid ${color}33`, color, borderRadius:5, padding:"4px 10px", fontSize:12, cursor:"pointer", fontWeight:600 }; }

function ownerColor(owner) {
  if (owner === "Self-Owned") return COLORS.green;
  if (owner === "Distributor-Owned") return COLORS.red;
  return COLORS.muted;
}

// ─── Split Bar ────────────────────────────────────────────────────────────────
function SplitBar({ splits }) {
  const total = splits.reduce((s, sp) => s + sp.pct, 0);
  return (
    <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", background:COLORS.border, width:"100%" }}>
      {splits.map((sp, i) => (
        <div key={sp.id} title={`${sp.name}: ${sp.pct}%`}
          style={{ width:`${total>0?(sp.pct/total)*100:0}%`, background:SPLIT_COLORS[i%SPLIT_COLORS.length], transition:"width 0.4s ease" }} />
      ))}
    </div>
  );
}

// ─── Track Form ───────────────────────────────────────────────────────────────
function defaultSplit() { return { id:uuid(), name:"", role:"Artist", pct:0 }; }

function TrackForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title || "");
  const [isrc, setIsrc] = useState(initial?.isrc || "");
  const [splits, setSplits] = useState(initial?.splits || [defaultSplit()]);
  const [error, setError] = useState("");
  const total = splits.reduce((s, sp) => s + Number(sp.pct), 0);
  const balanced = Math.abs(total - 100) < 0.01;

  function addSplit() { setSplits([...splits, defaultSplit()]); }
  function removeSplit(id) { setSplits(splits.filter(s => s.id !== id)); }
  function updateSplit(id, field, val) {
    setSplits(splits.map(s => s.id===id ? { ...s, [field]: field==="pct" ? Math.max(0,Math.min(100,Number(val))) : val } : s));
  }
  function autoBalance() {
    const even = +(100/splits.length).toFixed(2);
    setSplits(splits.map((s,i) => ({ ...s, pct: i===splits.length-1 ? +(100-even*(splits.length-1)).toFixed(2) : even })));
  }
  function handleSave() {
    if (!title.trim()) return setError("Track title is required.");
    if (splits.some(s => !s.name.trim())) return setError("All split holders need a name.");
    if (!balanced) return setError(`Splits must add up to 100%. Currently: ${total.toFixed(2)}%`);
    setError("");
    onSave({ id:initial?.id||uuid(), title:title.trim(), isrc:isrc.trim(), splits, createdAt:initial?.createdAt||new Date().toISOString() });
  }

  return (
    <div style={{ background:COLORS.card, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:24, marginBottom:24 }}>
      <h3 style={{ color:COLORS.gold, fontFamily:"'Space Grotesk',sans-serif", margin:"0 0 20px", fontSize:18 }}>{isEdit?"Edit Track":"Add New Track"}</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div><label style={labelStyle}>Track Title *</label><input style={inputStyle} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Midnight Drive" /></div>
        <div><label style={labelStyle}>ISRC (optional)</label><input style={inputStyle} value={isrc} onChange={e=>setIsrc(e.target.value)} placeholder="e.g. USRC17607839" /></div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <label style={{ ...labelStyle, margin:0 }}>Splits</label>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={autoBalance} style={smallBtnStyle("#5B7FA6")}>Auto-Balance</button>
          <button onClick={addSplit} style={smallBtnStyle(COLORS.gold)}>+ Add Person</button>
        </div>
      </div>
      <div style={{ marginBottom:12 }}>
        <SplitBar splits={splits} />
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:4 }}>
          <span style={{ fontSize:12, color:balanced?COLORS.green:COLORS.red, fontFamily:"monospace" }}>{total.toFixed(2)}% / 100%</span>
        </div>
      </div>
      {splits.map((sp) => (
        <div key={sp.id} style={{ display:"grid", gridTemplateColumns:"1fr 160px 90px 32px", gap:8, marginBottom:8, alignItems:"center" }}>
          <input style={inputStyle} placeholder="Name" value={sp.name} onChange={e=>updateSplit(sp.id,"name",e.target.value)} />
          <select style={inputStyle} value={sp.role} onChange={e=>updateSplit(sp.id,"role",e.target.value)}>
            {ROLES.map(r=><option key={r}>{r}</option>)}
          </select>
          <div style={{ position:"relative" }}>
            <input type="number" min={0} max={100} step={0.01} style={{ ...inputStyle, paddingRight:24 }} value={sp.pct} onChange={e=>updateSplit(sp.id,"pct",e.target.value)} />
            <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:COLORS.muted, fontSize:13 }}>%</span>
          </div>
          <button onClick={()=>removeSplit(sp.id)} disabled={splits.length===1}
            style={{ background:"none", border:"none", color:splits.length===1?COLORS.border:COLORS.red, cursor:"pointer", fontSize:18, padding:0 }}>×</button>
        </div>
      ))}
      {error && <p style={{ color:COLORS.red, fontSize:13, margin:"8px 0" }}>{error}</p>}
      <div style={{ display:"flex", gap:10, marginTop:16 }}>
        <button onClick={handleSave} style={primaryBtnStyle}>{isEdit?"Save Changes":"Add Track"}</button>
        <button onClick={onCancel} style={ghostBtnStyle}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Track Card ───────────────────────────────────────────────────────────────
function TrackCard({ track, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:16, marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", color:COLORS.text, fontSize:16, fontWeight:600 }}>{track.title}</div>
          {track.isrc && <div style={{ color:COLORS.muted, fontSize:12, fontFamily:"monospace", marginTop:2 }}>ISRC: {track.isrc}</div>}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>onEdit(track)} style={iconBtnStyle(COLORS.accent2)}>Edit</button>
          <button onClick={()=>onDelete(track.id)} style={dangerBtnStyle}>Delete</button>
        </div>
      </div>
      <SplitBar splits={track.splits} />
      <div style={{ marginTop:10 }}>
        <button onClick={()=>setExpanded(!expanded)} style={{ background:"none", border:"none", color:COLORS.muted, fontSize:12, cursor:"pointer", padding:0 }}>
          {expanded?"▲ Hide":"▼ Show"} {track.splits.length} split{track.splits.length!==1?"s":""}
        </button>
        {expanded && (
          <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:8 }}>
            {track.splits.map((sp,i) => (
              <div key={sp.id} style={{ background:COLORS.surface, border:`1px solid ${SPLIT_COLORS[i%SPLIT_COLORS.length]}44`, borderLeft:`3px solid ${SPLIT_COLORS[i%SPLIT_COLORS.length]}`, borderRadius:6, padding:"6px 12px", fontSize:13 }}>
                <div style={{ color:COLORS.text, fontWeight:600 }}>{sp.name}</div>
                <div style={{ color:COLORS.muted, fontSize:11 }}>{sp.role}</div>
                <div style={{ color:SPLIT_COLORS[i%SPLIT_COLORS.length], fontFamily:"monospace", fontWeight:700 }}>{sp.pct}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ISRC Registry ────────────────────────────────────────────────────────────
function defaultISRC() {
  return { id:uuid(), isrc:"", title:"", version:"Original", artist:"", year:new Date().getFullYear().toString(), owner:"Self-Owned", registrant:"", upc:"", upcOwner:"Self-Owned", notes:"", linkedTrackId:"", createdAt:new Date().toISOString() };
}

function validateISRC(code) {
  return /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/.test(code.replace(/-/g,""));
}

function ISRCForm({ initial, tracks, registrantPrefix, onSave, onCancel }) {
  const isEdit = !!initial;
  const [rec, setRec] = useState(initial || defaultISRC());
  const [error, setError] = useState("");

  function set(field, val) { setRec(r => ({ ...r, [field]: val })); }

  function handleSave() {
    if (!rec.title.trim()) return setError("Track title is required.");
    if (rec.isrc && !validateISRC(rec.isrc)) return setError("ISRC format invalid. Expected: CC-XXX-YY-NNNNN (12 chars, e.g. USABC2400001).");
    setError("");
    onSave({ ...rec, isrc: rec.isrc.replace(/-/g,"").toUpperCase() });
  }

  function autoGenerateISRC() {
    if (!registrantPrefix || registrantPrefix.length !== 3) return setError("Set your 3-character Registrant Prefix in the settings bar above first.");
    const country = "US";
    const year = new Date().getFullYear().toString().slice(2);
    const seq = Math.floor(Math.random()*99999).toString().padStart(5,"0");
    set("isrc", `${country}${registrantPrefix.toUpperCase()}${year}${seq}`);
    set("owner", "Self-Owned");
    set("registrant", registrantPrefix.toUpperCase());
    setError("");
  }

  return (
    <div style={{ background:COLORS.card, borderRadius:12, border:`1px solid ${COLORS.border}`, padding:24, marginBottom:24 }}>
      <h3 style={{ color:COLORS.pink, fontFamily:"'Space Grotesk',sans-serif", margin:"0 0 20px", fontSize:18 }}>
        {isEdit ? "Edit ISRC Record" : "Register New ISRC"}
      </h3>

      {/* Row 1: Title + Version */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
        <div><label style={labelStyle}>Track Title *</label><input style={inputStyle} value={rec.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Midnight Drive" /></div>
        <div><label style={labelStyle}>Version</label>
          <select style={inputStyle} value={rec.version} onChange={e=>set("version",e.target.value)}>
            {TRACK_VERSIONS.map(v=><option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Artist + Year */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
        <div><label style={labelStyle}>Artist / Rights Holder</label><input style={inputStyle} value={rec.artist} onChange={e=>set("artist",e.target.value)} placeholder="e.g. Your LLC Name" /></div>
        <div><label style={labelStyle}>Year of Recording</label><input style={inputStyle} type="number" value={rec.year} onChange={e=>set("year",e.target.value)} placeholder="2024" /></div>
      </div>

      {/* ISRC Code */}
      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>ISRC Code</label>
        <div style={{ display:"flex", gap:8 }}>
          <input style={{ ...inputStyle, fontFamily:"monospace", letterSpacing:"0.08em" }} value={rec.isrc} onChange={e=>set("isrc",e.target.value.toUpperCase())} placeholder="e.g. USABC2400001" maxLength={15} />
          <button onClick={autoGenerateISRC} style={{ ...smallBtnStyle(COLORS.pink), whiteSpace:"nowrap", padding:"9px 14px" }}>⚡ Auto-Generate</button>
        </div>
        {rec.isrc && (
          <div style={{ marginTop:6, fontSize:12, color: validateISRC(rec.isrc) ? COLORS.green : COLORS.red }}>
            {validateISRC(rec.isrc) ? "✓ Valid ISRC format" : "✗ Invalid format — must be 12 chars: CC + 3-char registrant + 2-digit year + 5-digit sequence"}
          </div>
        )}
      </div>

      {/* Ownership + Registrant */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
        <div><label style={labelStyle}>Code Ownership</label>
          <select style={{ ...inputStyle, color: ownerColor(rec.owner) }} value={rec.owner} onChange={e=>set("owner",e.target.value)}>
            {CODE_OWNERS.map(o=><option key={o} style={{ color:COLORS.text }}>{o}</option>)}
          </select>
        </div>
        <div><label style={labelStyle}>Registrant Prefix (3 chars)</label><input style={{ ...inputStyle, fontFamily:"monospace" }} value={rec.registrant} onChange={e=>set("registrant",e.target.value.toUpperCase().slice(0,3))} placeholder="e.g. ABC" maxLength={3} /></div>
      </div>

      {/* UPC Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
        <div><label style={labelStyle}>Release UPC (if assigned)</label><input style={{ ...inputStyle, fontFamily:"monospace" }} value={rec.upc} onChange={e=>set("upc",e.target.value)} placeholder="e.g. 012345678901" /></div>
        <div><label style={labelStyle}>UPC Ownership</label>
          <select style={{ ...inputStyle, color: ownerColor(rec.upcOwner) }} value={rec.upcOwner} onChange={e=>set("upcOwner",e.target.value)}>
            {CODE_OWNERS.map(o=><option key={o} style={{ color:COLORS.text }}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Link to splits track */}
      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>Link to Splits Track (optional)</label>
        <select style={inputStyle} value={rec.linkedTrackId} onChange={e=>set("linkedTrackId",e.target.value)}>
          <option value="">— Not linked —</option>
          {tracks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      {/* Notes */}
      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>Notes</label>
        <input style={inputStyle} value={rec.notes} onChange={e=>set("notes",e.target.value)} placeholder="e.g. Use this ISRC when adding to album — do not reassign" />
      </div>

      {error && <p style={{ color:COLORS.red, fontSize:13, margin:"8px 0" }}>{error}</p>}
      <div style={{ display:"flex", gap:10, marginTop:16 }}>
        <button onClick={handleSave} style={{ ...primaryBtnStyle, background:COLORS.pink }}>
          {isEdit ? "Save Changes" : "Register ISRC"}
        </button>
        <button onClick={onCancel} style={ghostBtnStyle}>Cancel</button>
      </div>
    </div>
  );
}

function ISRCRow({ rec, tracks, onEdit, onDelete }) {
  const linkedTrack = tracks.find(t => t.id === rec.linkedTrackId);
  const isValid = rec.isrc && validateISRC(rec.isrc);
  return (
    <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderLeft:`3px solid ${ownerColor(rec.owner)}`, borderRadius:8, padding:"14px 16px", marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, color:COLORS.text, fontSize:15 }}>{rec.title}</span>
            {rec.version !== "Original" && (
              <span style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:3, padding:"1px 7px", fontSize:11, color:COLORS.muted }}>{rec.version}</span>
            )}
          </div>
          {rec.artist && <div style={{ color:COLORS.muted, fontSize:12, marginTop:2 }}>{rec.artist} · {rec.year}</div>}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={()=>onEdit(rec)} style={iconBtnStyle(COLORS.accent2)}>Edit</button>
          <button onClick={()=>onDelete(rec.id)} style={dangerBtnStyle}>Delete</button>
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:10, alignItems:"center" }}>
        {/* ISRC */}
        <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:5, padding:"5px 10px" }}>
          <div style={{ fontSize:10, color:COLORS.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>ISRC</div>
          <div style={{ fontFamily:"monospace", fontSize:13, color: rec.isrc ? (isValid ? COLORS.text : COLORS.red) : COLORS.muted, letterSpacing:"0.08em" }}>
            {rec.isrc ? rec.isrc.replace(/(.{2})(.{3})(.{2})(.{5})/,"$1-$2-$3-$4") : "—"}
          </div>
        </div>

        {/* Ownership badge */}
        <div style={{ background:ownerColor(rec.owner)+"18", border:`1px solid ${ownerColor(rec.owner)}44`, borderRadius:5, padding:"5px 10px" }}>
          <div style={{ fontSize:10, color:COLORS.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Ownership</div>
          <div style={{ fontSize:12, color:ownerColor(rec.owner), fontWeight:700 }}>{rec.owner}</div>
        </div>

        {/* Registrant */}
        {rec.registrant && (
          <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:5, padding:"5px 10px" }}>
            <div style={{ fontSize:10, color:COLORS.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Registrant</div>
            <div style={{ fontFamily:"monospace", fontSize:13, color:COLORS.pink }}>{rec.registrant}</div>
          </div>
        )}

        {/* UPC */}
        {rec.upc && (
          <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:5, padding:"5px 10px" }}>
            <div style={{ fontSize:10, color:COLORS.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>UPC · {rec.upcOwner}</div>
            <div style={{ fontFamily:"monospace", fontSize:12, color: ownerColor(rec.upcOwner) }}>{rec.upc}</div>
          </div>
        )}

        {/* Linked track */}
        {linkedTrack && (
          <div style={{ background:"#5B7FA622", border:`1px solid #5B7FA644`, borderRadius:5, padding:"5px 10px" }}>
            <div style={{ fontSize:10, color:COLORS.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Linked Track</div>
            <div style={{ fontSize:12, color:COLORS.accent2 }}>🔗 {linkedTrack.title}</div>
          </div>
        )}
      </div>

      {rec.notes && <div style={{ marginTop:8, fontSize:12, color:COLORS.muted, fontStyle:"italic" }}>📝 {rec.notes}</div>}
    </div>
  );
}

function ISRCRegistry({ state, dispatch }) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterOwner, setFilterOwner] = useState("All");
  const [search, setSearch] = useState("");
  const [prefixInput, setPrefixInput] = useState(state.registrantPrefix);

  const filtered = state.isrcRecords.filter(r => {
    const ownerMatch = filterOwner==="All" || r.owner===filterOwner;
    const q = search.toLowerCase();
    const searchMatch = !search || r.title.toLowerCase().includes(q) || r.isrc.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q);
    return ownerMatch && searchMatch;
  });

  const selfOwned = state.isrcRecords.filter(r=>r.owner==="Self-Owned").length;
  const distOwned = state.isrcRecords.filter(r=>r.owner==="Distributor-Owned").length;
  const unknown = state.isrcRecords.filter(r=>r.owner==="Unknown").length;

  function handleSave(record) {
    dispatch({ type: editingRecord ? "UPDATE_ISRC" : "ADD_ISRC", record });
    setShowForm(false);
    setEditingRecord(null);
  }
  function handleEdit(rec) { setEditingRecord(rec); setShowForm(true); }
  function handleCancel() { setEditingRecord(null); setShowForm(false); }
  function savePrefix() { dispatch({ type:"SET_PREFIX", prefix: prefixInput.toUpperCase().slice(0,3) }); }

  return (
    <div>
      {/* Registrant Prefix Config */}
      <div style={{ background:COLORS.card, border:`1px solid ${COLORS.pink}44`, borderRadius:10, padding:16, marginBottom:20 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, color:COLORS.pink, fontSize:14, marginBottom:8 }}>
          🔑 Your ISRC Registrant Prefix
        </div>
        <p style={{ color:COLORS.muted, fontSize:12, lineHeight:1.6, marginBottom:12 }}>
          The 3-character code embedded in all your self-owned ISRCs. Get this from <a href="https://www.usisrc.org" target="_blank" rel="noreferrer" style={{ color:COLORS.pink }}>USISRC.org</a> under your LLC name. Once set, the Auto-Generate button uses this prefix.
        </p>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input style={{ ...inputStyle, maxWidth:120, fontFamily:"monospace", fontSize:16, letterSpacing:"0.15em", textTransform:"uppercase", fontWeight:700 }}
            value={prefixInput} maxLength={3}
            onChange={e=>setPrefixInput(e.target.value.toUpperCase().slice(0,3))}
            placeholder="ABC" />
          <button onClick={savePrefix} style={smallBtnStyle(COLORS.pink)}>Save Prefix</button>
          {state.registrantPrefix && (
            <span style={{ color:COLORS.green, fontSize:13 }}>✓ Active prefix: <span style={{ fontFamily:"monospace", fontWeight:700 }}>{state.registrantPrefix}</span></span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        {[["Total ISRCs", state.isrcRecords.length, COLORS.pink],["Self-Owned",selfOwned,COLORS.green],["Distributor-Owned",distOwned,COLORS.red],["Unknown",unknown,COLORS.muted]].map(([label,val,color])=>(
          <div key={label} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:7, padding:"8px 16px", textAlign:"center" }}>
            <div style={{ color, fontWeight:700, fontSize:20, fontFamily:"'Space Grotesk',sans-serif" }}>{val}</div>
            <div style={{ color:COLORS.muted, fontSize:11 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      {!showForm && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["All","Self-Owned","Distributor-Owned","Unknown"].map(o=>(
              <button key={o} onClick={()=>setFilterOwner(o)}
                style={{ background:filterOwner===o?ownerColor(o==="All"?COLORS.pink:o)+"22":COLORS.surface, border:`1px solid ${filterOwner===o?ownerColor(o==="All"?COLORS.pink:o):COLORS.border}`, color:filterOwner===o?ownerColor(o==="All"?COLORS.pink:o):COLORS.muted, borderRadius:5, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {o}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ISRCs..."
              style={{ ...inputStyle, maxWidth:180, fontSize:12, padding:"6px 12px" }} />
            <button onClick={()=>{ setEditingRecord(null); setShowForm(true); }} style={{ ...primaryBtnStyle, background:COLORS.pink }}>
              + Register ISRC
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <ISRCForm initial={editingRecord} tracks={state.tracks} registrantPrefix={state.registrantPrefix} onSave={handleSave} onCancel={handleCancel} />
      )}

      {distOwned > 0 && !showForm && (
        <div style={{ background:COLORS.red+"12", border:`1px solid ${COLORS.red}44`, borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:COLORS.red }}>
          ⚠️ You have {distOwned} distributor-owned ISRC{distOwned!==1?"s":""} in your catalog. These codes are controlled by a third party. Consider re-releasing under self-owned codes and migrating your catalog.
        </div>
      )}

      {filtered.length === 0 && !showForm && (
        <div style={{ background:COLORS.card, border:`1px dashed ${COLORS.border}`, borderRadius:12, padding:48, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🔢</div>
          <div style={{ color:COLORS.muted, fontSize:15, marginBottom:16 }}>
            {state.isrcRecords.length === 0 ? "No ISRCs registered yet. Every track and version needs its own ISRC." : "No records match your filter."}
          </div>
          {state.isrcRecords.length === 0 && (
            <button onClick={()=>setShowForm(true)} style={{ ...primaryBtnStyle, background:COLORS.pink }}>Register Your First ISRC</button>
          )}
        </div>
      )}

      {filtered.map(rec => (
        <ISRCRow key={rec.id} rec={rec} tracks={state.tracks} onEdit={handleEdit} onDelete={id=>dispatch({ type:"DELETE_ISRC", id })} />
      ))}
    </div>
  );
}

// ─── Registration Guide ───────────────────────────────────────────────────────
const STEPS = [
  { phase:"Entity & Business", color:"#C9A84C", items:[
    { title:"Form Your LLC", detail:"File Articles of Organization in your state through the Secretary of State website. Choose a name that doesn't conflict with existing entities. Pay the filing fee ($50–$500 depending on state). Illinois filers go to ilsos.gov.", links:[{label:"Illinois SOS",url:"https://www.ilsos.gov/departments/business_services/llc.html"}] },
    { title:"Get an EIN", detail:"Apply free at IRS.gov. You'll need this to open a business bank account, file taxes as the LLC, and receive royalty payments properly.", links:[{label:"IRS EIN Application",url:"https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online"}] },
    { title:"Open a Business Bank Account", detail:"Keep all music revenue separate from personal funds. This protects your LLC status and simplifies royalty accounting." },
    { title:"Operating Agreement", detail:"Draft an operating agreement — especially critical if the LLC has multiple members (e.g., band or co-producer). This governs how splits are paid out to the LLC and how the LLC distributes internally." },
  ]},
  { phase:"Metadata Sovereignty (ISRC & UPC Ownership)", color:"#F06292", items:[
    { title:"⚠️ The Distributor Code Trap", detail:"When distributors assign 'free' ISRC and UPC codes, their registrant prefix is baked permanently into your metadata — not yours. If you ever switch distributors, you lose continuity: play counts, playlist placements, and algorithmic momentum won't transfer. Distributors also pool millions of tracks under their prefixes and capture unclaimed 'black box' royalties that belong to you." },
    { title:"Own Your ISRC Registrant Code", detail:"Apply for your own permanent 3-character Registrant Code at USISRC.org under your LLC name. Once approved, you self-assign ISRCs to every track using a spreadsheet — or the ISRC Registry tab in this app. This ties your catalog to your entity permanently.", links:[{label:"USISRC.org",url:"https://www.usisrc.org"}] },
    { title:"Own Your UPC via GS1 US", detail:"Purchase a Company Prefix from GS1 US. Choose an inventory tier based on how many releases you plan. Your LLC name gets permanently tied to the GS1 GEPIR ownership database — every barcode you generate is legally yours.", links:[{label:"GS1 US",url:"https://www.gs1us.org"}] },
    { title:"Understand ISRC vs UPC vs ISWC", detail:"ISRC (12 chars) = unique ID for a specific sound recording. Every version needs its own ISRC. UPC = the barcode on the release package (single, EP, LP). ISWC = the identifier for the underlying composition, assigned by CISAC through your PRO." },
    { title:"Waterfall Releases: Reuse ISRCs, New UPCs", detail:"When moving a previously released single onto an EP or album, reuse the exact same ISRC for that audio file. This merges stream histories on DSPs. Assign a brand-new UPC to the album package — reusing the single's UPC causes ingestion errors." },
    { title:"Audit Your Existing Catalog", detail:"Use ISRCFinder.com and UPCFinder.com to look up codes already assigned to your tracks and identify distributor-owned vs. self-owned codes.", links:[{label:"ISRCFinder",url:"https://isrcfinder.com"},{label:"UPCFinder",url:"https://upcfinder.com"}] },
    { title:"Register with Luminate & Mediabase", detail:"Once you own your ISRC prefix, register titles natively with Luminate (Billboard charts) and Mediabase (radio airplay). This unlocks chart eligibility and accurate royalty attribution." },
    { title:"Use Distributor-Sovereign Platforms", detail:"Symphonic Distribution and TooLost cleanly support ingestion of artist-owned ISRCs and UPCs without overwriting your metadata.", links:[{label:"Symphonic",url:"https://symphonicdistribution.com"},{label:"TooLost",url:"https://toolost.com"}] },
  ]},
  { phase:"Copyright Registration", color:"#5B7FA6", items:[
    { title:"Register with the U.S. Copyright Office", detail:"Register each composition (lyrics + melody) and sound recording separately at copyright.gov. File online for $45–$65 per work.", links:[{label:"Copyright.gov",url:"https://www.copyright.gov/registration/"}] },
    { title:"Understand the Two Copyrights", detail:"(1) The Composition — melody and lyrics, owned by the songwriter/publisher. (2) The Sound Recording (Master) — the specific recorded performance. Register BOTH." },
    { title:"Register Early", detail:"Register within 3 months of publication to be eligible for statutory damages ($750–$150,000 per work) and attorney's fees." },
  ]},
  { phase:"PRO & ISWC Registration", color:"#4CAF7A", items:[
    { title:"Join a PRO", detail:"Choose one: ASCAP, BMI, or SESAC. Register as a songwriter/publisher member AND register your LLC as a publishing entity to capture both the writer's share and publisher's share of performance royalties.", links:[{label:"ASCAP",url:"https://www.ascap.com/music-creators/join"},{label:"BMI",url:"https://www.bmi.com/creators"},{label:"SESAC",url:"https://www.sesac.com"}] },
    { title:"Register Each Song with Your PRO", detail:"After joining, register every track with its title, ISRC, co-writer splits, and publisher info. This triggers royalty collection and distribution." },
    { title:"Register Your LLC as Publisher", detail:"This captures the publisher's share (50%) of performance royalties on top of your writer's share." },
    { title:"ISWC — The Composition Identifier", detail:"When you register a song with your PRO, CISAC assigns an ISWC (International Standard Musical Work Code) to the composition. This is separate from the ISRC. The ISWC is what collection societies worldwide use to route publishing royalties back to you." },
  ]},
  { phase:"Mechanical Royalties", color:"#A06DB3", items:[
    { title:"Register with MLC", detail:"The MLC collects mechanical royalties from U.S. digital streaming services (Spotify, Apple Music, etc.). Free to join. Register your songs here separately from your PRO.", links:[{label:"The MLC",url:"https://www.themlc.com"}] },
    { title:"Distributor + Mechanical Collection", detail:"Confirm your distributor handles mechanical licensing or register separately with MLC." },
    { title:"⚠️ The Black Box Royalty Trap", detail:"Collection societies hold massive pools of unclaimed royalties due to messy metadata. After a set period, they redistribute these funds proportionally to top catalog holders. Distributors pooling millions of tracks under their own ISRC prefixes routinely capture this money. Owning your own ISRC prefix routes royalties to you — not the distributor." },
  ]},
  { phase:"Distribution & Sync", color:"#E88C3A", items:[
    { title:"Choose a Music Distributor", detail:"DistroKid, TuneCore, CD Baby, or AWAL get your music on DSPs. For catalog sovereignty, use Symphonic or TooLost — they support your own ISRC/UPC ingestion." },
    { title:"Get an ISRC Code for Every Track", detail:"Do NOT rely on distributor-assigned codes. Own your registrant prefix via USISRC.org and track every assignment in the ISRC Registry tab.", links:[{label:"USISRC.org",url:"https://www.usisrc.org"}] },
    { title:"Register for Sync Licensing", detail:"Sync royalties come from TV, film, ads, and games. Register with Musicbed or Artlist, or work with a sync agent. Your LLC owns and licenses the master." },
  ]},
  { phase:"Neighboring Rights & International", color:"#59BAB5", items:[
    { title:"Collect Neighboring Rights", detail:"Collect through SoundExchange in the US for digital/satellite radio performance royalties paid to master owners.", links:[{label:"SoundExchange",url:"https://www.soundexchange.com"}] },
    { title:"Use Songtrust for Global Collection", detail:"Songtrust registers your songs with 60+ collection societies worldwide for international mechanical royalties.", links:[{label:"Songtrust",url:"https://www.songtrust.com"}] },
  ]},
];

function RegistrationGuide() {
  const [openPhase, setOpenPhase] = useState(null);
  return (
    <div>
      <p style={{ color:COLORS.muted, fontSize:14, marginBottom:24, lineHeight:1.6 }}>Follow these phases to fully protect and monetize your music as an LLC. Complete them in order for maximum legal protection.</p>
      {STEPS.map((phase,pi) => (
        <div key={pi} style={{ marginBottom:12, border:`1px solid ${COLORS.border}`, borderRadius:10, overflow:"hidden" }}>
          <button onClick={()=>setOpenPhase(openPhase===pi?null:pi)}
            style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", background:COLORS.card, border:"none", cursor:"pointer", color:COLORS.text, fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:600 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:phase.color, flexShrink:0 }} />
              <span>{phase.phase}</span>
              <span style={{ fontSize:12, color:COLORS.muted, fontWeight:400 }}>{phase.items.length} step{phase.items.length!==1?"s":""}</span>
            </div>
            <span style={{ color:COLORS.muted }}>{openPhase===pi?"▲":"▼"}</span>
          </button>
          {openPhase===pi && (
            <div style={{ padding:18, borderTop:`1px solid ${COLORS.border}` }}>
              {phase.items.map((item,ii) => (
                <div key={ii} style={{ marginBottom:ii<phase.items.length-1?16:0, paddingBottom:ii<phase.items.length-1?16:0, borderBottom:ii<phase.items.length-1?`1px solid ${COLORS.border}`:"none" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:phase.color+"22", border:`1px solid ${phase.color}`, color:phase.color, fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"monospace", fontWeight:700, flexShrink:0, marginTop:1 }}>{ii+1}</div>
                    <div>
                      <div style={{ color:COLORS.text, fontWeight:600, fontSize:14, marginBottom:4 }}>{item.title}</div>
                      <div style={{ color:COLORS.muted, fontSize:13, lineHeight:1.6 }}>{item.detail}</div>
                      {item.links && (
                        <div style={{ marginTop:8, display:"flex", gap:8, flexWrap:"wrap" }}>
                          {item.links.map((l,li) => (
                            <a key={li} href={l.url} target="_blank" rel="noreferrer"
                              style={{ color:phase.color, fontSize:12, textDecoration:"none", border:`1px solid ${phase.color}44`, padding:"3px 10px", borderRadius:4 }}>{l.label} ↗</a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Platform Directory ───────────────────────────────────────────────────────
const PLATFORMS = [
  { name:"Spotify for Artists", cat:"Streaming", color:"#1DB954", icon:"🎧", desc:"Upload via distributor. Claim your artist profile to access analytics, pitch to editorial playlists, and track streams.", url:"https://artists.spotify.com", tags:["Free to claim","Playlist pitching","Analytics"] },
  { name:"Apple Music for Artists", cat:"Streaming", color:"#FC3C44", icon:"🍎", desc:"Claim your profile to see real-time streaming data, Shazam stats, and radio play across 100+ countries.", url:"https://artists.apple.com", tags:["Free to claim","Global reach","Radio tracking"] },
  { name:"Tidal", cat:"Streaming", color:"#00FFFF", icon:"🌊", desc:"Artist-first platform with higher royalty rates than most DSPs. Strong among audiophiles and hip-hop/R&B.", url:"https://tidal.com/artist", tags:["Higher royalties","HiFi audio","Artist-friendly"] },
  { name:"SoundCloud for Artists", cat:"Streaming", color:"#FF5500", icon:"☁️", desc:"Upload directly (no distributor needed for free tier). SoundCloud Premier unlocks monetization.", url:"https://soundcloud.com/upload", tags:["Direct upload","Fan discovery","Monetization tier"] },
  { name:"YouTube Music / Art Tracks", cat:"Streaming", color:"#FF0000", icon:"▶️", desc:"Your distributor auto-generates Art Tracks on YouTube Music. Separately claim your channel for Content ID royalty collection.", url:"https://artists.youtube.com", tags:["Content ID","Auto-generated","Video integration"] },
  { name:"Amazon Music for Artists", cat:"Streaming", color:"#00A8E0", icon:"📦", desc:"Claim your artist profile. Eligible for Alexa integrations and Amazon Music Unlimited features.", url:"https://artists.amazon.com", tags:["Free to claim","Alexa integration","Prime audience"] },
  { name:"Audiomack", cat:"Streaming", color:"#FFA500", icon:"🔊", desc:"Free direct uploads with no gating. Popular in hip-hop, Afrobeats, and gospel. Monetization via Audiomack Direct.", url:"https://audiomack.com/upload", tags:["Free direct upload","No gates","Hip-hop/Gospel"] },
  { name:"Bandcamp", cat:"Streaming", color:"#1DA0C3", icon:"🎸", desc:"Sell directly to fans. Keep 85–90% of revenue. Set your own price including pay-what-you-want.", url:"https://bandcamp.com", tags:["Direct-to-fan","High revenue cut","Name your price"] },
  { name:"Symphonic Distribution", cat:"Streaming", color:"#9B59B6", icon:"🎻", desc:"Independent-friendly distributor that cleanly supports ingestion of your own ISRC and UPC codes. Also offers marketing and sync services.", url:"https://symphonicdistribution.com", tags:["Custom ISRC/UPC","Catalog sovereignty","Marketing tools"] },
  { name:"TooLost", cat:"Streaming", color:"#E91E8C", icon:"🔑", desc:"Artist-owned distribution platform built for catalog sovereignty. Supports custom ISRC ingestion so your registrant code — not theirs — is in your metadata.", url:"https://toolost.com", tags:["Custom ISRC","Catalog ownership","Independent-first"] },
  { name:"SubmitHub", cat:"Promotion", color:"#6C5CE7", icon:"📨", desc:"Submit tracks to blogs, playlist curators, YouTube channels, and influencers. Pay-per-submission with guaranteed feedback.", url:"https://www.submithub.com", tags:["Blog pitching","Playlist curators","Feedback guaranteed"] },
  { name:"Groover", cat:"Promotion", color:"#E040FB", icon:"📡", desc:"Submit music to 2,000+ curators, radios, blogs, and labels. Response guaranteed within 7 days.", url:"https://groover.co", tags:["2000+ curators","Guaranteed reply","7-day window"] },
  { name:"Playlist Push", cat:"Promotion", color:"#00BCD4", icon:"📋", desc:"Connects artists to independent Spotify playlist curators. Campaigns start around $100.", url:"https://playlistpush.com", tags:["Spotify playlists","Campaign-based","Independent curators"] },
  { name:"Musosoup", cat:"Promotion", color:"#FF6B6B", icon:"🍲", desc:"Submit to blogs, playlists, and radio with a flat-fee model. Good UK/European reach.", url:"https://musosoup.com", tags:["Flat fee","Blog coverage","UK/EU reach"] },
  { name:"One Submit", cat:"Promotion", color:"#4CAF7A", icon:"✅", desc:"Submit to Spotify playlists, YouTube channels, and TikTok influencers in one place. Credit-based system.", url:"https://onesubmit.com", tags:["Multi-platform","TikTok","Credit-based"] },
  { name:"Daily Playlists", cat:"Promotion", color:"#C9A84C", icon:"📅", desc:"Freemium submission to Spotify playlist curators. Good for indie/lo-fi/ambient genres.", url:"https://dailyplaylists.com", tags:["Free tier","Spotify","Indie/ambient"] },
  { name:"Indiemono", cat:"Promotion", color:"#A06DB3", icon:"🎹", desc:"Free playlist submission. Strong for indie pop, folk, and alternative.", url:"https://indiemono.com", tags:["Free","Indie pop/folk","Curation community"] },
  { name:"Soundplate", cat:"Promotion", color:"#59BAB5", icon:"🎙️", desc:"Submit to free playlists and connect with playlist curators across genres.", url:"https://soundplate.com", tags:["Free submission","Multi-genre","Curator network"] },
  { name:"Musicbed", cat:"Licensing", color:"#E88C3A", icon:"🎬", desc:"Premium sync licensing for film, TV, and ads. Best for cinematic, indie, and emotional music.", url:"https://www.musicbed.com/artists/apply", tags:["Film & TV","Application required","High quality bar"] },
  { name:"Artlist", cat:"Licensing", color:"#2563EB", icon:"🎞️", desc:"License your music to 25M+ content creators worldwide. Revenue share model.", url:"https://artlist.io/artist-application", tags:["25M+ creators","Revenue share","Application review"] },
  { name:"Epidemic Sound", cat:"Licensing", color:"#FF4444", icon:"🔈", desc:"Partner program for sync licensing. Catalog buy-out model — they own future rights after deal.", url:"https://www.epidemicsound.com/artist-application/", tags:["YouTube creators","Buy-out model","Brand deals"] },
  { name:"Pond5", cat:"Licensing", color:"#00B4D8", icon:"🌊", desc:"Marketplace for music, video, and SFX. Set your own prices and keep 35–50%.", url:"https://www.pond5.com/sell-music", tags:["Self-priced","Production music","35–50% cut"] },
  { name:"Musicosmos", cat:"Licensing", color:"#A29BFE", icon:"🌌", desc:"Sync licensing platform connecting independent artists to film, TV, and ad placements.", url:"https://musicosmos.com", tags:["Indie-friendly","Film & ads","Rights-managed"] },
  { name:"Songtradr", cat:"Licensing", color:"#FD79A8", icon:"🎵", desc:"Upload your catalog for sync opportunities across TV, film, games, and brands. Free to join, non-exclusive.", url:"https://www.songtradr.com", tags:["Non-exclusive","Free to join","Games & brands"] },
  { name:"AudioJungle (Envato)", cat:"Licensing", color:"#81ECEC", icon:"🌿", desc:"High-volume marketplace for royalty-free music. Good for production, background, and loop music.", url:"https://audiojungle.net/become-an-author", tags:["High volume","Royalty-free","Production music"] },
  { name:"Musicxray", cat:"Licensing", color:"#FDCB6E", icon:"🔍", desc:"Pitch music directly to A&R, supervisors, and playlist curators. Industry-facing platform.", url:"https://www.musicxray.com", tags:["A&R pitching","Supervisors","Industry-facing"] },
  { name:"Sofar Sounds", cat:"Live", color:"#E17055", icon:"🕯️", desc:"Intimate secret concert series in 400+ cities. Great for building a dedicated live audience.", url:"https://www.sofarsounds.com/artists", tags:["400+ cities","Intimate venues","Concert video"] },
  { name:"Bandsintown for Artists", cat:"Live", color:"#00C4B3", icon:"📍", desc:"Free artist tool to post tour dates, notify fans, and track attendance. Integrates with Spotify and Apple Music.", url:"https://artists.bandsintown.com", tags:["Free","Tour dates","Fan alerts"] },
  { name:"Songkick for Artists", cat:"Live", color:"#F80046", icon:"🎤", desc:"Claim your artist profile to list concerts and reach fans who track you.", url:"https://www.songkick.com/artist-signup", tags:["Free","Concert listings","Fan tracking"] },
  { name:"GigSalad", cat:"Live", color:"#3D9970", icon:"🥗", desc:"Book private events, corporate gigs, weddings, and festivals. Good revenue stream for independent artists.", url:"https://www.gigsalad.com/become-a-vendor", tags:["Private events","Weddings/corporate","Booking requests"] },
  { name:"Gigsster", cat:"Live", color:"#74B9FF", icon:"🏛️", desc:"Venue marketplace for booking event spaces and connecting with promoters.", url:"https://gigsster.com", tags:["Venue booking","Self-produced shows","Promoter network"] },
  { name:"StageIt", cat:"Live", color:"#FFEAA7", icon:"🖥️", desc:"Live streaming concerts where fans pay to attend. You keep 70% of ticket revenue.", url:"https://www.stageit.com/become_a_performer", tags:["Live streaming","70% revenue","Fan ticketing"] },
];

const ALL_CATS = ["All","Streaming","Promotion","Licensing","Live"];
const CAT_COLORS = { Streaming:"#1DB954", Promotion:"#E040FB", Licensing:"#E88C3A", Live:"#E17055" };

function PlatformCard({ p }) {
  return (
    <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderTop:`3px solid ${p.color}`, borderRadius:10, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>{p.icon}</span>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:COLORS.text }}>{p.name}</div>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:CAT_COLORS[p.cat]||COLORS.muted }}>{p.cat}</span>
          </div>
        </div>
        <a href={p.url} target="_blank" rel="noreferrer"
          style={{ background:p.color+"22", border:`1px solid ${p.color}55`, color:p.color, borderRadius:5, padding:"4px 10px", fontSize:11, fontWeight:700, textDecoration:"none", whiteSpace:"nowrap", flexShrink:0 }}>
          Visit ↗
        </a>
      </div>
      <p style={{ color:COLORS.muted, fontSize:12, lineHeight:1.6, margin:0 }}>{p.desc}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
        {p.tags.map(t=><span key={t} style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:3, padding:"2px 7px", fontSize:10 }}>{t}</span>)}
      </div>
    </div>
  );
}

function PlatformDirectory() {
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = PLATFORMS.filter(p => {
    const catMatch = activeCat==="All" || p.cat===activeCat;
    const q = search.toLowerCase();
    const searchMatch = !search || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.some(t=>t.toLowerCase().includes(q));
    return catMatch && searchMatch;
  });
  return (
    <div>
      <p style={{ color:COLORS.muted, fontSize:14, marginBottom:20, lineHeight:1.6 }}>{PLATFORMS.length} platforms across streaming, promotion, sync licensing, and live performance.</p>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {ALL_CATS.map(cat=>(
          <button key={cat} onClick={()=>setActiveCat(cat)}
            style={{ background:activeCat===cat?(CAT_COLORS[cat]||COLORS.gold)+"22":COLORS.surface, border:`1px solid ${activeCat===cat?(CAT_COLORS[cat]||COLORS.gold):COLORS.border}`, color:activeCat===cat?(CAT_COLORS[cat]||COLORS.gold):COLORS.muted, borderRadius:5, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif" }}>
            {cat}
          </button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search platforms..."
          style={{ ...inputStyle, maxWidth:200, marginLeft:"auto", fontSize:12, padding:"6px 12px" }} />
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        {Object.entries(CAT_COLORS).map(([cat,col])=>{
          const count = PLATFORMS.filter(p=>p.cat===cat).length;
          return (
            <div key={cat} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:7, padding:"8px 14px", display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:col }} />
              <span style={{ color:COLORS.muted, fontSize:11 }}>{cat}</span>
              <span style={{ color:col, fontWeight:700, fontFamily:"monospace", fontSize:13 }}>{count}</span>
            </div>
          );
        })}
      </div>
      {filtered.length===0 ? (
        <div style={{ color:COLORS.muted, textAlign:"center", padding:40 }}>No platforms match your search.</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14 }}>
          {filtered.map(p=><PlatformCard key={p.name} p={p} />)}
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showForm, setShowForm] = useState(false);

  const TABS = [
    { id:"tracker",  label:"Splits Tracker" },
    { id:"isrc",     label:"ISRC Registry" },
    { id:"platforms",label:"Promote & Stream" },
    { id:"guide",    label:"Registration Guide" },
  ];

  function handleSaveTrack(track) {
    dispatch({ type: state.editingTrack ? "UPDATE_TRACK" : "ADD_TRACK", track });
    setShowForm(false);
  }
  function handleEdit(track) { dispatch({ type:"SET_EDITING", track }); setShowForm(true); }
  function handleCancelForm() { dispatch({ type:"SET_EDITING", track:null }); setShowForm(false); }

  const totalTracks = state.tracks.length;
  const totalSplitHolders = new Set(state.tracks.flatMap(t=>t.splits.map(s=>s.name.toLowerCase().trim()))).size;
  const selfOwnedISRCs = state.isrcRecords.filter(r=>r.owner==="Self-Owned").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${COLORS.bg}; }
        input, select { color-scheme:dark; }
        input:focus, select:focus { border-color:${COLORS.gold} !important; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${COLORS.surface}; }
        ::-webkit-scrollbar-thumb { background:${COLORS.border}; border-radius:3px; }
      `}</style>
      <div style={{ minHeight:"100vh", background:COLORS.bg, color:COLORS.text, fontFamily:"Inter,sans-serif" }}>

        {/* Header */}
        <div style={{ background:COLORS.surface, borderBottom:`1px solid ${COLORS.border}`, padding:"18px 24px" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:COLORS.gold, letterSpacing:"-0.03em" }}>♪ Publish My Assets Music</div>
              <div style={{ color:COLORS.muted, fontSize:12, marginTop:2 }}>Publishing, Rights & Distribution — Publish My Assets Music</div>
            </div>
            <div style={{ display:"flex", gap:20, fontSize:13 }}>
              {[
                [totalTracks, "TRACKS", COLORS.gold],
                [totalSplitHolders, "COLLABORATORS", COLORS.accent2],
                [state.isrcRecords.length, "ISRCs", COLORS.pink],
                [selfOwnedISRCs, "SELF-OWNED", COLORS.green],
                [PLATFORMS.length, "PLATFORMS", "#E88C3A"],
              ].map(([val,label,color])=>(
                <div key={label} style={{ textAlign:"center" }}>
                  <div style={{ color, fontWeight:700, fontSize:20, fontFamily:"'Space Grotesk',sans-serif" }}>{val}</div>
                  <div style={{ color:COLORS.muted, fontSize:10 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:COLORS.surface, borderBottom:`1px solid ${COLORS.border}`, overflowX:"auto" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", minWidth:"max-content" }}>
            {TABS.map(tab=>(
              <button key={tab.id} onClick={()=>{ dispatch({ type:"SET_TAB", tab:tab.id }); setShowForm(false); }}
                style={{ padding:"14px 22px", background:"none", border:"none", borderBottom:state.activeTab===tab.id?`2px solid ${COLORS.gold}`:"2px solid transparent", color:state.activeTab===tab.id?COLORS.gold:COLORS.muted, cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, whiteSpace:"nowrap" }}>
                {tab.id==="isrc" && <span style={{ marginRight:6, fontSize:12 }}>🔢</span>}{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"28px 24px" }}>

          {state.activeTab==="tracker" && (
            <div>
              {!showForm && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                  <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700 }}>Your Tracks</h2>
                  <button onClick={()=>setShowForm(true)} style={primaryBtnStyle}>+ Add Track</button>
                </div>
              )}
              {showForm && <TrackForm initial={state.editingTrack} onSave={handleSaveTrack} onCancel={handleCancelForm} />}
              {state.tracks.length===0 && !showForm && (
                <div style={{ background:COLORS.card, border:`1px dashed ${COLORS.border}`, borderRadius:12, padding:48, textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>🎵</div>
                  <div style={{ color:COLORS.muted, fontSize:15, marginBottom:16 }}>No tracks yet. Add your first track to start tracking splits.</div>
                  <button onClick={()=>setShowForm(true)} style={primaryBtnStyle}>Add Your First Track</button>
                </div>
              )}
              {state.tracks.map(track=>(
                <TrackCard key={track.id} track={track} onEdit={handleEdit} onDelete={id=>dispatch({ type:"DELETE_TRACK", id })} />
              ))}
            </div>
          )}

          {state.activeTab==="isrc" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700 }}>🔢 ISRC & UPC Registry</h2>
              </div>
              <ISRCRegistry state={state} dispatch={dispatch} />
            </div>
          )}

          {state.activeTab==="platforms" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700 }}>Promote, License & Stream</h2>
              </div>
              <PlatformDirectory />
            </div>
          )}

          {state.activeTab==="guide" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700 }}>Registration & LLC Roadmap</h2>
              </div>
              <RegistrationGuide />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
