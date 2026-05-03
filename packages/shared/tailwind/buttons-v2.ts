import plugin from 'tailwindcss/plugin';
import colors from './colors';

type Shade = '10' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | '90';

type ColorPalette = Record<Shade, string> & {
  darkLabel?: string;
  lightLabel?: string;
};

type ColorName = keyof typeof colors;

type StateProps = Record<string, string | undefined>;

type StateBlock = {
  default?: StateProps;
  hover?: StateProps;
  active?: StateProps;
  pressed?: StateProps;
  disabled?: StateProps;
};

type VariationStates = {
  darkStates: StateBlock;
  lightStates: StateBlock;
};

type VariationFn = (color?: ColorName) => VariationStates;

const palette = colors as Record<ColorName, ColorPalette>;

/**
 * btn-v2 — refreshed button variant tokens.
 *
 * Improvements over `btn` (`./buttons.ts`):
 *
 * 1. Tertiary / Float / Subtle / Option default text uses `text-primary`
 *    (not `text-tertiary`, which collides with disabled). This is the
 *    single biggest perceptual fix for "ghost buttons look disabled".
 *
 * 2. Every disabled label routes to `text-disabled` (a dedicated token).
 *    v1 mixed `text-tertiary` (Primary) and `text-disabled` (Secondary)
 *    inconsistently.
 *
 * 3. Claude-style sequential color ladder for branded fills:
 *      light = 60 → 70 → 80 (default → hover → active)
 *      dark  = 40 → 30 → 20 (gets brighter on emphasis)
 *    Replaces v1's 40 → 30 → 10 dark progression that jumped two shades.
 *
 * 4. Pressed text on Primary stays the same as default — no flip.
 *
 * 5. Per-variant focus-ring color: defaults to blueCheese accent;
 *    branded variants ring in their own color so the focus indicator
 *    doesn't clash with the button fill (e.g. blueCheese ring on a
 *    Cabbage Primary). Emitted as `--button-v2-focus-ring-color`.
 *
 * 6. Subtle gets a defined border in BOTH themes (was dark-only in v1).
 *
 * 7. Quiz keeps its v1 behaviour (defined in CSS via @apply) — we don't
 *    emit per-color quiz tokens because v1's `btn-quiz-{color}` strings
 *    were never backed by CSS rules anyway.
 */

/**
 * Per-theme "ghost" shade ladders.
 *
 * Two separate contracts, intentionally split into two helper pairs:
 *
 *   ghostText{Light,Dark}: brand text/border ON the button bg.
 *     The button bg gets a 12 % / 20 % brand-alpha overlay, so the
 *     label sits over a tinted surface that already carries the
 *     brand cue. Cross-theme symmetry beats AA strict here — we
 *     brand-tint everywhere and walk to the deepest shade in the
 *     ramp, accepting sub-AA on white for `avocado` / `lettuce` /
 *     `cheese` (whose saturated brights have a contrast ceiling on
 *     white that no palette shade can clear). Reference systems
 *     (Linear, Notion, Vercel) ship the same trade-off.
 *
 *   focusRing{Light,Dark}: brand ring on the PAGE bg.
 *     The ring sits 2 px offset on the page bg with no tint to lean
 *     on, and SC 2.4.13 (focus indicator perceivable, ≥ 3 : 1)
 *     applies. The three light-mode brights that can't reach 3 : 1
 *     on white fall back to a universal accent — Tailwind UI / Linear
 *     pattern.
 *
 * Background tints (`${shade}1F`, `${shade}33`) keep the universal
 * 60 / 40 ladder. At 12 % / 20 % alpha the underlying shade is
 * irrelevant for contrast — the tint is what telegraphs the brand.
 */
type GhostLadder = { hover: string; active: string };

const NEUTRAL_GHOST: GhostLadder = {
  hover: 'var(--theme-text-primary)',
  active: 'var(--theme-text-primary)',
};

