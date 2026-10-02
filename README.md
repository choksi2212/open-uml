# Open UML

<div align="center">

![Open UML Logo](logo-family/png/light/wordmark-full-1600.png)

**A completely offline, smooth, modern PlantUML editor with bundled rendering engine**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/choksi2212/open-uml/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey.svg)](https://github.com/choksi2212/open-uml/releases)

[Download](https://github.com/choksi2212/open-uml/releases) • [Documentation](#-features) • [Report Bug](https://github.com/choksi2212/open-uml/issues) • [Request Feature](https://github.com/choksi2212/open-uml/issues)

</div>

---

## 🎯 Overview

**Open UML** is a professional desktop application designed for creating PlantUML diagrams with zero setup required. Everything runs completely offline — the PlantUML rendering engine and Java runtime are bundled, so you can start creating diagrams immediately without any installation hassles.

Perfect for students, developers, and technical writers who need a reliable, fast, and beautiful tool for creating UML diagrams, flowcharts, and other PlantUML-supported diagrams.

### ✨ Key Features

- 🚀 **Fully Offline** - No internet connection required, all dependencies bundled
- ⚡ **Lightning Fast** - 300ms debounced rendering for instant preview updates
- 🎨 **Modern UI** - Beautiful, minimal interface with smooth animations
- 🌓 **Theme Support** - Dark and light themes with seamless switching
- 📝 **Monaco Editor** - Professional code editor with PlantUML syntax highlighting
- 🔍 **Zoom & Pan** - Zoom from 25% to 300% with Google Maps-style panning
- 💾 **Export Options** - Save diagrams as PNG or SVG
- ⌨️ **Keyboard Shortcuts** - Complete keyboard support for power users
- 📦 **Cross-Platform** - Windows and macOS installers available
- 🔒 **Secure** - Built with security best practices (context isolation, no node integration)

---

## 📸 Screenshots

### Dark Theme
![Dark Theme Preview](dark.png)

### Light Theme
![Light Theme Preview](light.png)

---

## 🚀 Quick Start

### Windows

1. Download `OpenUML-Setup-1.0.0.exe` from [Releases](https://github.com/choksi2212/open-uml/releases)
2. Run the installer
3. Launch Open UML from the desktop shortcut or Start menu
4. Start creating your PlantUML diagrams!

### macOS

1. Download `OpenUML-1.0.0.dmg` from [Releases](https://github.com/choksi2212/open-uml/releases)
2. Open the DMG file and drag Open UML to Applications
3. Launch from Applications or Spotlight
4. If you see a security warning, go to System Preferences → Security & Privacy → Allow

---

## 💡 Features

### Core Functionality

- **Live Rendering** - See your diagrams update in real-time as you type (300ms debounce)
- **Full PlantUML Support** - All diagram types supported:
  - Sequence Diagrams
  - Class Diagrams
  - Activity Diagrams
  - Use Case Diagrams
  - Component Diagrams
  - State Diagrams
  - And more!
- **Export Options** - Save your diagrams as:
  - PNG (raster format, perfect for presentations)
  - SVG (vector format, perfect for documentation)
- **File Operations**:
  - New file (`Ctrl+N`)
  - Open file (`Ctrl+O`)
  - Save file (`Ctrl+S`)
  - Save As (`Ctrl+Shift+S`)
- **Error Detection** - Automatic error parsing with line numbers and helpful messages

### User Experience

- **Smooth Performance** - 60 FPS UI with no lag during editing
- **Fast Rendering** - Typical diagrams render in <1 second
- **Intuitive Interface** - Split-pane editor and preview with resizable divider
- **Zoom Controls** - Zoom from 25% to 300% with smooth scaling
- **Pan Support** - When zoomed in, drag to pan around the diagram (like Google Maps)
- **Persistent State** - Auto-saves your work to localStorage
- **Theme Toggle** - Switch between dark and light themes instantly
- **Responsive Layout** - Works perfectly on all screen sizes

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` / `Cmd+N` | New file |
| `Ctrl+O` / `Cmd+O` | Open file |
| `Ctrl+S` / `Cmd+S` | Save file |
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Save As |
| `Ctrl+Shift+R` / `Cmd+Shift+R` | Render diagram |
| `Ctrl+Shift+G` / `Cmd+Shift+G` | Export as SVG |
| `Ctrl+Shift+P` / `Cmd+Shift+P` | Export as PNG |

### Menu Bar

- **File Menu**:
  - New, Open, Save, Save As
  - Render, Export as SVG, Export as PNG
- **Help Menu**:
  - FAQ (links to GitHub repository)
  - Contact (opens email client)

---

## 🛠️ Development

### Prerequisites

- Node.js 20+ and npm
- Git

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/choksi2212/open-uml.git
   cd open-uml
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PlantUML and JRE**
   
   You need to download and place the following in `app/plantuml/`:
   - `plantuml.jar` — Download from [PlantUML releases](https://github.com/plantuml/plantuml/releases)
   - `jre/` — Extract OpenJDK 17+ JRE for your platform
   
   Structure:
   ```
   app/plantuml/
   ├── plantuml.jar
   └── jre/
       └── bin/
           └── java (or java.exe on Windows)
   ```

4. **Run in development mode**
   ```bash
   npm run electron:dev
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run electron:dev` | Start Electron + React dev mode |
| `npm run build` | Build production files |
| `npm run dist` | Generate installers (.exe/.dmg) |
| `npm run lint` | Lint TypeScript/React code |

---

## 🏗️ Project Structure

```
open-uml/
├── app/
│   ├── main/              # Electron main process
│   │   └── index.ts       # Window creation, IPC handlers
│   ├── renderer/          # React UI components
│   │   ├── App.tsx        # Main app component
│   │   ├── components/    # UI components
│   │   │   ├── Editor.tsx      # Monaco editor wrapper
│   │   │   ├── Preview.tsx    # Diagram preview with zoom/pan
│   │   │   ├── TopBar.tsx     # Top navigation bar
│   │   │   └── ErrorPanel.tsx # Error display
│   │   └── index.css      # Global styles
│   ├── assets/            # Icons, logos
│   ├── plantuml/          # plantuml.jar + JRE
│   └── preload.ts         # IPC bridge
├── .github/
│   └── workflows/         # CI/CD workflows
│       └── release.yml     # Automated releases
├── build/                 # Build output (installers)
├── dist/                  # Production build
├── dist-electron/        # Electron build output
├── package.json
├── electron-builder.yml
└── README.md
```

---

## 🧪 Quality Targets

- ✅ Rendering speed: <1s for typical diagrams
- ✅ UI FPS: ≥60
- ✅ No stutters or visual lag
- ✅ Fully offline operation
- ✅ Memory-safe subprocess handling
- ✅ Full PlantUML compatibility
- ✅ Installer size: ~200 MB (includes Electron, Chromium, PlantUML, and JRE)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Code style
- `refactor:` — Code refactoring
- `test:` — Tests
- `chore:` — Maintenance

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- [GitHub Repository](https://github.com/choksi2212/open-uml)
- [Releases](https://github.com/choksi2212/open-uml/releases)
- [PlantUML Documentation](https://plantuml.com/)
- [Report an Issue](https://github.com/choksi2212/open-uml/issues)
- [Request a Feature](https://github.com/choksi2212/open-uml/issues)

---

## 🙏 Acknowledgments

- [PlantUML](https://plantuml.com/) — The amazing diagramming language
- [Electron](https://www.electronjs.org/) — Cross-platform desktop framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — Code editor
- [React](https://react.dev/) — UI library
- [Tailwind CSS](https://tailwindcss.com/) — Styling framework
- [Vite](https://vitejs.dev/) — Build tool

---

<div align="center">

**Created for Students by [Manas Choksi](https://github.com/choksi2212) with ❤️**

[![GitHub](https://img.shields.io/badge/GitHub-choksi2212-black?style=flat&logo=github)](https://github.com/choksi2212)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Manas%20Choksi-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/manas-choksi)
[![Instagram](https://img.shields.io/badge/Instagram-manas__choksi__22-E4405F?style=flat&logo=instagram)](https://www.instagram.com/manas_choksi_22)

</div>
