# Cookie banner & signup strip

Storybook review and implementation plan for the logged-out signup strip
(`AuthenticationBanner`) colliding with the iubenda cookie card. Read this
before shipping the A/B test.

## The problem

- The iubenda first layer (`#iubenda-cs-banner`, styled by
  `packages/webapp/styles/iubenda.css`) is fixed 24px from the bottom-right
  corner, 340px wide.
- The strip (`AuthenticationBanner`, rendered through `PostAuthBanner`) is
  fixed to the bottom and centers a 1,020px row: headline left, `AuthOptions`
  right (`w-[23.25rem]`).
- They overlap whenever `(window - 1020) / 2 < 364`, i.e. any window under
  ~1,750px. The card covers "Continue with GitHub", the email link and
  "Log in" on every laptop.
- Only visitors in a consent regime see the card (`gdprAppliesGlobally:false`
  - `countryDetection`); everyone else sees the strip alone.

## The test

One string flag, three treatments, production as control:

| Value     | Name          | What it adds to the shared layout                                    |
| --------- | ------------- | -------------------------------------------------------------------- |
| `control` | Production    | nothing; today's two-column strip                                    |
| `column`  | Column layout | nothing; the layout fix on its own                                   |
| `handoff` | Handoff dock  | the cookie card docked as the strip's right column, then a confirm   |
| `sources` | Every source  | six publication logos + "1,300+ sources in one feed" above the title |

Shared layout for every treatment (see `banner.tsx`, `AuthenticationBannerStage`):

- Same height as production: `min-h-[17.75rem]` (284px) with the column
  vertically centered, so every treatment covers exactly as much feed as
  control.
- One column, `max-w-[48rem]`, items left-aligned, centered in the strip.
- Headline typography (words unchanged), sized to fill the 284px:
  - Title solid white (`!bg-none !text-text-primary` over OnboardingHeadline's
    gradient), `text-balance`, `tracking-[-0.015em]`, `!mb-2`.
  - Column and Handoff: `typo-title1`, `typo-large-title` from `laptopL`.
    Every source is one step down (`typo-title2` → `typo-title1`) to make
    room for its logo row.
  - Description `typo-callout`, `text-pretty`, `!leading-[1.4]`,
    `text-text-secondary`, capped at `max-w-[36rem]` (~65 characters).
- `AuthOptions` with the same props as today plus `inlineProviders` (already
  used by `PinnedSignupStrip`), in a `max-w-[32rem]` box under the headline.
  Its `className.container` also lifts the modal's `max-w-[26.25rem]` and
  `overflow-y-auto` (`!max-w-none !overflow-visible`), or the second Large
  provider button is clipped.
- "Continue with email · Already have an account? Log in" on one
  left-aligned row under the providers (`inlineFooter`, step 4).
- While the cookie card is open the strip reserves its lane:
  `[.dd-consent-open_&]:pr-[24.25rem]` (card 340 + inset 24 + gap 24), or
  `pr-[26.25rem]` for the dock. The column recenters when the card goes.

Measured headless with the cookie card showing, geo and default headlines:

| Width | Production          | Column / Handoff / Every source |
| ----- | ------------------- | ------------------------------- |
| 1024  | 284px, 3 under card | 284px, 0 under card             |
| 1366  | 284px, 3 under card | 284px, 0 under card             |
| 1920  | 284px, 0 under card | 284px, 0 under card             |

