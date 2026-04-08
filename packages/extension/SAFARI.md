# Safari Extension — New Tab Prototype

This is a new-tab-only Safari Web Extension build of daily.dev. It reuses the existing extension's shared code and feed UI, with companion/content script/frame embedding features stripped out.

## What's included

- **New tab override** — full daily.dev feed as Safari's new tab page
- **Background worker** — simplified, handles GraphQL proxying and action button click
- **Onboarding flow** — existing extension onboarding works as-is
- **Authentication** — login/signup via daily.dev SSO

## What's excluded (Phase 2)

- Companion widget (content scripts)
- Frame embedding (`declarativeNetRequest` not supported in Safari)
- `management.uninstallSelf()` prompt

## Building

```bash
# Development (watch mode)
pnpm --filter extension dev:safari

# Production build
pnpm --filter extension build:safari
```

Output goes to `dist/safari/`.

## Xcode Wrapper Setup

Safari Web Extensions must be packaged inside a native macOS/iOS app. Apple provides a converter tool to scaffold this.

### Prerequisites

- macOS with Xcode 14+ installed
- Apple Developer account ($99/year) for App Store distribution
- Xcode Command Line Tools: `xcode-select --install`

### Steps

1. **Build the extension:**
   ```bash
   pnpm --filter extension build:safari
   ```

2. **Convert to Xcode project:**
   ```bash
   xcrun safari-web-extension-converter packages/extension/dist/safari \
     --project-location packages/extension/safari-xcode \
     --app-name "daily.dev" \
     --bundle-identifier dev.daily.safari-extension \
     --swift \
     --macos-only
   ```
   
   Remove `--macos-only` if you also want to target iOS/iPadOS.

3. **Open in Xcode:**
   ```bash
   open packages/extension/safari-xcode/daily.dev/daily.dev.xcodeproj
   ```

4. **Configure signing:**
   - Select the project in Xcode
   - Select the **app target** ("daily.dev") — verify Bundle Identifier is `dev.daily.safari-extension`
   - Select the **extension target** ("daily.dev Extension") — verify Bundle Identifier is `dev.daily.safari-extension.Extension`
   - The extension's bundle ID **must** be prefixed with the parent app's bundle ID
   - Under "Signing & Capabilities", select the same team for both targets

5. **Run locally:**
   - Select a simulator or "My Mac" as the run destination
   - Click Run (Cmd+R)
   - Safari will prompt you to enable the extension in Safari > Settings > Extensions

6. **Enable in Safari:**
   - Open Safari > Settings > Extensions
   - Check "daily.dev" to enable
   - Open a new tab to see the feed

### Testing during development

For faster iteration during dev:

1. Run `pnpm --filter extension dev:safari` (watch mode)
2. In Safari > Develop > Web Extension Background Content, you can inspect the background worker
3. Use Web Inspector on the new tab page for debugging
4. After rebuilding, quit and reopen Safari (or toggle the extension off/on) to reload

### App Store Distribution

1. **Archive:** In Xcode, Product > Archive
2. **Upload:** Use Xcode's Organizer to upload to App Store Connect
3. **Review:** Submit for App Store review
4. The extension will be distributed via the Mac App Store

### Notes

- Safari extensions are distributed as `.app` bundles, not `.zip`/`.crx`
- The Xcode project wraps the web extension output — JS/CSS/HTML are copied in
- You can automate the Xcode build in CI with `xcodebuild`
- The `safari-xcode/` directory should be committed to the repo
- Add `safari-xcode/` to `.gitignore` if you prefer to generate it in CI instead