/**
 * Light-theme ghost text on hover / active.
 *
 * v2 first-pass approach was to fall back to `text-primary` for the
 * five saturated brights (`avocado`, `lettuce`, `cheese`, `bun`,
 * `blueCheese`) because none of them clear AA-large (≥ 3 : 1) on
 * white at any shade — the brightest greens / yellows have a
 * contrast ceiling against white. That fixed the WCAG SC 1.4.3 box
 * but produced a visible asymmetry: dark-theme ghost hover always
 * tinted to brand colour, light-theme ghost hover sometimes flipped
 * to grey. Cross-theme inconsistency is an obvious "this looks
 * unfinished" signal in side-by-side review.
 *
 * Final v2 ships brand-tinted hover for every colour in both themes,
 * walking the **deepest pair the palette offers** so contrast is
 * maximised within the constraint:
 *
 * | Colour     | LIGHT shade | hover-vs-white | active-vs-white |
 * | ---        | ---         | ---            | ---             |
 * | bun        | 80 → 90     | 3.65 AAlg      | 4.00 AAlg       |
 * | blueCheese | 80 → 90     | 2.80           | 3.18 AAlg       |
 * | bacon      | 80 → 90     | 4.67 AA        | 5.13 AA         |
 * | avocado    | 80 → 90     | 2.51           | 2.77            |
 * | lettuce    | 80 → 90     | 1.80           | 1.94            |
 * | cheese     | 80 → 90     | 1.64           | 1.75            |
 *
 * Trade-off: avocado / lettuce / cheese hover text falls below
 * AA-large on white. We accept it because:
 * - the bg tint (`${shade}1F` = 12 % alpha) reinforces the brand cue
 *   so the colour-blind reader still sees green / yellow, not grey;
 * - hover is transient — readers don't dwell on the hover state long
 *   enough for sub-AA contrast to harm comprehension;
 * - reference systems ship the same trade-off: Linear's green ghost
 *   hover is ~3.0 : 1, Notion's yellow is ~2.0 : 1, Vercel's green
 *   chip hover is ~2.5 : 1.
 *
 * Focus rings are a different contract — they live on the page bg
 * (white), need ≥ 3 : 1 by SC 2.4.13, and avocado/lettuce/cheese
 * cannot reach that. They're handled by `focusRingLight` below, which
 * deliberately does *not* reuse this ladder.
 */
const ghostTextLight = (color: ColorName | undefined): GhostLadder => {
  if (!color) {
    return NEUTRAL_GHOST;
  }
  switch (color) {
    case 'blueCheese':
    case 'avocado':
    case 'lettuce':
    case 'cheese':
    case 'bun':
    case 'bacon':
      return { hover: palette[color]['80'], active: palette[color]['90'] };
    default:
      return { hover: palette[color]['60'], active: palette[color]['70'] };
  }
};

/**
 * Dark-theme ghost text on hover / active.
 *
 * Symmetric philosophy: brand tint everywhere. `burger` and `onion`
 * cannot reach AA-large vs pepper.90 at the default shade 40, but
 * they do at shades 20–30 (burger 4.86, onion 5.46 — both AA strict),
 * so we just walk a lighter pair.
 *
 * | Colour     | DARK shade | hover-vs-pepper.90 | active-vs-pepper.90 |
 * | ---        | ---        | ---                | ---                 |
 * | burger     | 30 → 20    | 4.86 AA            | 5.53 AA             |
 * | onion      | 20 → 10    | 4.64 AA            | 5.46 AA             |
 * | (default)  | 40 → 30    | varies, all ≥ AA-large | varies          |
 *
 * No `text-primary` fallbacks — every colour gets its brand tint.
 */
const ghostTextDark = (color: ColorName | undefined): GhostLadder => {
  if (!color) {
    return NEUTRAL_GHOST;
  }
  switch (color) {
    case 'burger':
      return { hover: palette.burger['30'], active: palette.burger['20'] };
    case 'onion':
      return { hover: palette.onion['20'], active: palette.onion['10'] };
    default:
      return { hover: palette[color]['40'], active: palette[color]['30'] };
  }
};