Metric: strip signup click-through (`TargetId.PublicPageSignupBanner` and the
post page's strip) for visitors who were shown the cookie card; guardrail:
consent answer rate.

## What must not change

- Copy. Every headline still comes from the personalized banners (geo,
  social, user, default) as `children`; button labels come from `AuthOptions`.
- `AuthOptions` behavior, tracking (`AuthTriggers.Onboarding`, `targetId`),
  and `showLogin` handoff.
- The gate. `usePublicPageSignupBannerGate` (laptop, 1,020px) and the post
  page's `showLaptopAuthBanner` stay as they are, so phones and tablets are
  untouched. Every CSS hook below is set only while the strip is mounted.
- The cookie card's copy, controls, equal Reject/Accept, and the 4-line
  show-more clamp. Consent is never bundled with signup.

## Implementation steps

1. **Flag.** In `packages/shared/src/lib/featureManagement.ts` add
   `featureSignupStripLayout = new Feature('signup_strip_layout', 'control')`.
   The default is the control value; never default to a treatment.
2. **Evaluate where the strip renders**, gated like `featurePostSignupStrip`
   on the post page:
   - `PublicPageSignupBanner`: `useConditionalFeature` with
     `shouldEvaluate: shouldShow`.
   - `packages/webapp/pages/posts/[id]/index.tsx`: same, with
     `shouldEvaluate: showPostAuthBanner`.
     Pass the value down as a `layout` prop. Do not read the flag inside
     `AuthenticationBanner`; shared primitives take variants as props.
3. **Thread `layout`** through `PostAuthBanner` →
   `Geo/Social/UserPersonalizedBanner` → `AuthenticationBanner`. In the
   personalized banners, use the stage headline classes from `banner.tsx`
   (`compactHeadline`) when `layout !== 'control'`; copy stays as is.
4. **`AuthenticationBanner`**: when `layout !== 'control'`, render the
   structure in `banner.tsx` (`AuthenticationBannerStage`): same
   `BottomBannerContainer`, background `Image` and `AuthOptions` props, plus
   `inlineProviders`, the column wrapper and the lane padding. `sources` adds
   its logo row above `children`; `handoff` adds the divider and
   the confirmation. Move `FEATURED_SOURCES` and the `1,300+` figure into a
   shared constant (HackathonTracks states the same number).
   For the one-row footer, add an `inlineFooter` prop to `AuthOptions` →
   `OnboardingRegistrationForm` that lays the email link and `MemberAlready`
   out as a left-aligned row with a `·` between them (today's inline branch
   centers and stacks them). The Storybook gets the same result with a
   scoped CSS shim (`.dd-stage-auth` in `cookieStrip.css`); do not ship the
   shim.
5. **Cookie signal.** In `packages/webapp/components/Iubenda.tsx`, toggle
   `dd-consent-open` on `<html>`: add it in `onBannerShown`, remove it in
   `onPreferenceExpressedOrNotNeeded`. Nothing else reads it, so control is
   unaffected.
6. **Handoff dock only.** The strip sets `dd-strip-dock` on `<html>` and
   publishes `--dd-strip-h` (ResizeObserver) while mounted; the card publishes
   `--dd-cookie-h` the same way from `iubendaBanner.ts`. Port the
   `html.dd-strip-dock` rules from `cookieStrip.css` into
   `packages/webapp/styles/iubenda.css` (light theme overrides need both
   `html.light` and `html.auto` under `prefers-color-scheme: light`). The
   "Privacy choices saved" moment needs the answer: observe the
   `dd-consent-open` class or expose it from `Iubenda.tsx`.
7. **Tests.** Extend `PublicPageSignupBanner.spec.tsx` (control renders
   today's layout; a treatment renders the column and inline providers) and
   `webapp/__tests__/iubendaCss.spec.ts` (dock rules keep Reject/Accept
   identical). Run `pnpm --filter webapp test` after the shared change.

## Verify

- Before/after pages in this folder at 1024, 1280, 1366, 1440, 1536, 1728,
  1920 and 2560 wide, plus tablet and phone, with the cookie card showing and
  answered, short and TCF copy, dark and light.
- On a preview: GrowthBook DevTools do not work on previews (production
  build), so flip the flag default in a throwaway commit and revert it before
  merge.

## Files in this folder

- `banner.tsx`: the proposed layout (`AuthenticationBannerStage`) and the
  production headlines in the stage style. Shared-only imports, ready to move.
- `variants.tsx`: production (the real `GeoPersonalizedBanner` /
  `AuthenticationBanner`) and the three treatments.
- `cookieStrip.css`: the Handoff dock's cookie card rules (port into
  `iubenda.css`) and the one-row footer shim (replace with `inlineFooter`).
- `kit.tsx`: review scaffolding: devices, the logged-out Explore backdrop
  (production grid cards), and the iubenda card markup styled by the real
  `iubenda.css` with the real show-more enhancer.
- `frames.tsx`, `Frame.stories.tsx`: each preview is a hidden story loaded in
  an iframe at a real viewport size.
- `review.tsx`, `*.stories.tsx`: the review pages.
