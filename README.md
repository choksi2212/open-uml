# Open UML

A completely offline, smooth, modern PlantUML editor with bundled rendering engine. Create, preview, and export all PlantUML diagrams with zero dependencies — no Java installation required!

![Open UML](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey)

## 🔖 Overview

Open UML is a standalone desktop application that provides a beautiful, minimal interface for creating PlantUML diagrams. Everything runs locally — the PlantUML rendering engine and Java runtime are bundled, so you can work completely offline without any setup.

### Key Features

- ✨ **Fully Offline** — No internet connection required
- 🚀 **Zero Dependencies** — Bundled JRE and PlantUML engine
- 🎨 **Modern UI** — Clean, minimal design with dark/light themes
- ⚡ **Live Preview** — Real-time diagram rendering as you type
- 📝 **Monaco Editor** — Full-featured code editor with syntax highlighting
- 💾 **Export Support** — Save diagrams as PNG or SVG
- 🔍 **Error Handling** — Clear error messages with line highlighting
- ⌨️ **Keyboard Shortcuts** — Fast workflow with hotkeys
- 📦 **Auto-Updates** — Automatic updates via GitHub Releases

## 💡 Features

### Core Functionality

- **Live Rendering**: Debounced preview updates as you type (700ms delay)
- **Full PlantUML Support**: All diagram types (Sequence, Class, Activity, Use Case, etc.)
- **Export Options**: PNG and SVG formats
- **File Operations**: Open, save, and manage `.puml` files
- **Error Detection**: Automatic error parsing with line numbers
- **Theme Toggle**: Switch between dark and light modes
- **Responsive Layout**: Works perfectly on all screen sizes

### User Experience

- **Smooth Performance**: 60 FPS UI, no lag during editing
- **Fast Rendering**: Typical diagrams render in <1 second
- **Intuitive Interface**: Split-pane editor and preview
- **Persistent State**: Auto-saves your work to localStorage
- **Keyboard Shortcuts**: 
  - `Ctrl+N` / `Cmd+N` — New diagram
  - `Ctrl+R` / `Cmd+R` — Render diagram
  - `Ctrl+S` / `Cmd+S` — Save file
  - `Ctrl+T` / `Cmd+T` — Toggle theme

## 📦 Installation

### Windows

1. Download `OpenUML-Setup-*.exe` from [Releases](https://github.com/choksi2212/open-uml/releases)
2. Run the installer
3. Follow the setup wizard
4. Launch Open UML from the desktop shortcut or Start menu

### macOS

1. Download `OpenUML-*.dmg` from [Releases](https://github.com/choksi2212/open-uml/releases)
2. Open the DMG file
3. Drag Open UML to Applications
4. Launch from Applications or Spotlight

**Note**: On macOS, you may need to allow the app in System Preferences → Security & Privacy if you see a security warning.

## 🛠️ Development Setup

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

   This starts:
   - Vite dev server (React)
   - Electron with hot reload

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run electron:dev` | Start Electron + React dev mode |
| `npm run build` | Build production files |
| `npm run dist` | Generate installers (.exe/.dmg) |
| `npm run lint` | Lint TypeScript/React code |

## 🚀 Build Instructions

### Building Installers

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Generate installers**
   ```bash
   npm run dist
   ```

   This creates:
   - Windows: `build/OpenUML-Setup-*.exe`
   - macOS: `build/OpenUML-*.dmg`

### Build Configuration

The build is configured in `electron-builder.yml`:
- Windows: NSIS installer with custom icon
- macOS: DMG with drag-to-install
- Bundles: Electron, PlantUML, and JRE

## 🧩 GitHub Integration

### Automated Releases

Releases are automatically created via GitHub Actions when you push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow:
1. Builds the application on Windows and macOS
2. Generates installers
3. Creates a GitHub Release with:
   - Version tag
   - Changelog from `CHANGELOG.md`
   - Downloadable installers

### Manual Release

You can also trigger a release manually from the Actions tab:
1. Go to Actions → Release
2. Click "Run workflow"
3. Enter version tag (e.g., `v1.0.0`)

## 📸 Screenshots

### Dark Theme
![Dark Theme](docs/screenshots/dark-theme.png)

### Light Theme
![Light Theme](docs/screenshots/light-theme.png)

## 🏗️ Project Structure

```
open-uml/
├── app/
│   ├── main/           # Electron main process
│   ├── renderer/       # React UI components
│   ├── assets/         # Icons, logos
│   ├── plantuml/       # plantuml.jar + JRE
│   └── preload.ts      # IPC bridge
├── scripts/            # Build scripts
├── .github/
│   └── workflows/      # CI/CD
├── package.json
├── electron-builder.yml
└── README.md
```

## 🧪 Quality Targets

- ✅ Rendering speed: <1s for typical diagrams
- ✅ UI FPS: ≥60
- ✅ No stutters or visual lag
- ✅ Fully offline operation
- ✅ Memory-safe subprocess handling
- ✅ Full PlantUML compatibility
- ✅ Installer size: ≤250 MB

## 🧩 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Guidelines

Follow semantic commits:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Code style
- `refactor:` — Code refactoring
- `test:` — Tests
- `chore:` — Maintenance

## 🏷️ License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/choksi2212/open-uml)
- [Releases](https://github.com/choksi2212/open-uml/releases)
- [PlantUML Documentation](https://plantuml.com/)

## 🙏 Acknowledgments

- [PlantUML](https://plantuml.com/) — The amazing diagramming language
- [Electron](https://www.electronjs.org/) — Cross-platform desktop framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — Code editor
- [React](https://react.dev/) — UI library
- [Tailwind CSS](https://tailwindcss.com/) — Styling framework

---

Made with ❤️ for the PlantUML community

