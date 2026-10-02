# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-02

### 🐞 Fixed

- **macOS: the app no longer reports as "damaged/corrupted"**. The root cause: every release, including the macOS DMG, bundled the *Windows* Java runtime (`app/plantuml/jre` was a Windows JRE), so the app could never launch on a Mac and Gatekeeper rejected it. Each platform now ships its own JRE (`jre-win` / `jre-mac`), fetched at build time.
- **LaTeX math now renders.** `<math>int_0^1 f(x)dx</math>` used to crash inside PlantUML with a `ClassNotFoundException` (the fat jar's optional companions - batik, fop, xmlgraphics - were never bundled) and the app silently showed PlantUML's error image. The `plantuml-pdf` companion jar is now bundled and on the classpath, matching planttext.com behavior.
- **Syntax errors now surface in the error panel with the right line number.** PlantUML exits 0 and prints an error *image*, so the app could not tell a real render from a failed one; and the line-number parser never matched PlantUML's actual stderr format. Both are fixed: error images are detected and the `ERROR\n<line>\n<msg>` format is parsed.
- **Multi-diagram files now fully render.** PlantUML's pipe mode renders only the first `@startuml` block; files with several diagrams (common in the wild and supported by planttext.com) silently lost all but the first. Every `@startXXX` block is now split, rendered, and shown with diagram tabs in the preview.

### ✨ Added

- **Export as PDF** (File menu) - powered by the bundled companion jar.
- **Copy image to clipboard** (Ctrl+Shift+C): PNG as a real image, SVG as vector text.
- **Recent files menu** with Clear Recently Opened, persisted across sessions.
- **Command palette** (Ctrl+Shift+K): all commands plus a templates gallery at your fingertips.
- **Editor settings**: word wrap, minimap, and font size - persisted, also in the palette.
- **Status bar**: file name, diagram type, diagram count, render time, cursor position.
- **Templates gallery**: 12 starters now, including ER, Gantt, mind map, C4, deployment and a math example.
- **Update checker**: silent check at launch + Help > Check for Updates; opens the release page when a newer version exists (never auto-installs).

### 🔧 Technical

- The JRE moved out of the asar into `extraResources`, platform-scoped (`jre-win`, `jre-mac`).
- `plantuml-pdf-1.2025.10.jar` (the version-matched companion) is bundled next to `plantuml.jar`.
- The renderer spawns `java -cp <jars> net.sourceforge.plantuml.Run` instead of `-jar`, because `-jar` ignores `-cp` and the companion jar would be dropped.
- macOS build is ad-hoc signed (`identity: null`), the best available without a paid Apple Developer certificate; first launch uses the right-click -> Open flow.
- The macOS CI job verifies the DMG contains a Mach-O `java` before the release is published.

## [1.0.1] - 2025-01-29

### 🐞 Fixes

- Fixed pan/drag functionality for zoomed previews in production build
- Fixed workspace layout to ensure editor and preview fit on single screen
- Fixed CSS overflow issues that prevented panning when zoomed in
- Improved preview image auto-fitting for large diagrams
- Added proper overflow handling for editor scrolling

### 🔧 Technical

- Updated CSS to use `overflow: hidden` for preview-stage (required for panning)
- Added `user-select: none` to prevent text selection during drag
- Fixed workspace container overflow handling
- Improved production build CSS optimizations

## [1.0.0] - 2025-01-29

### ✨ Features

- **Initial Release** - Fully offline PlantUML editor with bundled rendering engine
- **Modern UI** - Clean, minimal design with smooth animations and ambient effects
- **Theme Support** - Dark and light themes with seamless switching
- **Monaco Editor** - Full-featured code editor with PlantUML syntax highlighting
- **Live Preview** - Real-time diagram rendering with 300ms debounce for fast updates
- **Export Options** - Save diagrams as PNG or SVG formats
- **File Operations** - Open, Save, and Save As functionality with file path tracking
- **Error Handling** - Clear error messages with line number highlighting
- **Keyboard Shortcuts** - Complete keyboard support for all operations
