# Publish My Assets Music

A dark-themed web app for independent artists to manage music splits, ISRC/UPC metadata, distribution platforms, and an LLC registration roadmap.

## Features

### Splits Tracker
- Add and edit tracks with collaborator splits (name, role, percentage)
- Visual split bar with color-coded segments
- Auto-balance splits to 100%
- Roles: Artist, Producer, Songwriter, Engineer, Co-Writer, Featured, Publisher, Label, Other

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

- **Runtime app:** Vanilla JavaScript (ES modules), no build step
- **Styling:** CSS custom properties (`styles.css`)
- **Reference:** `music-splits-tracker.jsx` — original React component design

Data (tracks, ISRCs, registrant prefix) is saved automatically to `localStorage`.

## Getting Started

Requires a local web server — do not open `index.html` directly as a `file://` URL (ES modules require HTTP).

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

Alternative:

```bash
python3 -m http.server 3000
```

## Project Structure

```
├── index.html              # App shell and layout
├── app.js                  # Application logic (tabs, forms, state)
├── styles.css              # Design tokens and component styles
├── music-splits-tracker.jsx # React reference implementation
└── package.json            # Dev server script
```

## License

Private — all rights reserved.
