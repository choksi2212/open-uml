# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-02

This is a substantial polish and architecture release. The user-visible changes are large enough to warrant a major version bump: a complete design-system overhaul, real-time preview as an inline SVG (selectable, copyable, themable), drag-and-drop + OS-level "Open With" support, an extracted-and-tested parser, and a full release pipeline.

### ✨ Added

- **Design system.** Cyan-teal accent (engineering blueprint), IBM Plex Sans + Mono throughout, Tailwind-only with semantic color tokens (`--bg`, `--accent`, `--surface-N`, `--fg`). 7 UI primitives: Button, IconButton, Toggle, Tooltip, Badge, Separator, Select.
- **Custom Monaco PlantUML language.** Proper Monarch tokenizer with block / control / layout / types / preproc token types. 15+ PlantUML snippets wired into autocomplete (`@startuml`, `class`, `participant`, `actor`, `note`, `if/endif`, `while/endwhile`, sync/return/async arrows, `skinparam`). Custom dark/light themes that match the app palette.
- **Inline SVG preview.** The diagram is rendered into the DOM (selectable, copyable, searchable, themeable) instead of an opaque base64 image. A "1:1" button resets to actual pixel size.
- **Drag-and-drop.** Drop any `.puml` / `.plantuml` / `.pu` / `.txt` file onto the window to open it, with a dirty-state confirmation if you have unsaved work.
- **OS-level "Open With".** macOS `open-file`, Windows + Linux `second-instance` argv forwarding, and initial-launch argv parsing — all wired so double-clicking a `.puml` from Explorer / Finder opens it in the running app.
- **NSIS file associations.** Windows installer registers Open UML as a handler for `.puml`, `.plantuml`, `.iuml`, `.pu` at install time.
- **Vitest + 21 parser tests.** `splitDiagrams`, `parsePlantumlError`, `looksLikeErrorImage` are covered for multi-block files, PlantUML error format, unterminated blocks, plain-text fallback, and image-vs-real-SVG detection.
- **`ErrorBoundary`.** Any render-phase exception (Monaco, the preview) shows a recovery surface instead of a blank window.
- **`useLocalStorage` / `useEditorSettings` hooks.** Reusable, typed, persisted.
- **`electron-updater` integration.** Packaged, signed builds auto-download updates and prompt to install on quit. The existing GitHub-releases checker stays as a fallback for unsigned builds.
- **CI lint+test gate.** The release workflow's Windows + macOS jobs depend on a new `lint-test` job running `npm run lint && npm test` first.
- **Landing page.** `docs/landing/index.html` — self-contained HTML using the same design tokens, ready to deploy to Vercel / Netlify / GitHub Pages.
- **Browser preview shim.** When `window.electronAPI` is undefined (browser preview, static deploy), the renderer falls back to a no-op stub so the UI is at least viewable for design review.
- **Brand lockup.** TopBar shows the full `lockup-horizontal.svg` (mark + "Open UML") in a theme-aware SVG, themed dark/light.
- **Status bar** with file name (with dirty dot), diagram type badge, multi-diagram count, render time, and cursor position.

### 🐞 Fixed

- **macOS JRE packaging (regression of v1.1.0).** Each platform now ships its own JRE: `jre-win` is fetched at Windows CI build time, `jre-mac` at macOS CI build time. CI verifies the DMG contains a Mach-O `java` binary before publishing. (Lives in the existing `1e72e52` baseline.)
- **Monaco tokenizer infinite loop.** The PlantUML Monarch tokenizer would lock up on certain inputs (single-quoted strings vs. line comments conflict). Reordered block-comment before strings, added a single-char catch-all in root + comment states.
- **SVG/PNG dropdown text invisible.** Native `<select>` chevron + a CSS background-image chevron overlapped the value. Replaced with a Lucide `ChevronDown` icon overlay.
- **TopBar logo too small.** A 24px monogram PNG rendered as 1.9px hairline strokes. Replaced with the full lockup SVG at h-8 (32px).

### 🔧 Technical

- **`splitDiagrams` extracted** to `app/main/plantuml-parser.ts` so it's testable without importing Electron.
- **Renderer/App.tsx** retains its single-file structure but is now ~600 lines of clean state + handlers, with persistence and dirty tracking centralised in localStorage keys defined in `lib/constants.ts`.
- **IPC contract** unchanged on the wire (preload still exposes the same typed `electronAPI` surface); additions are `readFileByPath`, `onOsOpenedFile`, and `exportPdf`.
- **CSS** collapsed from 440 lines of hand-rolled rules to a single Tailwind layer + ~30 lines of base resets + a `prefers-reduced-motion` query.
- **`prefers-reduced-motion`** respected — animation durations collapse to 0.01ms.

### 📦 Distribution

- `npm run dist` produces `OpenUML-Setup-2.0.0.exe` (Windows NSIS) and `OpenUML-2.0.0.dmg` (macOS).
- Code signing + Apple notarization remain external one-time setup — see `DEPLOY.md`.

## [1.1.0] - 2026-10-02

- macOS: the app no longer reports as "damaged/corrupted" (each platform now ships its own JRE).
- LaTeX math renders (`<math>...</math>` via the bundled `plantuml-pdf` companion jar).
- Syntax errors surface in the error panel with the correct line number.
- Multi-diagram files fully render with diagram tabs in the preview.
- Export as PDF (File menu).
- Copy image to clipboard (Ctrl+Shift+C): PNG as a real image, SVG as vector text.
- Recent files menu with Clear Recently Opened.
- Command palette (Ctrl+Shift+K).
- Editor settings: word wrap, minimap, font size.
- Status bar: file name, diagram type, render time, cursor position.
- Templates gallery (12 starters).
- Update checker against GitHub Releases.

## [1.0.1] - 2025-01-29

- Fixed pan/drag functionality for zoomed previews in production build.
- Fixed workspace layout.
- Fixed CSS overflow issues that prevented panning when zoomed in.
- Improved preview image auto-fitting for large diagrams.

## [1.0.0] - 2025-01-29

- Initial release. Fully offline PlantUML editor with bundled rendering engine, Monaco editor, dark/light themes, live preview, PNG/SVG export, file operations, error handling, keyboard shortcuts.