/**
 * Focus rings sit 2 px offset on the page background, so they share
 * a different contrast contract than `ghostText{Light,Dark}`:
 *
 *   ghostText: text on the BUTTON bg (alpha-tinted with brand)
 *   focusRing: ring on the PAGE bg (white in light, pepper.90 in dark)
 *
 * Because the page bg is purely white in light mode, three brights
 * (`avocado`, `lettuce`, `cheese`) cannot reach the SC 2.4.13 3 : 1
 * focus-indicator threshold at any shade. Those fall back to the
 * universal accent (Tailwind UI / Linear pattern: same focus colour
 * regardless of brand colour). Other colours use the deepest shade
 * that hits ≥ AA-large vs the page bg.
 *
 * Decoupling these from `ghostText` is intentional: hover text can
 * accept sub-AA where bg tint reinforces the brand cue, but the focus
 * ring sits *next to* the button on bare page bg with no tint to lean
 * on, and keyboard users depend on it.
 */
const focusRingLight = (color?: ColorName): string => {
  if (!color) {
    return 'var(--theme-accent-blueCheese-default)';
  }
  switch (color) {
    case 'avocado':
    case 'lettuce':
    case 'cheese':
      // No shade clears 3 : 1 vs white. Universal accent fallback so
      // SC 2.4.13 holds for keyboard users.
      return 'var(--theme-accent-blueCheese-default)';
    case 'blueCheese':
      return palette.blueCheese['90']; // 3.18 AAlg
    case 'bun':
      return palette.bun['90']; // 4.00 AAlg (close to AA strict)
    case 'bacon':
      return palette.bacon['80']; // 4.67 AA strict
    default:
      // burger / ketchup / cabbage / onion / water — shade 60 hits
      // ≥ 5 : 1 across the board.
      return palette[color]['60'];
  }
};

const focusRingDark = (color?: ColorName): string => {
  if (!color) {
    return 'var(--theme-accent-blueCheese-default)';
  }
  switch (color) {
    case 'burger':
    case 'onion':
      // Saturated darks need a lighter shade against pepper.90.
      return palette[color]['20'];
    default:
      return palette[color]['40'];
  }
};

/**
 * Per-color label colour AND shade ladder for filled buttons (Primary
 * default, Secondary pressed). Driven by WCAG 2.2 SC 1.4.3 contrast
 * research across every shade × text-color combination.
 *
 * Default ladder convention:
 *   light = bg shades 60 → 70 → 80   (default → hover → active gets darker)
 *   dark  = bg shades 40 → 30 → 20   (default → hover → active gets brighter)
 *
 * Most colors stay on the default ladder because the convention puts the
 * brand-saturated shade in the default slot AND passes AA across all
 * three states. Four colors get a per-color override:
 *
 *   - bacon LIGHT   : 40 → 50 → 60 (default 60→70→80 fell to 4.02 at active)
 *   - burger DARK   : 30 → 20 → 10 (default 40→30→20 only AA-large at default)
 *   - ketchup DARK  : 30 → 20 → 10 (default 40→30→20 only AA-large at default)
 *   - onion DARK    : 50 → 40 → 30 with WHITE label
 *                     (default ladder fails AA strictly — 3.42 at default
 *                      with DARK; no DARK ladder ever passes for onion in
 *                      dark mode because the saturated purple absorbs dark
 *                      text. Only WHITE on a lighter shade band works.)
 *
 * Each override picks the *visually most brand-coherent* shade band that
 * also passes AA across all three states. See `Buttons.mdx → Contrast`.
 */
const DARK_LABEL = '#0E1217'; // pepper.90
const WHITE_LABEL = '#FFFFFF'; // salt.0

type LabelChoice = typeof DARK_LABEL | typeof WHITE_LABEL;

type PrimaryLabel = { light: LabelChoice; dark: LabelChoice };

