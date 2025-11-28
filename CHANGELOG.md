# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Keyboard Shortcuts** - Complete keyboard support for all operations:
  - `Ctrl+N` / `Cmd+N` - New file
  - `Ctrl+S` / `Cmd+S` - Save file
  - `Ctrl+Shift+S` / `Cmd+Shift+S` - Save As
  - `Ctrl+Shift+R` / `Cmd+Shift+R` - Render diagram
  - `Ctrl+Shift+G` / `Cmd+Shift+G` - Export as SVG
  - `Ctrl+Shift+P` / `Cmd+Shift+P` - Export as PNG
- **Menu Bar** - Professional File and Help menus with all operations
- **Help Menu** - FAQ link to GitHub and Contact email integration
- **Preview Features** - Zoom controls (25% to 300%) with pan/drag support for zoomed images
- **Resizable Panes** - Drag to resize editor and preview sections
- **Social Links** - Footer with GitHub, LinkedIn, and Instagram links with icons
- **Cross-Platform** - Windows and macOS installers with automatic updates
- **Offline First** - Zero internet connection required, all dependencies bundled

### 🎨 UI/UX Enhancements

- Smooth opening animation with fade and scale effects
- Ambient background glows (emerald and sunset orange)
- Custom branding with Open UML logo
- Professional footer with social media integration
- Responsive layout that fits on single screen
- Auto-fitting preview images that scale proportionally
- Internal scrolling for editor and preview sections

### 🔧 Technical

- Electron 28+ with React 18 and TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for modern styling
- Secure IPC communication with context isolation
- Bundled JRE 17+ for offline PlantUML rendering
- GitHub Actions for automated releases

### 📝 Documentation

- Comprehensive README with installation and development guides
- CHANGELOG following Keep a Changelog format
- Contributing guidelines
- Setup instructions for developers

