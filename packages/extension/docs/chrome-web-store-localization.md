# Chrome Web Store localization

The Chrome Web Store listing has two localization layers:

1. Extension package metadata: `name` and `description` come from `public/_locales/<locale>/messages.json` and are referenced from `src/manifest.json`.
2. Store listing copy: the long description, localized screenshots, and localized promo video are managed in the Chrome Web Store developer dashboard per language.

## Supported locales

English is the default locale. Phase 1 adds these target locales as translations become available:

| Language | Chrome locale folder |
| --- | --- |
| Portuguese (Brazil) | `pt_BR` |
| Spanish | `es` |
| German | `de` |
| Japanese | `ja` |
| French | `fr` |

## Adding a new language

1. Create `packages/extension/public/_locales/<locale>/messages.json`.
2. Copy the same message keys from `public/_locales/en/messages.json`.
3. Translate each `message` value. Keep placeholders, punctuation, brand casing, and character limits aligned with the English source.
4. Build the Chrome extension with `pnpm --filter extension build`.
5. Confirm the generated package includes `_locales/<locale>/messages.json`.
6. Upload the package in the Chrome Web Store developer dashboard.
7. In the dashboard, add the matching localized store listing fields for the same language.

Do not add a locale folder with English placeholder copy. Chrome can expose that locale as supported, so only commit a locale when the translation is ready to ship.

## Store listing fields to translate

For each language, prepare:

- Extension name
- Short description
- Detailed description
- Screenshot captions or translated screenshots, if used
- Localized promo video URL, if used
- Any support or policy text shown on the listing

The dashboard work is manual; these longer listing fields are not stored in the extension package.