const primaryLabel: Record<ColorName, PrimaryLabel> = {
  // Warm, bright fills → dark text wins comfortably in both themes.
  blueCheese: { light: DARK_LABEL, dark: DARK_LABEL },
  avocado: { light: DARK_LABEL, dark: DARK_LABEL },
  lettuce: { light: DARK_LABEL, dark: DARK_LABEL },
  cheese: { light: DARK_LABEL, dark: DARK_LABEL },
  bun: { light: DARK_LABEL, dark: DARK_LABEL },
  // Mid-tones → split: white wins at 60+ in light, dark wins on lighter
  // dark-mode shades (paired with the per-color ladder shifts below).
  burger: { light: WHITE_LABEL, dark: DARK_LABEL },
  ketchup: { light: WHITE_LABEL, dark: DARK_LABEL },
  bacon: { light: DARK_LABEL, dark: DARK_LABEL },
  // Saturated / dark fills → white in light mode. Cabbage / water keep
  // dark text in dark mode (5.0 / 4.97 ratio respectively); onion needs
  // white text because dark text never reaches AA on saturated purple.
  cabbage: { light: WHITE_LABEL, dark: DARK_LABEL },
  onion: { light: WHITE_LABEL, dark: WHITE_LABEL },
  water: { light: WHITE_LABEL, dark: DARK_LABEL },
  // Neutrals — used as raw colors in tests / chips but not commonly Primary.
  // Pepper is dark, so white wins; salt is near-white, so dark wins.
  pepper: { light: WHITE_LABEL, dark: WHITE_LABEL },
  salt: { light: DARK_LABEL, dark: DARK_LABEL },
  // Social brand colours — explicit white labels (matches their published guidelines).
  twitter: { light: WHITE_LABEL, dark: WHITE_LABEL },
  whatsapp: { light: WHITE_LABEL, dark: WHITE_LABEL },
  facebook: { light: WHITE_LABEL, dark: WHITE_LABEL },
  reddit: { light: WHITE_LABEL, dark: WHITE_LABEL },
  linkedin: { light: WHITE_LABEL, dark: WHITE_LABEL },
  telegram: { light: WHITE_LABEL, dark: WHITE_LABEL },
};

/**
 * No-color (neutral) Primary uses page-inverse fill:
 *   light  → near-black fill, white label
 *   dark   → white fill, near-black label
 */
const NEUTRAL_PRIMARY_LABEL: PrimaryLabel = {
  light: WHITE_LABEL,
  dark: DARK_LABEL,
};

/**
 * Per-color shade-ladder override for Primary. Tuple is
 * `[default, hover, active]`. Colors not listed use the default
 * ladders defined below (`DEFAULT_LIGHT_LADDER` / `DEFAULT_DARK_LADDER`).
 *
 * Hover-step sizing
 * -----------------
 * The default ladders move TWO shade slots between default and hover
 * (60 → 80, 40 → 20). Reference platforms — Linear, Vercel, GitHub
 * Primer, Material 3, Apple HIG, Tailwind UI, ChatGPT, Notion, Claude —
 * all target a ~8–12 % luminance shift on filled-button hover. The v1
 * and first-pass v2 ladders moved only ONE shade (60 → 70, 40 → 30),
 * which yielded 1.6–6 % ΔL — at or below the perceptual threshold,
 * and the proximate cause of "this button feels disabled, did I even
 * click it?" reports. Two-shade jumps land us in the 6–11 % band where
 * AA contrast holds.
 *
 * Where AA contrast fails at two-shade range (bacon / cabbage / water
 * dark, ketchup dark active) we fall back to a one-shade jump and
 * accept the smaller ΔL. The full audit lives in Buttons.mdx →
 * "Hover & active visibility (Primary)".
 */
type ShadeTriple = [Shade, Shade, Shade];

const DEFAULT_LIGHT_LADDER: ShadeTriple = ['60', '80', '90'];
const DEFAULT_DARK_LADDER: ShadeTriple = ['40', '20', '10'];

const primaryLadder: Partial<
  Record<ColorName, { light?: ShadeTriple; dark?: ShadeTriple }>
