

```markdown
# LearnFlow

**A schema-driven browser learning extension for Microsoft Edge.**

LearnFlow delivers structured learning content from bundled curriculum data files directly inside your browser. Built as a Manifest V3 Edge extension with zero dependencies.

---

## Overview

LearnFlow is a generic curriculum player that renders learning tracks, modules, lessons, glossary terms, references, and knowledge checks from structured JSON files. The first bundled curriculum covers **Passkeys Fundamentals**.

### Key Features

- Schema-driven architecture — renders any valid curriculum pack
- Multiple learning tracks within a single curriculum
- Structured lessons with rich block types (headings, paragraphs, callouts, scenarios, comparisons, knowledge checks)
- Inline knowledge checks with scoring and feedback
- Local progress tracking with auto-save
- Per-lesson notes with debounced auto-save
- Lesson bookmarking
- Searchable glossary
- Progress dashboard with per-track breakdowns
- Resume learning from where you left off
- Keyboard navigation (arrow keys for prev/next lessons)
- Accessibility-first design (semantic HTML, ARIA landmarks, focus states, skip links)
- Local-first — all data stays on your device
- Zero external dependencies
- No build step required

---

## Screenshots

> _Screenshots can be added here after installation._

---

## Installation

### Prerequisites

- Microsoft Edge (Chromium-based)

### Steps

1. Clone or download this repository

   ```bash
   git clone https://github.com/your-username/learnflow-extension.git
   ```

2. Open Edge and navigate to `edge://extensions/`

3. Enable **Developer mode** (toggle in the bottom-left or top-right)

4. Click **Load unpacked**

5. Select the `learnflow-extension/` folder (the folder that directly contains `manifest.json`)

6. The LearnFlow extension icon will appear in your Edge toolbar

---

## Usage

### Popup

Click the LearnFlow icon in the toolbar to access the quick launcher:

- **Resume** — continue where you left off
- **Home** — open the main learning interface
- **Glossary** — jump directly to the glossary
- **Progress** — view your progress dashboard

### Full-Page App

The main learning interface opens in a full browser tab with:

- **Sidebar navigation** — Home, Glossary, Progress, Settings
- **Home** — curriculum overview and track selection
- **Track view** — modules within a track
- **Module view** — lessons within a module with completion status
- **Lesson view** — rendered lesson content with knowledge checks, notes, and bookmarks
- **Glossary** — searchable list of all terms and definitions
- **Progress** — overall and per-track completion, bookmarks, and quiz results
- **Settings** — curriculum info, references, and progress reset

### Keyboard Navigation

- **Arrow Left / Arrow Right** — navigate to previous/next lesson when viewing a lesson
- **Tab** — standard keyboard navigation through all interactive elements
- **Enter / Space** — activate buttons, cards, and options

---

## Project Structure

```plaintext
learnflow-extension/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── background/
│   └── service-worker.js
├── pages/
│   ├── app.html
│   └── app.css
├── js/
│   ├── app.js
│   ├── router.js
│   ├── state.js
│   ├── storage.js
│   ├── curriculum-loader.js
│   ├── schema-validator.js
│   ├── progress.js
│   ├── assessment.js
│   ├── ui.js
│   ├── utils.js
│   └── renderers/
│       ├── home.js
│       ├── track.js
│       ├── module.js
│       ├── lesson.js
│       ├── glossary.js
│       ├── progress.js
│       ├── settings.js
│       ├── error.js
│       └── blocks/
│           ├── index.js
│           ├── heading.js
│           ├── paragraph.js
│           ├── bullets.js
│           ├── numbered-list.js
│           ├── callout.js
│           ├── scenario.js
│           ├── comparison.js
│           └── knowledge-check.js
├── data/
│   ├── curriculum-index.json
│   └── passkeys-v1.json
├── assets/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
└── README.md
```

---

## Architecture

### Two-Layer Design

| Layer | Purpose |
|---|---|
| **Learning Engine** | Routing, rendering, progress tracking, notes, bookmarks, quiz handling, local persistence |
| **Curriculum Pack** | Structured JSON defining metadata, tracks, modules, lessons, blocks, glossary, and references |

### Core Principles

- **Schema-driven** — the renderer reads content block types from JSON; no hardcoded screens
- **Local-first** — all data stored in `chrome.storage.local`; nothing sent to any server
- **Zero dependencies** — vanilla HTML, CSS, and JavaScript only
- **Accessibility-first** — semantic HTML, ARIA, keyboard support, readable contrast
- **Security-conscious** — all text rendered via `textContent`; strict CSP; no external scripts

