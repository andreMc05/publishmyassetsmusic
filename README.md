# Publish My Assets Music

A dark-themed web app for independent artists to manage music splits, ISRC/UPC metadata, catalog asset readiness, track life cycle phases, distribution platforms, and an LLC registration roadmap.

## Features

### Splits Tracker
- Add and edit tracks with collaborator splits (name, role, percentage)
- Visual split bar with color-coded segments
- Auto-balance splits to 100%
- Roles: Artist, Producer, Songwriter, Engineer, Co-Writer, Featured, Publisher, Label, Other
- Per-track **Catalog Architecture & Asset Health** fields (release date, recoupment, sync checklist)

### Asset Health (Track Life Cycle & Asset Readiness)
- **Asset Readiness Progress Bar** — checklist for Full Mix, Instrumental, Stems, Clean Version, and Embedded ID3/AIF metadata; shows a **Sync Ready** badge when all items are verified
- **Life Cycle Timeline** — visual 3-phase timeline:
  - Phase 1: Escape Velocity (Months 0–18)
  - Phase 2: Sync / Stagnation (Years 1.5–15)
  - Phase 3: Retroactive Renaissance (Years 15–35)
- **35-Year Termination Clock** — countdown to termination rights with milestone year markers (15, 20, 25, 30, 35)
- Sync-window alerts when a track is in Phase 2 but missing instrumental or seamless clearance
- **Ready for Active Curation** flags when a 5-year heartbeat anniversary (15–35 yr) is within 6 months
- Catalog summary stats: sync-ready count, curation windows, sync alerts

### ISRC Registry
- Register and manage ISRC codes per track/version
- Set a 3-character registrant prefix for auto-generation
- Track ownership (Self-Owned, Distributor-Owned, Unknown)
- Link ISRC records to splits tracks
- Filter and search your catalog

### Promote & Stream
- Directory of 32 platforms across Streaming, Promotion, Licensing, and Live
- Category filters and search

### Registration Guide
- Step-by-step LLC and rights registration roadmap
- Phases covering entity setup, metadata sovereignty, copyright, PRO/ISWC, mechanical royalties, distribution, and neighboring rights

## Tech Stack

### Frontend (runtime app)
- Vanilla JavaScript (ES modules), no build step
- CSS custom properties (`styles.css`)
- Browser `localStorage` for persistence (`pma-music-state`)
- Daily client-side lifecycle sync (phase transitions, milestone flags)

### Backend (optional API)
- Node.js + TypeScript + Express
- SQLite via `better-sqlite3` (local dev)
- PostgreSQL-compatible SQL migrations in `server/migrations/`
- Daily cron job for lifecycle refresh (02:00 UTC)

### Reference
- `music-splits-tracker.jsx` — original React component design (not wired into runtime)

## Getting Started

Requires a local web server — do not open `index.html` directly as a `file://` URL (ES modules require HTTP).

### Frontend

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

Alternative:

```bash
python3 -m http.server 3000
```

### Backend API (optional)

```bash
npm run server
```

The API listens on [http://localhost:3001](http://localhost:3001).

Run a one-off lifecycle refresh:

```bash
cd server && npm run lifecycle:run
```

Install server dependencies first if needed:

```bash
cd server && npm install
```

## Database Migrations

PostgreSQL-style migrations live in `server/migrations/`:

| File | Purpose |
|------|---------|
| `000_initial_tracks.sql` | Base `tracks` table |
| `001_track_lifecycle_extension.sql` | Asset folder checklist, lifecycle phases, milestones, termination fields |
| `001_track_lifecycle_extension.down.sql` | Rollback for migration 001 |

The local SQLite API bootstraps from `server/src/db/schema.sql`, which mirrors these fields.

### Track lifecycle fields

**Asset Folder (sync checklist)**
- `has_full_mix`, `has_instrumental`, `has_stems_zipped`, `has_clean_version`, `has_embedded_metadata`
- `sync_folder_url`

**Life cycle & performance**
- `release_date`, `lifecycle_phase`, `recoupment_status`, `unrecouped_balance`

**Anniversary & sampling triggers**
- `next_milestone_anniversary`, `next_milestone_date`, `termination_rights_date`
- `is_clearance_seamless`, `ready_for_active_curation`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/tracks` | List all tracks |
| `GET` | `/api/tracks/:id` | Get one track |
| `POST` | `/api/tracks` | Create or upsert a track |
| `PUT` | `/api/tracks/:id` | Update a track |
| `DELETE` | `/api/tracks/:id` | Delete a track |
| `POST` | `/api/tracks/lifecycle/refresh` | Recompute lifecycle fields for all tracks |
| `POST` | `/api/tracks/:id/lifecycle/compute` | Recompute lifecycle for one track |

## Project Structure

```
├── index.html
├── styles.css                  # CSS entry — imports all partials
├── css/
│   ├── tokens.css              # Design tokens (colors, spacing, typography)
│   ├── base.css                # Reset and global element styles
│   ├── utilities.css           # Layout utility classes
│   ├── buttons.css             # Button system
│   ├── forms.css               # Form fields and validation
│   ├── card.css                # Shared card styles
│   ├── layout.css              # Header, tabs, page shell
│   ├── splits.css              # Splits tracker components
│   ├── lifecycle.css           # Asset health & life cycle widgets
│   ├── isrc.css                # ISRC registry components
│   ├── platforms.css           # Platform directory
│   └── guide.css               # Registration guide
├── js/
│   ├── main.js                 # App entry point
│   ├── state.js                # Reducer, dispatch, localStorage
│   ├── constants/              # Static data (roles, platforms, lifecycle enums)
│   ├── services/               # Lifecycle calculator, milestone dispatcher
│   ├── utils/                  # DOM helpers, ISRC validation, track migration
│   ├── components/             # Forms, cards, readiness bar, timeline, termination tracker
│   ├── tabs/                   # Tab panel mount functions
│   └── shell/                  # Header stats and tab router
├── server/
│   ├── migrations/             # PostgreSQL SQL migrations
│   └── src/
│       ├── index.ts            # Express app entry
│       ├── routes/tracks.ts    # REST API routes
│       ├── services/lifecycle.ts
│       ├── cron/lifecycle-jobs.ts
│       └── db/                 # SQLite schema and data access
└── music-splits-tracker.jsx    # React reference implementation
```

## License

Private — all rights reserved.
