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

/**
 * V1 `btn-*` token map — re-skinned in place with the V2 design system.
 *
 * Rationale: instead of rewriting every `<Button>` call site in the app
 * (588-file diff on `feat/buttons-v2-migration-consolidated`), we keep
 * the V1 React component, V1 class selectors, and V1 CSS variable names
 * (`--button-{state}-{prop}`) — and swap the *values* under those names
 * to the V2 design tokens. End result: every existing `<Button>` import
 * picks up the V2 look on its next render with zero call-site churn.
 *
 * What we keep from V1 (intentional):
 *   - The `--button-*` CSS variable prefix (V2 uses `--button-v2-*`).
 *   - The `.btn`, `.btn-primary`, `.btn-secondary`, … class selectors.
 *   - The `tag` and `tagBlocked` variants (no V2 equivalent; they layer
 *     on top of `tertiaryFloat`).
 *   - The `darkLabel` / `lightLabel` palette overrides (legacy).
 *
 * What we take from V2 (the visual overhaul):
 *   - Per-color shade ladders (60 → 80 → 90 light / 40 → 20 → 10 dark
 *     with four per-color overrides) — see `primaryLadder`.
 *   - Per-color label colour map (`primaryLabel`) — saturated brand
 *     fills route through soft white / dark text instead of arbitrary
 *     `--theme-surface-invert`.
 *   - Ghost ladder for Tertiary / Float / Subtle / Option hover/active
 *     text (`ghostText{Light,Dark}`).
 *   - Per-variant focus-ring colour (`focusRing{Light,Dark}`).
 *   - Neutral hover lift + inset press shadow (defined as
 *     `--btn-shadow-{hover,active}` in `buttons.css`).
 *   - Soft labels — `--btn-label-on-fill-{light,dark}` (defined in
 *     `buttons-v2.css` and inherited via the shared rule on `.btn`).
 *
 * Source of truth: `tailwind/buttons-v2.ts`. Any change to the V2
 * variations should be mirrored here; the only divergences are the
 * variable prefix (`--button-` vs `--button-v2-`), `tag` / `tagBlocked`
 * (kept), and the focus-ring property (V1 reads it from the same
 * `--button-default-focus-ring-color` variable).
 */

const palette = colors as Record<ColorName, ColorPalette>;

type GhostLadder = { hover: string; active: string };

const NEUTRAL_GHOST: GhostLadder = {
  hover: 'var(--theme-text-primary)',
  active: 'var(--theme-text-primary)',
};

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

const focusRingLight = (color?: ColorName): string => {
  if (!color) {
    return 'var(--theme-accent-blueCheese-default)';
  }
  switch (color) {
    case 'avocado':
    case 'lettuce':
    case 'cheese':
      return 'var(--theme-accent-blueCheese-default)';
    case 'blueCheese':
      return palette.blueCheese['90'];
    case 'bun':
      return palette.bun['90'];
    case 'bacon':
      return palette.bacon['80'];
    default:
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
      return palette[color]['20'];
    default:
      return palette[color]['40'];
  }
};

// ---- Per-color label + shade ladders (mirrors `buttons-v2.ts`). ----------

const DARK_LABEL = 'var(--btn-label-on-fill-dark)';
const WHITE_LABEL = 'var(--btn-label-on-fill-light)';
const NEUTRAL_FILL_WHITE = '#FFFFFF';

type LabelChoice = typeof DARK_LABEL | typeof WHITE_LABEL;

type PrimaryLabel = { light: LabelChoice; dark: LabelChoice };

