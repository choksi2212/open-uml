# Repository Setup Guide

This guide will help you set up your GitHub repository to look professional and complete.

## 📝 Repository Description

Go to your repository settings and add the following:

**Description:**
```
A completely offline, smooth, modern PlantUML editor with bundled rendering engine. Create, preview, and export all PlantUML diagrams with zero dependencies — no Java installation required!
```

**Topics/Tags:**
```
plantuml
uml-editor
diagram-editor
electron
desktop-app
offline-editor
plantuml-editor
uml-diagrams
cross-platform
react
typescript
monaco-editor
```

**Website (optional):**
```
https://github.com/choksi2212/open-uml
```

## 🏷️ About Section

In your repository's "About" section (right sidebar), add:

- **Description**: `A completely offline, smooth, modern PlantUML editor with bundled rendering engine`
- **Website**: `https://github.com/choksi2212/open-uml`
- **Topics**: Add the tags listed above

## 📋 Repository Settings

### General Settings

1. Go to **Settings** → **General**
2. Scroll to **Features** section
3. Enable:
   - ✅ Issues
   - ✅ Projects
   - ✅ Wiki (optional)
   - ✅ Discussions (optional)

### Pages (Optional)

If you want to host documentation:
1. Go to **Settings** → **Pages**
2. Source: Deploy from a branch
3. Branch: `main` / `docs` folder

## 🚀 Creating Your First Release

### Method 1: Using Git Tags (Recommended)

1. **Create and push a tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions will automatically:**
   - Build Windows and macOS installers
   - Create a GitHub Release
   - Upload both installers
   - Generate release notes from CHANGELOG.md

### Method 2: Manual Release via GitHub Actions

1. Go to **Actions** tab
2. Select **Release** workflow
3. Click **Run workflow**
4. Enter version tag: `v1.0.0`
5. Click **Run workflow**

### Method 3: Manual Release via GitHub UI

1. Go to **Releases** → **Draft a new release**
2. Tag: `v1.0.0`
3. Title: `Open UML v1.0.0`
4. Description: Copy from CHANGELOG.md
5. Upload:
   - `build/OpenUML-Setup-1.0.0.exe` (Windows)
   - `build/OpenUML-1.0.0.dmg` (macOS)
6. Click **Publish release**

## 📸 Adding Screenshots

1. Create a `docs/screenshots/` directory
2. Add screenshots:
   - `dark-theme.png` - Dark theme screenshot
   - `light-theme.png` - Light theme screenshot
3. Commit and push:
   ```bash
   git add docs/screenshots/
   git commit -m "docs: add screenshots"
   git push
   ```

## 🎨 Social Preview Image

1. Create a social preview image (1200x630px)
2. Save as `.github/social-preview.png`
3. GitHub will automatically use it for social media previews

## ✅ Checklist

- [ ] Repository description added
- [ ] Topics/tags added
- [ ] README.md is comprehensive
- [ ] CHANGELOG.md is up to date
- [ ] LICENSE file exists
- [ ] CONTRIBUTING.md exists (optional but recommended)
- [ ] First release created (v1.0.0)
- [ ] Screenshots added (if available)
- [ ] Issues enabled
- [ ] About section filled out

## 🔗 Quick Links

- Repository: https://github.com/choksi2212/open-uml
- Releases: https://github.com/choksi2212/open-uml/releases
- Issues: https://github.com/choksi2212/open-uml/issues