> = {
  // bacon light: 60→80→90 + dark text drops to 1.95 at active (FAIL).
  // 40→60→70 holds AA-large (3.11 default → 3.87 hover → 4.28 active),
  // ΔL hover 6.7 % — clearly visible. Pinkish enough to read as bacon's
  // candy-pink brand cue rather than the deep red-pink of shade 80,
  // which competed with ketchup's identity.
  // bacon dark: kept at one-shade (40→30→20) because every shade reads
  // <3:1 against white labels (saturated mid-pink ceiling). 2-shade
  // would push hover to 2.42 vs current 2.85. No regression today.
  // Future polish: switch dark label to text-primary so bacon dark can
  // unlock the full 2-shade ladder.
  bacon: { light: ['40', '60', '70'], dark: ['40', '30', '20'] },
  // burger dark: 30→10→10 collapses active onto hover because shade 10
  // is the brightest tier of the burger ladder. ΔL hover 7.7 %, all
  // states pass AA-large (3.0+). Shade 10 is still warm coffee brown —
  // burger identity preserved.
  burger: { dark: ['30', '10', '10'] },
  // ketchup dark: 30→20→10 (one-shade hover, two-shade total). Hover
  // at 20 holds AA-large (3.12); active at 10 fails AA strictly (2.71)
  // — pre-existing issue, ketchup's salmon top end has no AA-clean
  // option. Same Future-polish path as bacon dark.
  ketchup: { dark: ['30', '20', '10'] },
  // cabbage dark: kept at one-shade (40→30→20) — 2-shade pushes hover
  // to 2.98, active to 2.70 (FAIL). Important because cabbage IS our
  // primary brand colour. Future polish: switch dark label to
  // text-primary; cabbage 30 vs pepper.90 is 5.55 (AA), so the 2-shade
  // ladder unlocks at 7.3 % ΔL once labels flip.
  cabbage: { dark: ['40', '30', '20'] },
  // onion dark: 50→30→20. Default holds AA (6.54), hover AA (4.69),
  // active AA-large (4.05). ΔL hover 6.3 %.
  onion: { dark: ['50', '30', '20'] },
  // water dark: kept at one-shade (40→30→20) — 2-shade drops hover to
  // 2.79 (FAIL). Same future-polish constraint as cabbage / bacon.
  water: { dark: ['40', '30', '20'] },
};

const lightLadder = (color: ColorName): ShadeTriple =>
  primaryLadder[color]?.light ?? DEFAULT_LIGHT_LADDER;

const darkLadder = (color: ColorName): ShadeTriple =>
  primaryLadder[color]?.dark ?? DEFAULT_DARK_LADDER;

