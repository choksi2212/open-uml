# Deploying Open UML

This document tracks everything that has to happen between "the code
works locally" and "users can download a polished, signed installer
without warnings." Some steps are code (already in this repo); some are
manual one-time setup; some are recurring per-release.

---

## Code (already done)

- [x] `electron-updater` wired into the main process, gated to packaged
      builds.
- [x] Publish config in `electron-builder.yml` pointing at GitHub
      Releases (`choksi2212/open-uml`).
- [x] Manual `Check for Updates` flow as fallback for unsigned builds.
- [x] File associations registered in the NSIS installer (.puml,
      .plantuml, .iuml, .pu).
- [x] Single-instance lock so double-clicking a second file in Windows
      forwards the path to the running window.
- [x] macOS `open-file` event for double-clicked files.
- [x] CI: lint + test + build on every tagged release.

---

## One-time setup

### Windows code signing

The Windows installer ships unsigned today, so SmartScreen warns every
new user with "Unknown publisher." Two paths:

| Option | Cost | Lead time | Notes |
|---|---|---|---|
| DigiCert / Sectigo EV cert | ~$300–500/yr | 1–2 weeks | Triggers instant SmartScreen reputation. Best UX. |
| SignPath.io (OSS plan) | Free for OSS | 1 week approval | Requires the repo to be on a qualifying license. |

**Setup steps once a cert is acquired:**

1. Convert `.pfx` to a base64 string:
   ```bash
   base64 -w0 cert.pfx > cert.b64   # macOS / Linux
   certutil -encode cert.pfx cert.b64   # Windows
   ```
2. Add three GitHub Actions secrets:
   - `WINDOWS_CERT_FILE` — contents of `cert.b64`
   - `WINDOWS_CERT_PASSWORD` — the cert password
   - `CSC_KEY_PASSWORD` — same password (electron-builder reads this)
3. Add to `package.json` `build.win`:
   ```json
   "certificateFile": "%CSC_LINK%",
   "certificatePassword": "%CSC_KEY_PASSWORD%"
   ```
   `CSC_LINK` is automatically populated from `WINDOWS_CERT_FILE` by the
   standard electron-builder GitHub Action.

### macOS notarization

Unsigned macOS builds are ad-hoc signed; users have to right-click →
Open on first launch. Notarization removes that friction but requires:

1. **Apple Developer account** ($99/yr).
2. App-specific password from appleid.apple.com → generate an
   app-specific password.
3. Add to GitHub Actions secrets:
   - `APPLE_ID` — your Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD` — the generated password
   - `APPLE_TEAM_ID` — your 10-character team ID
4. Replace the ad-hoc signing in `electron-builder.yml` `mac` block:
   ```yaml
   mac:
     identity: "Developer ID Application: Your Name (TEAMID)"
     notarize: true
   ```

### Landing page

A minimal landing page lives at `docs/landing/index.html`. Deploy it to
Vercel / Netlify / GitHub Pages by pointing the host at that directory.
The page is self-contained (no build step) — edit the HTML, push, ship.

### Domain + privacy

Open UML collects nothing. The only network call is the update-check
GET against `api.github.com`. No analytics, no telemetry. Document this
in a `PRIVACY.md` before listing on the Mac App Store (required by
Apple's guidelines).

---

## Per-release checklist

1. Bump `version` in `package.json` (SemVer).
2. Add a section to `CHANGELOG.md` describing the release.
3. Commit on `dev`. Push. Open PR → `main`.
4. Tag the merge commit: `git tag vX.Y.Z` then `git push --tags`.
5. The release workflow builds Windows + macOS, runs tests, and
   publishes the GitHub release with the installers attached.
6. Verify:
   - Download the Windows installer on a clean VM — no SmartScreen
     warning if cert is in place.
   - Mount the macOS DMG — `java` is Mach-O (the existing CI check).
   - The release page links to the right assets.
7. Edit the GitHub release notes if anything needs human context beyond
   the changelog extract.

---

## Things that will fail the release

- Tests failing in the lint-test job.
- The macOS JRE check (`file -b java`) returning anything other than
  `Mach-O`. This is a regression guard for the v1.0.1 bug.
- electron-builder can't reach GitHub to publish — usually a missing
  or expired `GH_TOKEN` secret.

---

## Where to ask for help

- electron-updater docs: https://www.electron.build/auto-update
- electron-builder docs: https://www.electron.build/
- PlantUML CLI: https://github.com/plantuml/plantuml