### Routing

Hash-based routing with parameterized paths:

| Route | View |
|---|---|
| `#/home` | Home / curriculum overview |
| `#/track/{trackId}` | Track detail with module list |
| `#/module/{trackId}/{moduleId}` | Module detail with lesson list |
| `#/lesson/{trackId}/{moduleId}/{lessonId}` | Lesson content viewer |
| `#/glossary` | Searchable glossary |
| `#/progress` | Progress dashboard |
| `#/settings` | Settings and references |

### Storage Schema

All data persisted in `chrome.storage.local` with versioned schema for safe upgrades:

| Key | Type | Description |
|---|---|---|
| `storageSchemaVersion` | `number` | Current storage schema version for migrations |
| `activeCurriculumId` | `string` | ID of the loaded curriculum |
| `lastRoute` | `string` | Last visited route for resume functionality |
| `lastLessonTitle` | `string` | Title of last visited lesson |
| `activeTrackId` | `string` | Currently active track |
| `completedLessonIds` | `string[]` | IDs of completed lessons |
| `completedModuleIds` | `string[]` | IDs of completed modules |
| `assessmentResults` | `object` | Knowledge check results keyed by check ID |
| `notes` | `object` | Notes keyed by route with text and timestamp |
| `bookmarks` | `array` | Bookmark objects with route, title, and timestamp |

---

## Curriculum Schema

### Curriculum Pack

```json
{
  "id": "string",
  "title": "string",
  "version": "string",
  "language": "string",
  "description": "string",
  "level": "string",
  "estimatedMinutes": 0,
  "author": "string",
  "tracks": [],
  "modules": [],
  "lessons": [],
  "glossary": [],
  "references": []
}
```

### Supported Lesson Block Types

| Type | Description |
|---|---|
| `heading` | Section heading with configurable level (2–6) |
| `paragraph` | Body text paragraph |
| `bullets` | Unordered list |
| `numbered-list` | Ordered list |
| `callout` | Highlighted information box |
| `scenario` | Real-world scenario description |
| `comparison` | Side-by-side column comparison |
| `knowledge-check` | Interactive quiz with single-select options and feedback |

---

## Bundled Curriculum

### Passkeys Fundamentals v1.0.0

| Track | Focus | Modules | Lessons |
|---|---|---|---|
| 🎯 Foundation | Core concepts for all learners | 4 | 6 |
| 👤 User & Business | Practical guidance for daily use | 3 | 5 |
| 🔧 Technical | WebAuthn, cryptography, implementation | 3 | 5 |
| 📋 Leadership | Strategy, policy, governance | 3 | 3 |

**Total:** 4 tracks · 13 modules · 19 lessons · 12 knowledge checks · 18 glossary terms · 6 references

---

## Technical Stack

| Component | Technology |
|---|---|
| Extension manifest | Manifest V3 |
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Logic | Vanilla JavaScript (ES modules) |
| Storage | `chrome.storage.local` |
| Dependencies | None |
| Build step | None |

---

## Browser Compatibility

| Browser | Supported |
|---|---|
| Microsoft Edge (Chromium) | ✅ Primary target |
| Google Chrome | ✅ Compatible (Manifest V3) |
| Brave | ✅ Compatible (Manifest V3) |
| Firefox | ❌ Not supported (different extension API) |

---

## Future Considerations

The architecture preserves room for future expansion:

- Multiple bundled curricula
- User-importable curriculum packs
- Transcript and media schema fields
- Full-text search
- Theme customization
- Cloud sync
- Admin analytics
- Print/export lessons

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Guidelines

- No external dependencies
- No build tools
- All text rendering must use `textContent` (no `innerHTML` for content)
- Maintain accessibility standards
- Validate curriculum JSON with the schema validator before submitting new content

---

## License

MIT License

Copyright (c) 2026 LearnFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Icon Attribution

Extension icons provided by Flaticon:

<a href="https://www.flaticon.com/free-icons/knowledge" title="knowledge icons">Knowledge icons created by Freepik - Flaticon</a>

---

## Acknowledgments

- [FIDO Alliance](https://fidoalliance.org/) — passkey standards and specifications
- [W3C WebAuthn](https://www.w3.org/TR/webauthn-2/) — Web Authentication API standard
- [Freepik / Flaticon](https://www.flaticon.com/) — extension icon assets
```