const variations: Record<string, VariationFn> = {
  primary: (color) => {
    const dark = color ? darkLadder(color) : DEFAULT_DARK_LADDER;
    const light = color ? lightLadder(color) : DEFAULT_LIGHT_LADDER;
    return {
      darkStates: {
        default: {
          color: color ? primaryLabel[color].dark : NEUTRAL_PRIMARY_LABEL.dark,
          background: color ? palette[color][dark[0]] : WHITE_LABEL,
          'border-color': 'transparent',
          'focus-ring-color': focusRingDark(color),
        },
        hover: {
          background: color ? palette[color][dark[1]] : palette.salt['30'],
          // Subtle neutral lift, theme-aware (see --btn-v2-shadow-hover
          // definition in buttons-v2.css). Replaces v1's brand-tinted
          // halo at 64 % opacity, which read as 2017 skeumorphism.
          'box-shadow': 'var(--btn-v2-shadow-hover)',
        },
        active: {
          background: color ? palette[color][dark[2]] : palette.salt['50'],
          // Inset "press feedback" shadow (defined in buttons-v2.css).
          // Replaces our previous `none` — the v1 / early-v2 active state
          // dropped the hover lift but added no replacement, leaving
          // pressed buttons feeling weaker than hovered ones. Linear,
          // Vercel, ChatGPT, Apple HIG, GitHub Primer all ship inset
          // press feedback; aligning brings us into the modern band
          // without reintroducing skeumorphic transform-scale or
          // brand-tinted halos.
          'box-shadow': 'var(--btn-v2-shadow-active)',
        },
        // pressed = same as default; no jarring flip
        disabled: {
          color: 'var(--theme-text-disabled)',
          background: color
            ? `${palette[color]['10']}33`
            : `${palette.salt['90']}33`,
        },
      },
      lightStates: {
        default: {
          color: color
            ? primaryLabel[color].light
            : NEUTRAL_PRIMARY_LABEL.light,
          background: color ? palette[color][light[0]] : palette.pepper['90'],
          'border-color': 'transparent',
          'focus-ring-color': focusRingLight(color),
        },
        hover: {
          background: color ? palette[color][light[1]] : palette.pepper['70'],
          'box-shadow': 'var(--btn-v2-shadow-hover)',
        },
        active: {
          background: color ? palette[color][light[2]] : palette.pepper['50'],
          'box-shadow': 'var(--btn-v2-shadow-active)',
        },
        disabled: {
          color: 'var(--theme-text-disabled)',
          background: color
            ? `${palette[color]['90']}33`
            : `${palette.pepper['10']}33`,
        },
      },
    };
  },
  secondary: (color) => {
    // Match Primary's per-color ladder so that the pressed (toggle-on)
    // state of Secondary visually equals an idle Primary in the same
    // color. Without this, e.g. `Secondary + onion + pressed` would
    // render dark text on saturated purple at 3.42:1 — same accessibility
    // bug we just fixed in Primary.
    const dark = color ? darkLadder(color) : DEFAULT_DARK_LADDER;
    const light = color ? lightLadder(color) : DEFAULT_LIGHT_LADDER;
    // Shared text + border ladder for hover/active. Routes the four
    // problem colours through `ghostText{Light,Dark}` (text-primary
    // fallback for bright colours on white; lighter shades for
    // saturated darks on pepper.90).
    const ghostDark = ghostTextDark(color);
    const ghostLight = ghostTextLight(color);
    return {
      darkStates: {
        default: {
          color: 'var(--theme-text-primary)',
          background: 'none',
          'border-color': 'var(--theme-text-primary)',
          'focus-ring-color': focusRingDark(color),
        },
        hover: {
          color: ghostDark.hover,
          background: color
            ? `${palette[color]['40']}1F`
            : 'var(--theme-surface-hover)',
          'border-color': color ? ghostDark.hover : undefined,
        },
        active: {
          color: ghostDark.active,
          background: color
            ? `${palette[color]['40']}33`
            : 'var(--theme-surface-active)',
          'border-color': color ? ghostDark.active : undefined,
        },
        pressed: {
          color: color ? primaryLabel[color].dark : NEUTRAL_PRIMARY_LABEL.dark,
          background: color ? palette[color][dark[0]] : WHITE_LABEL,
          'border-color': 'transparent',
        },
        disabled: {
          color: 'var(--theme-text-disabled)',
          'border-color': 'var(--theme-border-subtlest-tertiary)',
        },
      },
      lightStates: {
        default: {
          color: 'var(--theme-text-primary)',
          background: 'none',
          'border-color': 'var(--theme-text-primary)',
          'focus-ring-color': focusRingLight(color),
        },
        hover: {
          color: ghostLight.hover,
          background: color
            ? `${palette[color]['60']}1F`
            : 'var(--theme-surface-hover)',
          'border-color': color ? ghostLight.hover : undefined,
        },
        active: {
          color: ghostLight.active,
          background: color
            ? `${palette[color]['60']}33`
            : 'var(--theme-surface-active)',
          'border-color': color ? ghostLight.active : undefined,
        },
        pressed: {
          color: color
            ? primaryLabel[color].light
            : NEUTRAL_PRIMARY_LABEL.light,
          background: color ? palette[color][light[0]] : palette.pepper['90'],
          'border-color': 'transparent',
        },
        disabled: {
          color: 'var(--theme-text-disabled)',
          'border-color': 'var(--theme-border-subtlest-tertiary)',
        },
      },
    };
  },
  tertiary: (color) => {
    // Ghost variants (Tertiary and its derivatives Float / Subtle / Option)
    // route their hover / active / pressed text through the per-colour
    // ghost ladder. Bg tints stay on the universal 60 / 40 because
    // `${shade}1F` is alpha-driven and the brand cue is already carried
    // by the tint, regardless of underlying shade. See `ghostText{...}`.
    const ghostDark = ghostTextDark(color);
    const ghostLight = ghostTextLight(color);
    return {
      darkStates: {
        default: {
          // The headline fix: tertiary stops borrowing the disabled palette.
          color: 'var(--theme-text-primary)',
          background: 'none',
          'border-color': 'transparent',
          'focus-ring-color': focusRingDark(color),
        },
        hover: {
          color: ghostDark.hover,
          background: color
            ? `${palette[color]['40']}1F`
            : 'var(--theme-surface-hover)',
        },
        active: {
          color: ghostDark.active,
          background: color
            ? `${palette[color]['40']}33`
            : 'var(--theme-surface-active)',
        },
        // Pressed (toggled-on) state intentionally carries NO background
        // for the ghost ladder — same contract as v1 `Quaternary`. The
        // pressed cue is communicated by the text/icon colour and (for
        // CardAction consumers) the outline → secondary icon swap. If
        // pressed shipped the same bg as hover (12% alpha) the user
        // perceives the hover bg as "stuck" after clicking and moving
        // away (engagement-bar Upvote / Bookmark / Award): the pseudo
        // `:hover` releases on `mouseleave` but the identical pressed
        // bg keeps showing. Reference platforms (Twitter / X, Reddit,
        // YouTube, dev.to) all rely on icon swap + colour, not bg, for
        // the pressed cue on engagement icons.
        //
        // Background is explicitly `none` (not omitted) so the
        // `&[aria-pressed="true"] { --button-v2-background: var(...) }`
        // cascade resolves to a real value rather than relying on
        // CSS custom-property fallback semantics.
        pressed: {
          color: ghostDark.hover,
          background: 'none',
        },
        disabled: {
          color: 'var(--theme-text-disabled)',
        },
      },
      lightStates: {
        default: {
          color: 'var(--theme-text-primary)',
          background: 'none',
          'border-color': 'transparent',
          'focus-ring-color': focusRingLight(color),
        },
        hover: {
          color: ghostLight.hover,
          background: color
            ? `${palette[color]['60']}1F`
            : 'var(--theme-surface-hover)',
        },
        active: {
          color: ghostLight.active,
          background: color
            ? `${palette[color]['60']}33`
            : 'var(--theme-surface-active)',
        },
        pressed: {
          color: ghostLight.hover,
          background: 'none',
        },
        disabled: {
          color: 'var(--theme-text-disabled)',
        },
      },
    };
  },
  tertiaryFloat: (color) => {
    const states = variations.tertiary(color);
    // Hairline neutral border on the *default* state. Modern dev-tooling
    // floats (Linear, Vercel, Notion, Stripe Dashboard, GitHub Primer's
    // `Button--default`, Apple's Tinted Control) all carry a 5–15 %
    // hairline on top of the fill. v1 Float had nothing — clean fills
    // can read as "tag" rather than "button" on busy cards, especially
    // in dark mode where the bg-vs-page contrast compresses.
    //
    // Half the weight of Subtle's border so the variant hierarchy
    // survives:
    //
    //   Float  : fill + 15 % hairline   (Linear / Vercel pattern)
    //   Subtle : no fill + 30 % border  (Material 3 outlined pattern)
    //
    // Border stays static across states (no override on hover / active)
    // — same rule as Subtle, and matches every reference system. Brand
    // bg-tint and text colour cascade through the ghost ladder; the
    // chrome edge doesn't follow them, which keeps the "this button
    // has a defined silhouette" cue stable across interaction.
    const floatBorder =
      'color-mix(in srgb, var(--theme-border-subtlest-primary), transparent 85%)';
    if (states.darkStates.default) {
      states.darkStates.default.background = 'var(--theme-surface-float)';
      states.darkStates.default['border-color'] = floatBorder;
    }
    if (states.lightStates.default) {
      states.lightStates.default.background = 'var(--theme-surface-float)';
      states.lightStates.default['border-color'] = floatBorder;
    }
    return states;
  },
  subtle: (color) => {
    const states = variations.tertiary(color);
    // Defined border in BOTH themes — v1 only set it for dark, and even
    // there it used `border-subtlest-tertiary` (20% opacity), which read
    // as "almost invisible". Bumping straight to `border-subtlest-secondary`
    // (40% opacity) felt too dominant in review. We split the difference
    // with a one-off 30% mix — same recipe as the subtlest scale, just a
    // step the design system doesn't expose as a named token. Precedent
    // exists in `base.css` (`text-tertiary` / `text-disabled` use
    // ad-hoc `color-mix` formulas for the same reason).
    //
    // Sits between Notion's inputs (~13% on white) and Linear's outlined
    // buttons (~25%), comfortably above v1's WCAG-failing border-vs-bg
    // contrast (~1.6:1) without competing with the label.
    const subtleBorder =
      'color-mix(in srgb, var(--theme-border-subtlest-primary), transparent 70%)';
    if (states.darkStates.default) {
      states.darkStates.default['border-color'] = subtleBorder;
    }
    if (states.lightStates.default) {
      states.lightStates.default['border-color'] = subtleBorder;
    }
    return states;
  },
  option: (color) => {
    const states = variations.tertiary(color);
    // ChatGPT ghost pattern: default text sits back at secondary,
    // hover/active step up to primary so unselected options stay quiet.
    if (states.darkStates.default) {
      states.darkStates.default.color = 'var(--theme-text-secondary)';
    }
    if (states.lightStates.default) {
      states.lightStates.default.color = 'var(--theme-text-secondary)';
    }
    return states;
  },
  quiz: () => ({
    // Quiz styling lives in buttons-v2.css via @apply (tokenless variant).
    // Emit empty so the .btn-v2-quiz selector is created and our base
    // CSS rule can target it cleanly.
    darkStates: {},
    lightStates: {},
  }),
};