const primaryLabel: Record<ColorName, PrimaryLabel> = {
  blueCheese: { light: DARK_LABEL, dark: DARK_LABEL },
  avocado: { light: DARK_LABEL, dark: DARK_LABEL },
  lettuce: { light: DARK_LABEL, dark: DARK_LABEL },
  cheese: { light: DARK_LABEL, dark: DARK_LABEL },
  bun: { light: DARK_LABEL, dark: DARK_LABEL },
  burger: { light: WHITE_LABEL, dark: DARK_LABEL },
  ketchup: { light: WHITE_LABEL, dark: DARK_LABEL },
  bacon: { light: DARK_LABEL, dark: DARK_LABEL },
  cabbage: { light: WHITE_LABEL, dark: DARK_LABEL },
  onion: { light: WHITE_LABEL, dark: WHITE_LABEL },
  water: { light: WHITE_LABEL, dark: DARK_LABEL },
  pepper: { light: WHITE_LABEL, dark: WHITE_LABEL },
  salt: { light: DARK_LABEL, dark: DARK_LABEL },
  twitter: { light: WHITE_LABEL, dark: WHITE_LABEL },
  whatsapp: { light: WHITE_LABEL, dark: WHITE_LABEL },
  facebook: { light: WHITE_LABEL, dark: WHITE_LABEL },
  reddit: { light: WHITE_LABEL, dark: WHITE_LABEL },
  linkedin: { light: WHITE_LABEL, dark: WHITE_LABEL },
  telegram: { light: WHITE_LABEL, dark: WHITE_LABEL },
};

const NEUTRAL_PRIMARY_LABEL: PrimaryLabel = {
  light: WHITE_LABEL,
  dark: DARK_LABEL,
};

type ShadeTriple = [Shade, Shade, Shade];

const DEFAULT_LIGHT_LADDER: ShadeTriple = ['60', '80', '90'];
const DEFAULT_DARK_LADDER: ShadeTriple = ['40', '20', '10'];

const primaryLadder: Partial<
  Record<ColorName, { light?: ShadeTriple; dark?: ShadeTriple }>
> = {
  bacon: { light: ['40', '60', '70'], dark: ['40', '30', '20'] },
  burger: { dark: ['30', '10', '10'] },
  ketchup: { dark: ['30', '20', '10'] },
  cabbage: { dark: ['40', '30', '20'] },
  onion: { dark: ['50', '30', '20'] },
  water: { dark: ['40', '30', '20'] },
};

const lightLadder = (color: ColorName): ShadeTriple =>
  primaryLadder[color]?.light ?? DEFAULT_LIGHT_LADDER;
const darkLadder = (color: ColorName): ShadeTriple =>
  primaryLadder[color]?.dark ?? DEFAULT_DARK_LADDER;

// ---- Variations (mirrors `buttons-v2.ts` `variations` block). -----------

