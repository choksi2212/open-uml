# GitHub Repository Setup

This guide explains how to push the Open UML codebase to GitHub and set up automated releases.

## Initial Setup

### 1. Create Repository

The repository should be named: **open-uml**

URL: `https://github.com/choksi2212/open-uml`

### 2. Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "feat: initial commit - Open UML desktop application"
```

### 3. Add Remote and Push

```bash
git remote add origin https://github.com/choksi2212/open-uml.git
git branch -M main
git push -u origin main
```

## GitHub Actions Setup

The workflow file (`.github/workflows/release.yml`) is already configured. GitHub Actions will automatically:

1. **Build** on Windows and macOS when you push a version tag
2. **Create installers** (.exe and .dmg)
3. **Create GitHub Release** with:
   - Version tag
   - Changelog from CHANGELOG.md
   - Downloadable installers

### Required GitHub Settings

1. **Enable GitHub Actions**
   - Go to repository Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is enabled

2. **Permissions**
   - The workflow uses `GITHUB_TOKEN` (automatically provided)
   - No additional secrets needed

## Creating Your First Release

### Method 1: Push a Tag

```bash
# Update version in package.json
# Update CHANGELOG.md

git add .
git commit -m "chore: release v1.0.0"
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

### Method 2: Manual Workflow Dispatch

1. Go to Actions tab
2. Select "Release" workflow
3. Click "Run workflow"
4. Enter version tag (e.g., `v1.0.0`)
5. Click "Run workflow"

## Release Process

When you push a tag or trigger the workflow:

1. **Windows Build** (runs on `windows-latest`)
   - Installs dependencies
   - Builds application
   - Creates NSIS installer
   - Uploads to GitHub Release

2. **macOS Build** (runs on `macos-latest`)
   - Installs dependencies
   - Builds application
   - Creates DMG installer
   - Uploads to GitHub Release

3. **Release Created**
   - Tag: `v1.0.0`
   - Title: "Open UML v1.0.0"
   - Body: Changelog from CHANGELOG.md
   - Artifacts: `.exe` and `.dmg` files

## Important Notes

### Before First Release

1. **Add PlantUML and JRE**
   - Download `plantuml.jar` to `app/plantuml/`
   - Download JRE to `app/plantuml/jre/`
   - Commit these files (they're needed for the build)

2. **Add Icons (Optional)**
   - Add `app/assets/icon.ico` (Windows)
   - Add `app/assets/icon.icns` (macOS)
   - Or the build will use default Electron icons

3. **Test Build Locally**
   ```bash
   npm run build
   npm run dist
   ```
   Verify installers are created successfully

### Repository Structure

Ensure your repository includes:
- ✅ All source code
- ✅ Configuration files
- ✅ GitHub Actions workflow
- ✅ Documentation
- ✅ PlantUML JAR and JRE (for builds)
- ❌ `node_modules/` (in .gitignore)
- ❌ `dist/` and `build/` (in .gitignore)

## Troubleshooting

### Workflow Fails

- Check Actions tab for error logs
- Verify PlantUML and JRE are in the repository
- Ensure Node.js version matches (20+)
- Check that all dependencies are in package.json

### Release Not Created

- Verify tag format: `v*` (e.g., `v1.0.0`)
- Check workflow permissions
- Review workflow logs for errors

### Installers Not Attached

- Both Windows and macOS builds must complete
- Check that both jobs upload artifacts
- Verify file paths in workflow

## Next Steps

After pushing to GitHub:

1. ✅ Verify repository is public
2. ✅ Check that GitHub Actions are enabled
3. ✅ Test workflow with a beta tag first: `v1.0.0-beta`
4. ✅ Create first release: `v1.0.0`
5. ✅ Share release link with users

---

**Repository**: https://github.com/choksi2212/open-uml