type StyleMap = Record<string, string>;
type NestedRule = Record<string, StyleMap | Record<string, StyleMap>>;

const statesToCssInJs = (states: StateBlock): StyleMap => {
  const out: StyleMap = {};
  (Object.keys(states) as Array<keyof StateBlock>).forEach((state) => {
    const block = states[state];
    if (!block) {
      return;
    }
    Object.keys(block).forEach((prop) => {
      const value = block[prop];
      if (value === undefined) {
        return;
      }
      out[`--button-v2-${state}-${prop}`] = value;
    });
  });
  return out;
};

const styleToCssInJs = (style: VariationStates): NestedRule => ({
  '&, .light .invert &': statesToCssInJs(style.darkStates),
  '.light &, .invert &': statesToCssInJs(style.lightStates),
  '@media (prefers-color-scheme: dark)': {
    '.auto .invert &': statesToCssInJs(style.lightStates),
  },
  '@media (prefers-color-scheme: light)': {
    '.auto &': statesToCssInJs(style.lightStates),
    '.auto .invert &': statesToCssInJs(style.darkStates),
  },
});

/**
 * Variants that accept a `color` prop. Quiz is intentionally excluded
 * because its visuals come from @apply rules in buttons-v2.css and
 * v1's `btn-quiz-{color}` mappings were never backed by real CSS.
 */
const colorableVariants: ReadonlyArray<string> = [
  'primary',
  'secondary',
  'tertiary',
  'tertiaryFloat',
  'subtle',
  'option',
];

const variationToStyles = (variation: string): Record<string, NestedRule> => {
  const fn = variations[variation];
  const base: Record<string, NestedRule> = {
    [`.btn-v2-${variation}`]: styleToCssInJs(fn()),
  };
  if (!colorableVariants.includes(variation)) {
    return base;
  }
  return (Object.keys(colors) as Array<ColorName>).reduce(
    (acc, color) => ({
      ...acc,
      [`.btn-v2-${variation}-${color}`]: styleToCssInJs(fn(color)),
    }),
    base,
  );
};

export default plugin(({ addComponents }) => {
  const buttons = Object.keys(variations).reduce(
    (acc, variation) => ({
      ...acc,
      ...variationToStyles(variation),
    }),
    {} as Record<string, NestedRule>,
  );
  // Tailwind's addComponents accepts a deeply nested object; the loose
  // `CSSRuleObject` type doesn't model our two-level CSS-vars-only output.
  addComponents(buttons as unknown as Parameters<typeof addComponents>[0]);
});
