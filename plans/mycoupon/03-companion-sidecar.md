# MyCoupon — Extension Sidecar (Honey-style side initiative)

Future-facing mock: the daily.dev extension already lives in the browser — the sidecar makes it find deals *while devs shop elsewhere*, Honey-style, but with daily.dev's community trust layer.

## Positioning vs Honey

Honey is installed *only* to save money at checkout; daily.dev is already installed for the feed. The sidecar is therefore a **zero-CAC feature drop to an existing install base**, not a new install ask. Inverting Honey's funnel: they acquire via savings and monetize attention; we already have attention and add savings.

## The three moments (mock all three)

1. **Store detected (passive nudge).** User lands on a supported store (amazon.com, jetbrains.com, keychron.com…). A small collapsed pill slides in bottom-right (the companion's existing position): daily.dev logo + "3 deals for this store". Dismissible, remembers dismissal per-store per-day. Never blocks content.
2. **Deal panel (expanded).** Clicking the pill opens a panel styled like the existing companion: list of offers for this store (code / cashback-style credit / community-verified stats), each with Copy + "worked ✓ 41 times this week", plus "512 devs on daily.dev follow this brand" — community proof Honey can't show.
3. **Checkout auto-apply (the magic moment).** On a checkout URL the pill pulses: "Try 4 codes automatically". Clicking runs the Honey-signature theater: modal cycling through codes one-by-one with live status (testing → failed → failed → **WORKED −$18**), ending in either a savings celebration or the trust-builder "You already have the best price — nothing beats it today." Both end-states get equal design love (the honest empty result is what builds the habit).

## Store policy: the Honey pattern is now banned (this constrains the design)

Chrome Web Store policy, enforced from 10 June 2025, prohibits setting an affiliate link, code, or cookie **without a related user action AND a tangible benefit delivered at that moment**. Honey's silent attribution on page load is a removal offense today. Amazon's Associates operating agreement separately bans Special Links in "browser plug-in, toolbar, extension" and in email/SMS, and bans incentivising clicks. Both rules bind us.

Design consequences, non-negotiable:

- **Click-to-act only.** Nothing fires on page load. No cookie, no affiliate parameter, no attribution until the user explicitly clicks "Find codes" / "Apply". The passive pill may only *announce* that deals exist.
- **Attribution only alongside delivered value.** If no code works, we take no commission credit and say so in the result state ("No affiliate link was added" already appears in the best-price ending — keep it, it is now a compliance feature, not just a nicety).
- **No Amazon offers in the extension surface at all**, and no Amazon links in email. Amazon deals live only in the web directory. The current sidecar mock includes an amazon.com store and must drop it.
- **Disclosure in three places:** the store listing, a pre-install/first-run screen, and persistently in the panel UI.
- Codes are community-verified; we show real success rates, and merchants cannot suppress the stats.
- No affiliate attribution when we contributed nothing — never inject attribution silently.
- Panel footer disclosure: "daily.dev may earn a commission on some deals. It keeps daily.dev free."

Because click-to-act is mandatory, the auto-apply theater stays valuable but must be **user-initiated every time** (the pill's "Try 4 codes automatically" click IS the required user action). That is already how the mock works; the compliance risk is any future "just do it silently" optimization.

## Cross-sell hooks

- Panel footer links to the full `/deals` directory ("See all 240 dev deals").
- After a successful auto-apply: "Saved $18 — share this deal" → feeds Growth Loop 1.
- Webapp-side teaser (mock as a directory banner): "Get deals while you browse — enable the sidecar" for users on the extension with the flag off, and an install CTA for webapp-only users.

## Mock scope (Storybook only, no real extension wiring)

Build as Storybook stories simulating the host page underneath (a fake store page backdrop): collapsed pill, expanded panel, auto-apply run (animated, ~4s scripted sequence), success + best-price end states, settings row (per-store mute). Reuse companion visual conventions from `packages/extension/src/companion` but implement as self-contained mock components in the storybook package.