const variations: Record<string, VariationFn> = {
  primary: (color) => {
    const dark = color ? darkLadder(color) : DEFAULT_DARK_LADDER;
    const light = color ? lightLadder(color) : DEFAULT_LIGHT_LADDER;
    // Pressed (toggle-on) flips Primary to an outlined chip — text +
    // border in the theme's primary text colour, transparent fill,
    // no lift. Matches the V1 main treatment that ships today; needed
    // because `buttons.css` always rewires `--button-*` to
    // `--button-pressed-*` on `[aria-pressed="true"]`, and an
    // unmapped pressed block leaves those vars undefined and the
    // pressed chrome collapses to invisible. Production callers
    // include `InviteMemberModal`'s Copy-link button (Primary + a
    // momentary `pressed={isCopying}` Copied! state).
    const pressedBlock = {
      color: 'var(--theme-text-primary)',
      background: 'none',
      'border-color': 'var(--theme-text-primary)',
      'box-shadow': 'none',
    };
    return {
      darkStates: {
        default: {
          color: color ? primaryLabel[color].dark : NEUTRAL_PRIMARY_LABEL.dark,
          background: color ? palette[color][dark[0]] : NEUTRAL_FILL_WHITE,
          'border-color': 'transparent',
          'focus-ring-color': focusRingDark(color),
        },
        hover: {
          background: color ? palette[color][dark[1]] : palette.salt['30'],
          'box-shadow': 'var(--btn-shadow-hover)',
        },
        active: {
          background: color ? palette[color][dark[2]] : palette.salt['50'],
          'box-shadow': 'var(--btn-shadow-active)',
        },
        pressed: pressedBlock,
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
          'box-shadow': 'var(--btn-shadow-hover)',
        },
        active: {
          background: color ? palette[color][light[2]] : palette.pepper['50'],
          'box-shadow': 'var(--btn-shadow-active)',
        },
        pressed: pressedBlock,
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
    const dark = color ? darkLadder(color) : DEFAULT_DARK_LADDER;
    const light = color ? lightLadder(color) : DEFAULT_LIGHT_LADDER;
    const ghostDark = ghostTextDark(color);
    const ghostLight = ghostTextLight(color);
    return {
      darkStates: {
        default: {
          color: 'var(--theme-text-secondary)',
          background: 'none',
          'border-color': 'var(--theme-text-secondary)',
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
          background: color ? palette[color][dark[0]] : NEUTRAL_FILL_WHITE,
          'border-color': 'transparent',
        },
        disabled: {
          color: 'var(--theme-text-disabled)',
          'border-color': 'var(--theme-border-subtlest-tertiary)',
        },
      },
      lightStates: {
        default: {
          color: 'var(--theme-text-secondary)',
          background: 'none',
          'border-color': 'var(--theme-text-secondary)',
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
    const ghostDark = ghostTextDark(color);
    const ghostLight = ghostTextLight(color);
    return {
      darkStates: {
        default: {
          color: 'var(--theme-text-secondary)',
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
          color: 'var(--theme-text-secondary)',
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
    // ChatGPT ghost pattern — same default tier as tertiary (text-secondary)
    // because the v2 final tertiary already moved there. Kept as an explicit
    // pass-through so future tweaks (e.g. step further down to text-tertiary)
    // can live in one place.
    if (states.darkStates.default) {
      states.darkStates.default.color = 'var(--theme-text-secondary)';
    }
    if (states.lightStates.default) {
      states.lightStates.default.color = 'var(--theme-text-secondary)';
    }
    return states;
  },
  // ---- V1-only variants kept verbatim (no V2 equivalent). -----------
  tag: (color) => {
    const states = variations.tertiaryFloat(color);
    const def: StateProps = states.darkStates.default ?? {};
    const hov: StateProps = states.darkStates.hover ?? {};
    def.color = 'var(--theme-text-primary)';
    def.icon = 'var(--theme-text-secondary)';
    hov.icon = 'var(--theme-text-primary)';
    states.darkStates.default = def;
    states.darkStates.hover = hov;
    return states;
  },
  tagBlocked: (color) => {
    const states = variations.tag(color);
    const def: StateProps = states.darkStates.default ?? {};
    const hov: StateProps = states.darkStates.hover ?? {};
    const act: StateProps = states.darkStates.active ?? {};
    def.color = 'var(--theme-text-secondary)';
    hov.color = 'var(--theme-text-primary)';
    def.icon = 'var(--theme-text-secondary)';
    hov.icon = 'var(--status-error)';
    act.icon = 'var(--status-error)';
    states.darkStates.default = def;
    states.darkStates.hover = hov;
    states.darkStates.active = act;
    return states;
  },
  quiz: () => ({
    // Visual contract defined directly in `buttons.css` via @apply.
    darkStates: {},
    lightStates: {},
  }),
};

// Variants that accept a `color` prop. Tag / tagBlocked / quiz are excluded —
// `tag` / `tagBlocked` derive from `tertiaryFloat`'s emission, and `quiz`
// ships its visuals from `buttons.css` (@apply rules) rather than tokens.
const colorableVariants = [
  'primary',
  'secondary',
  'tertiary',
  'tertiaryFloat',
  'subtle',
  'option',
];

type CssVarMap = Record<string, string>;
type CssInJs = Record<string, CssVarMap | Record<string, CssVarMap>>;

const statesToCssInJs = (states: StateBlock): CssVarMap => {
  const result: CssVarMap = {};
  (Object.keys(states) as (keyof StateBlock)[]).forEach((state) => {
    const props = states[state];
    if (!props) {
      return;
    }
    Object.keys(props).forEach((prop) => {
      const value = props[prop];
      if (value === undefined) {
        return;
      }
      result[`--button-${state}-${prop}`] = value;
    });
  });
  return result;
};

const styleToCssInJs = (style: VariationStates): CssInJs => ({
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

const variationToStyles = (variation: string): Record<string, CssInJs> => {
  const fn = variations[variation];
  const base: Record<string, CssInJs> = {
    [`.btn-${variation}`]: styleToCssInJs(fn()),
  };
  if (!colorableVariants.includes(variation)) {
    return base;
  }
  return (Object.keys(colors) as ColorName[]).reduce(
    (acc, color) => ({
      ...acc,
      [`.btn-${variation}-${color}`]: styleToCssInJs(fn(color)),
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
    {} as Record<string, CssInJs>,
  );
  addComponents(buttons);
});
