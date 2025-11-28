# Setup Guide for Open UML

This guide will help you set up the Open UML development environment and prepare it for building.

## Prerequisites

- **Node.js 20+** and npm
- **Git**
- **Java JDK 17+** (for development testing, not required for end users)

## Step 1: Clone and Install

```bash
git clone https://github.com/choksi2212/open-uml.git
cd open-uml
npm install
```

## Step 2: Download PlantUML JAR

1. Visit [PlantUML Releases](https://github.com/plantuml/plantuml/releases)
2. Download the latest `plantuml.jar` file
3. Place it in `app/plantuml/plantuml.jar`

```bash
# Example (adjust version number)
curl -L -o app/plantuml/plantuml.jar https://github.com/plantuml/plantuml/releases/download/v1.2024.0/plantuml-1.2024.0.jar
```

## Step 3: Download and Extract JRE

### Windows

1. Download OpenJDK 17+ JRE for Windows from [Adoptium](https://adoptium.net/)
2. Extract the downloaded archive
3. Copy the entire `jre` folder to `app/plantuml/jre/`
4. Verify: `app/plantuml/jre/bin/java.exe` should exist

### macOS

1. Download OpenJDK 17+ JRE for macOS from [Adoptium](https://adoptium.net/)
2. Extract the downloaded archive
3. Copy the entire `jre` folder to `app/plantuml/jre/`
4. Make Java executable:
   ```bash
   chmod +x app/plantuml/jre/bin/java
   ```
5. Verify: `app/plantuml/jre/bin/java` should exist

### Linux (for testing)

1. Download OpenJDK 17+ JRE for Linux
2. Extract and copy to `app/plantuml/jre/`
3. Make executable: `chmod +x app/plantuml/jre/bin/java`

## Step 4: Verify Setup

Test that PlantUML works:

```bash
# Windows
app\plantuml\jre\bin\java.exe -jar app\plantuml\plantuml.jar -version

# macOS/Linux
app/plantuml/jre/bin/java -jar app/plantuml/plantuml.jar -version
```

You should see the PlantUML version number.

## Step 5: Create Icons (Optional)

For a proper release, you'll need icons:

1. Create a 512x512 PNG icon
2. Convert to `.ico` for Windows (see `scripts/create-icons.md`)
3. Convert to `.icns` for macOS
4. Place in `app/assets/icon.ico` and `app/assets/icon.icns`

For development, you can skip this step - the build will work without custom icons.

## Step 6: Run Development Mode

```bash
npm run electron:dev
```

This will:
- Start the Vite dev server
- Launch Electron
- Enable hot reload

## Step 7: Build for Production

```bash
npm run build
npm run dist
```

This creates installers in the `build/` directory:
- Windows: `OpenUML-Setup-*.exe`
- macOS: `OpenUML-*.dmg`

## Troubleshooting

### PlantUML not found

- Ensure `app/plantuml/plantuml.jar` exists
- Check file permissions

### Java not found

- Ensure JRE is extracted to `app/plantuml/jre/`
- Verify `java.exe` (Windows) or `java` (macOS) exists in `jre/bin/`
- Check file permissions (macOS/Linux)

### Build fails

- Ensure all dependencies are installed: `npm install`
- Check that PlantUML and JRE are in place
- Review build logs for specific errors

### Development mode doesn't start

- Ensure port 5173 is available (Vite default)
- Check Node.js version: `node --version` (should be 20+)
- Try clearing node_modules and reinstalling: `rm -rf node_modules && npm install`

## Next Steps

- Read [README.md](README.md) for usage instructions
- Check [CHANGELOG.md](CHANGELOG.md) for version history
- See [scripts/setup-plantuml.md](scripts/setup-plantuml.md) for detailed PlantUML setup

## Building for Release

When ready to create a GitHub release:

1. Update version in `package.json`
2. Update `CHANGELOG.md` with new features
3. Commit changes
4. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
5. GitHub Actions will automatically build and create a release

