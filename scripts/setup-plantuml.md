# Setting Up PlantUML and JRE

This guide explains how to set up the PlantUML JAR and JRE for development and building.

## Required Files

You need to download and place the following in `app/plantuml/`:

1. **plantuml.jar** — The PlantUML rendering engine
2. **JRE** — Java Runtime Environment (OpenJDK 17+)

## Directory Structure

```
app/plantuml/
├── plantuml.jar
└── jre/
    └── bin/
        └── java (or java.exe on Windows)
```

## Step 1: Download PlantUML

1. Go to [PlantUML Releases](https://github.com/plantuml/plantuml/releases)
2. Download the latest `plantuml.jar` file
3. Place it in `app/plantuml/plantuml.jar`

## Step 2: Download JRE

### Windows

1. Download OpenJDK 17+ JRE for Windows from:
   - [Adoptium](https://adoptium.net/) (recommended)
   - [Microsoft OpenJDK](https://www.microsoft.com/openjdk)
2. Extract the JRE
3. Copy the entire JRE folder to `app/plantuml/jre/`
4. Ensure `app/plantuml/jre/bin/java.exe` exists

### macOS

1. Download OpenJDK 17+ JRE for macOS from:
   - [Adoptium](https://adoptium.net/) (recommended)
   - [Azul Zulu](https://www.azul.com/downloads/)
2. Extract the JRE
3. Copy the entire JRE folder to `app/plantuml/jre/`
4. Ensure `app/plantuml/jre/bin/java` exists and is executable:
   ```bash
   chmod +x app/plantuml/jre/bin/java
   ```

## Verification

After setup, verify the structure:

```bash
# Windows
dir app\plantuml\plantuml.jar
dir app\plantuml\jre\bin\java.exe

# macOS/Linux
ls app/plantuml/plantuml.jar
ls app/plantuml/jre/bin/java
```

## Testing

You can test the setup by running:

```bash
# Windows
app\plantuml\jre\bin\java.exe -jar app\plantuml\plantuml.jar -version

# macOS/Linux
app/plantuml/jre/bin/java -jar app/plantuml/plantuml.jar -version
```

This should output the PlantUML version.

## Notes

- The JRE is bundled with the application, so users don't need Java installed
- For production builds, ensure both files are present before running `npm run dist`
- The JRE size is significant (~100-150 MB), but necessary for offline operation

