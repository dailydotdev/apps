import type { Meta, StoryObj } from '@storybook/react-vite';
import type {
  ComponentType,
  CSSProperties,
  ReactElement,
  ReactNode,
} from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  VIcon,
  AlertIcon,
  WarningIcon,
  InfoIcon,
  MiniCloseIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import { Loader } from '@dailydotdev/shared/src/components/Loader';

/**
 * Design-review playground (not shipping UI). Compares the CURRENT toast (see
 * `Toast.tsx` / `notifications/utils.ts`) with a PROPOSED "v2" — a compact,
 * top-center, inverting "chip" that keeps daily.dev's signature look but fixes
 * contrast, adds proper semantic variants, and adopts the behaviour playbook of
 * Sonner (Vercel, Cursor), Linear, Material 3 and Raycast.
 *
 * Two findings drove this revision:
 *   1. The chip background INVERTS per theme (`bg-text-primary`). Status colours
 *      must therefore resolve against the CHIP, not the page — so the chip's
 *      contents render in an inverted theme context (`.invert`). Text and icons
 *      then pick the correct value automatically. This is what fixes the
 *      dark-on-dark / wrong-icon-colour issues from the first pass.
 *   2. Best-in-class compact confirmation toasts are SINGLE LINE, monochrome
 *      text + ONE vibrant status-coloured icon (Material's accent-only rule),
 *      with NO left accent bar and NO progress bar. The value is in behaviour:
 *      motion, stacking, per-severity timing, pause-on-hover.
 *
 * Reference values gathered (Sonner source constants):
 *   TOAST_WIDTH 356 · GAP 14 · VISIBLE_TOASTS_AMOUNT 3 · SWIPE_THRESHOLD 45 ·
 *   TIME_BEFORE_UNMOUNT 200 · VIEWPORT_OFFSET 24/16 · rear-toast scale 0.95/0.90
 *   Material: inverse-surface chip, accent = icon only, ~48dp single line
 */

// daily.dev maps status tokens onto its food-themed palette:
//   success → avocado · error → ketchup · warning → bun · info → water
// and bumps brightness per theme (.40 light / .60 dark), so inside the inverted
// chip context these stay vibrant and readable on both chip polarities.
type Semantic = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

type SemanticConfig = {
  label: string;
  icon: ComponentType<IconProps> | null;
  iconColor: string;
  timing: string;
  food: string;
};

const SEMANTICS: Record<Semantic, SemanticConfig> = {
  default: {
    label: 'Default',
    icon: null,
    iconColor: 'text-text-primary',
    timing: '4s',
    food: '—',
  },
  success: {
    label: 'Success',
    icon: VIcon,
    iconColor: 'text-status-success',
    timing: '3s',
    food: 'avocado',
  },
  error: {
    label: 'Error',
    icon: AlertIcon,
    iconColor: 'text-status-error',
    timing: 'persist / 8s',
    food: 'ketchup',
  },
  warning: {
    label: 'Warning',
    icon: WarningIcon,
    iconColor: 'text-status-warning',
    timing: '6s',
    food: 'bun',
  },
  info: {
    label: 'Info',
    icon: InfoIcon,
    iconColor: 'text-status-info',
    timing: '4s',
    food: 'water',
  },
  loading: {
    label: 'Loading',
    icon: null,
    iconColor: 'text-text-primary',
    timing: 'until resolved',
    food: '—',
  },
};

// ---------------------------------------------------------------------------
// Static toast replicas. We render look-alikes (not the real portal-driven
// singleton Toast) so many states sit side by side — same approach as the
// Tooltip redesign story.
// ---------------------------------------------------------------------------

type Weight = 'normal' | 'medium' | 'semibold' | 'bold';

// Recommended default is `medium` (500): Sonner ~500, Linear ~510, Geist medium.
// Material 3 uses 400; bold (700) is heavier than any reference platform.
const WEIGHT_CLASS: Record<Weight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

type ToastProps = {
  variant: 'current' | 'v2';
  semantic?: Semantic;
  title: ReactNode;
  action?: string;
  showClose?: boolean;
  weight?: Weight;
};

const StatusIcon = ({ semantic }: { semantic: Semantic }): ReactElement | null => {
  const config = SEMANTICS[semantic];

  if (semantic === 'loading') {
    // Loader defaults to --loader-color #fff (white). Point it at the chip's
    // flipping foreground so the spinner is visible on both chip polarities.
    return (
      <Loader
        className="!h-5 !w-5 shrink-0"
        style={
          { '--loader-color': 'var(--theme-text-primary)' } as CSSProperties
        }
      />
    );
  }
  if (!config.icon) {
    return null;
  }

  const Component = config.icon;
  return (
    <Component
      size={IconSize.XSmall}
      className={classNames('shrink-0', config.iconColor)}
    />
  );
};

// Shared chip building blocks — used by every chip replica below so the shell,
// title, padding and dismiss controls stay in sync.
const CHIP_SURFACE =
  'flex min-h-11 max-w-[22.5rem] items-center gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-default py-2 pl-3 shadow-3';

// The close button's own padding offsets the right edge; without it, bump the
// right padding to match the 12px left (pl-3).
const chipPadding = (showClose: boolean): string =>
  showClose ? 'pr-2' : 'pr-3';

const ChipTitle = ({
  children,
  weight = 'medium',
}: {
  children: ReactNode;
  weight?: Weight;
}): ReactElement => (
  <Typography
    type={TypographyType.Subhead}
    color={TypographyColor.Primary}
    className={classNames('min-w-0 !leading-snug', WEIGHT_CLASS[weight])}
    truncate
  >
    {children}
  </Typography>
);

const CloseButton = (): ReactElement => (
  <Button
    type="button"
    variant={ButtonVariant.Tertiary}
    size={ButtonSize.XSmall}
    icon={<MiniCloseIcon />}
    aria-label="Dismiss"
    className="shrink-0"
  />
);

// Dismiss control with a circular countdown ring (the chosen default timer).
// A real focusable, labelled button — the ring SVG itself is decorative.
const RingClose = ({ style }: { style: CSSProperties }): ReactElement => (
  <button
    type="button"
    aria-label="Dismiss"
    className="relative grid size-7 shrink-0 place-items-center text-text-primary"
  >
    <svg
      viewBox="0 0 36 36"
      className="absolute inset-0 size-full -rotate-90 text-accent-cabbage-default"
      aria-hidden
    >
      <circle
        cx="18"
        cy="18"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        pathLength={100}
        strokeDasharray="100"
        className="dd-anim"
        style={style}
      />
    </svg>
    <MiniCloseIcon />
  </button>
);

// Single animation-shorthand builder shared by every animated chip.
const animStyle = (
  name: string,
  durationMs: number,
  { loop = false }: { loop?: boolean } = {},
): CSSProperties => ({
  animationName: name,
  animationDuration: `${durationMs}ms`,
  animationTimingFunction: 'linear',
  animationIterationCount: loop ? 'infinite' : 1,
  animationFillMode: 'forwards',
});

// CURRENT shipped toast: inverting chip, 14px subhead, rounded-14, p-2, no
// semantic variants, no status icon, external cabbage progress bar.
const CurrentToast = ({ title, action }: ToastProps): ReactElement => (
  <div className="invert">
    <div className="relative flex min-h-11 min-w-[12.5rem] max-w-[80vw] flex-col justify-center rounded-14 bg-background-default p-2 shadow-2">
      <div className="relative ml-2 flex flex-row items-center gap-2">
        <div className="flex-1 text-text-primary typo-subhead">{title}</div>
        {action && (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.XSmall}
          >
            {action}
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<MiniCloseIcon />}
          aria-label="Dismiss"
        />
        <span className="absolute -bottom-2 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-8 bg-accent-cabbage-default" />
      </div>
    </div>
  </div>
);

// PROPOSED v2 — compact inverting chip. Contents render in an inverted theme
// context so monochrome text + vibrant status icon both resolve against the
// chip background. Single line, no accent bar, no progress bar.
const V2Toast = ({
  semantic = 'default',
  title,
  action,
  showClose = true,
  weight = 'medium',
}: ToastProps): ReactElement => (
  <div className="invert w-fit">
    <div className={classNames(CHIP_SURFACE, chipPadding(showClose))}>
      <StatusIcon semantic={semantic} />
      <ChipTitle weight={weight}>{title}</ChipTitle>
      {action && (
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.XSmall}
          className="ml-1 shrink-0"
        >
          {action}
        </Button>
      )}
      {showClose && <CloseButton />}
    </div>
  </div>
);

const Toast = (props: ToastProps): ReactElement =>
  props.variant === 'current' ? (
    <CurrentToast {...props} />
  ) : (
    <V2Toast {...props} />
  );

// ---------------------------------------------------------------------------
// Theme scaffolding (mirrors the Tooltip redesign story).
// ---------------------------------------------------------------------------

type Theme = 'light' | 'dark';

const useAmbientTheme = (): Theme => {
  const read = (): Theme =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('light')
      ? 'light'
      : 'dark';
  // Read the real theme on first render (guarded for SSR) to avoid a one-frame
  // wrong-inversion flash; the observer keeps it in sync afterwards.
  const [theme, setTheme] = useState<Theme>(read);

  useEffect(() => {
    setTheme(read());
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
};

const ThemePanel = ({
  theme,
  ambient,
  children,
}: {
  theme: Theme;
  ambient: Theme;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames('flex-1', theme !== ambient && 'invert')}>
    <div className="flex h-full flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6 text-text-primary">
      <div className="flex items-center gap-2">
        <span className="inline-block size-3 rounded-full border border-border-subtlest-secondary bg-text-primary" />
        <Typography type={TypographyType.Body} bold>
          {theme === 'dark' ? 'Dark theme' : 'Light theme'}
        </Typography>
      </div>
      {children}
    </div>
  </div>
);

const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <Typography type={TypographyType.Title2} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Secondary}>
      {subtitle}
    </Typography>
  </div>
);

// A reusable table that renders current | v2 with a property/reference column.
type TableRow = Record<string, string>;

const ComparisonTable = ({
  columns,
  rows,
  template,
}: {
  columns: string[];
  rows: TableRow[];
  template: string;
}): ReactElement => (
  <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
    <div className="grid bg-background-subtle" style={{ gridTemplateColumns: template }}>
      {columns.map((head) => (
        <div key={head} className="px-4 py-3">
          <Typography type={TypographyType.Footnote} bold>
            {head}
          </Typography>
        </div>
      ))}
    </div>
    {rows.map((row, index) => (
      <div
        key={Object.values(row)[0]}
        className={classNames(
          'grid border-t border-border-subtlest-tertiary',
          index % 2 === 1 && 'bg-surface-float',
        )}
        style={{ gridTemplateColumns: template }}
      >
        {columns.map((col, colIndex) => (
          <div key={col} className="px-4 py-2.5">
            <Typography
              type={TypographyType.Footnote}
              bold={colIndex === 0}
              color={
                colIndex === 0
                  ? TypographyColor.Primary
                  : colIndex === columns.length - 1
                  ? TypographyColor.Quaternary
                  : TypographyColor.Tertiary
              }
            >
              {row[col]}
            </Typography>
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Story 1 — Spec sheet (every property, current vs proposed vs industry)
// ---------------------------------------------------------------------------

const spec: TableRow[] = [
  {
    Property: 'Semantic variants',
    Current: 'None — one neutral style',
    'Proposed v2': 'default · success · error · warning · info · loading',
    'Industry reference': 'Material · Sonner · Carbon',
  },
  {
    Property: 'Status icon',
    Current: 'None',
    'Proposed v2': 'One 20px vibrant status icon (accent-only)',
    'Industry reference': 'Material inverse-surface accent rule',
  },
  {
    Property: 'Icon colour',
    Current: 'n/a',
    'Proposed v2': 'Brand food tokens via inverted context',
    'Industry reference': 'Sonner dark: ~65–81% lightness',
  },
  {
    Property: 'Title weight',
    Current: '14px · 400 regular',
    'Proposed v2': '14px · 500 medium, single line',
    'Industry reference': 'Sonner/Linear ~500 · Material 400 · not 700',
  },
  {
    Property: 'Description',
    Current: 'Not supported',
    'Proposed v2': 'Omitted — compact chips are one line',
    'Industry reference': 'Sonner/Geist compact = no desc',
  },
  {
    Property: 'Padding',
    Current: '8px · p-2',
    'Proposed v2': '8 × 12px · py-2 px-3 (compact)',
    'Industry reference': 'tighter than Sonner 16 for a chip',
  },
  {
    Property: 'Height',
    Current: '~44px',
    'Proposed v2': '44px single line (min-h-11)',
    'Industry reference': 'Material 48dp',
  },
  {
    Property: 'Corner radius',
    Current: '14px · rounded-14',
    'Proposed v2': '12px · rounded-12',
    'Industry reference': 'Sonner 8 · Material 4',
  },
  {
    Property: 'Left accent bar',
    Current: 'None',
    'Proposed v2': 'None (removed)',
    'Industry reference': 'Sonner/Linear: none',
  },
  {
    Property: 'Progress bar',
    Current: 'Cabbage bar (external, -bottom-2)',
    'Proposed v2': 'Removed — reads dated, fights layout',
    'Industry reference': 'Sonner/Linear: none',
  },
  {
    Property: 'Border',
    Current: 'Colour set, no width (invisible)',
    'Proposed v2': '1px hairline (separates on dark)',
    'Industry reference': 'Sonner dark: 1px',
  },
  {
    Property: 'Shadow',
    Current: 'shadow-2',
    'Proposed v2': 'shadow-3 (more lift)',
    'Industry reference': 'all use a soft shadow',
  },
  {
    Property: 'Background',
    Current: 'Inverts theme (signature)',
    'Proposed v2': 'Inverts theme (kept) — contents inverted',
    'Industry reference': 'Material inverse-surface',
  },
  {
    Property: 'Width',
    Current: 'min 200px · max 80vw',
    'Proposed v2': 'Hug content · max 360px',
    'Industry reference': 'Sonner 356px',
  },
  {
    Property: 'Position',
    Current: 'Top-center',
    'Proposed v2': 'Top-center (kept) · 24px offset',
    'Industry reference': 'top-center = action ack',
  },
  {
    Property: 'Stacking',
    Current: 'One at a time (replaces)',
    'Proposed v2': 'Max 3, collapsed, expand on hover',
    'Industry reference': 'Sonner 3 · scale .95/.90 · 14px gap',
  },
  {
    Property: 'Auto-dismiss',
    Current: 'Flat 5s',
    'Proposed v2': 'Per variant: 3 / 4 / 6 / 8s · loading ∞',
    'Industry reference': 'Sonner 4s · errors persist',
  },
  {
    Property: 'Pause on hover',
    Current: 'No',
    'Proposed v2': 'Yes (+ pause on tab-blur)',
    'Industry reference': 'Sonner pauses both',
  },
  {
    Property: 'Motion',
    Current: '140ms slide from top',
    'Proposed v2': '350ms slide+fade in · 200ms out',
    'Industry reference': 'Sonner 400ms · unmount 200ms',
  },
  {
    Property: 'Dismiss',
    Current: 'Close button only',
    'Proposed v2': 'Close + swipe-up + Esc',
    'Industry reference': 'Sonner swipe 45px · Primer Esc',
  },
  {
    Property: 'Accessibility',
    Current: 'Always role="alert"',
    'Proposed v2': 'role=status/polite · alert for errors',
    'Industry reference': 'Radix live-region split',
  },
];

const PreviewPair = ({ ambient }: { ambient: Theme }): ReactElement => (
  <div className="flex flex-col gap-4 laptop:flex-row">
    {(['light', 'dark'] as Theme[]).map((theme) => (
      <div
        key={theme}
        className={classNames('flex-1', theme !== ambient && 'invert')}
      >
        <div className="flex flex-col gap-5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-6 text-text-primary">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            {theme === 'dark' ? 'Dark page' : 'Light page'}
          </Typography>
          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
            >
              Current
            </Typography>
            <Toast variant="current" title="Link copied to clipboard" />
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
            >
              Proposed v2 · success
            </Typography>
            <Toast
              variant="v2"
              semantic="success"
              title="Link copied to clipboard"
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SpecSheet = (): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[68rem] flex-col gap-8">
      <SectionTitle
        title="Toast spec — current vs proposed"
        subtitle="A compact, top-center inverting chip that keeps daily.dev's signature look but fixes contrast, adds real semantic variants, and adopts the behaviour playbook of Sonner (Vercel, Cursor), Linear and Material 3. No accent bar, no progress bar — one line, one vibrant status icon."
      />
      <PreviewPair ambient={ambient} />
      <ComparisonTable
        columns={['Property', 'Current', 'Proposed v2', 'Industry reference']}
        rows={spec}
        template="1.1fr 1.3fr 1.7fr 1.5fr"
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 2 — Semantic variants (the headline gap) + colour fix
// ---------------------------------------------------------------------------

const SEMANTIC_ORDER: Semantic[] = [
  'default',
  'success',
  'error',
  'warning',
  'info',
  'loading',
];

const semanticTitle: Record<Semantic, string> = {
  default: 'Settings saved',
  success: 'Post bookmarked',
  error: 'Couldn’t publish your post',
  warning: 'Your streak is about to expire',
  info: 'New version available',
  loading: 'Publishing your post…',
};

const VariantList = (): ReactElement => (
  <div className="flex flex-col gap-4">
    {SEMANTIC_ORDER.map((semantic) => (
      <div key={semantic} className="flex flex-col gap-1.5">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {SEMANTICS[semantic].label}
          {SEMANTICS[semantic].food !== '—' &&
            ` · ${SEMANTICS[semantic].food}`}{' '}
          · auto-dismiss {SEMANTICS[semantic].timing}
        </Typography>
        <Toast
          variant="v2"
          semantic={semantic}
          title={semanticTitle[semantic]}
          showClose={semantic === 'error'}
        />
      </div>
    ))}
  </div>
);

const SemanticVariants = (): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[64rem] flex-col gap-8">
      <SectionTitle
        title="Semantic variants — the missing layer"
        subtitle="The current toast has one neutral style, so success, errors and warnings look identical. v2 adds six variants, each with a single vibrant status icon mapped to daily.dev's food palette (avocado / ketchup / bun / water). Because the chip inverts per theme, the icon colours render against the chip — readable on both a dark chip (light page) and a light chip (dark page)."
      />
      <ThemePanel theme="light" ambient={ambient}>
        <VariantList />
      </ThemePanel>
      <ThemePanel theme="dark" ambient={ambient}>
        <VariantList />
      </ThemePanel>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 3 — Content states (current vs v2, both themes)
// ---------------------------------------------------------------------------

type UseCase = {
  label: string;
  description: string;
  render: (variant: 'current' | 'v2') => ReactNode;
};

const useCases: UseCase[] = [
  {
    label: 'Message only',
    description: 'The most common case — one short confirmation.',
    render: (variant) => (
      <Toast variant={variant} semantic="success" title="Post bookmarked" />
    ),
  },
  {
    label: 'With action',
    description: 'A single inline action, e.g. Undo.',
    render: (variant) => (
      <Toast
        variant={variant}
        semantic="default"
        title="Post removed"
        action="Undo"
      />
    ),
  },
  {
    label: 'Error',
    description: 'Persists; always manually dismissible.',
    render: (variant) => (
      <Toast
        variant={variant}
        semantic="error"
        title="Couldn’t save your changes"
        action="Retry"
      />
    ),
  },
  {
    label: 'Loading → resolves in place',
    description: 'Spinner morphs to a check on the same toast.',
    render: (variant) => (
      <Toast variant={variant} semantic="loading" title="Publishing…" />
    ),
  },
  {
    label: 'Long message',
    description: 'Truncates inside the 360px max width.',
    render: (variant) => (
      <Toast
        variant={variant}
        semantic="info"
        title="A new version of daily.dev is available — refresh to update"
      />
    ),
  },
];

const Matrix = (): ReactElement => {
  const variants: ('current' | 'v2')[] = ['current', 'v2'];
  const labels: Record<'current' | 'v2', { title: string; subtitle: string }> =
    {
      current: { title: 'Current', subtitle: 'Neutral · no icon' },
      v2: { title: 'Proposed v2', subtitle: 'Compact chip + status icon' },
    };

  return (
    <div
      className="grid items-center gap-x-6 gap-y-8"
      style={{ gridTemplateColumns: '200px minmax(20rem, 1fr) minmax(20rem, 1fr)' }}
    >
      <div />
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-0.5">
          <Typography type={TypographyType.Callout} bold>
            {labels[variant].title}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {labels[variant].subtitle}
          </Typography>
        </div>
      ))}

      {useCases.map((useCase) => (
        <React.Fragment key={useCase.label}>
          <div className="flex flex-col gap-0.5 pr-2">
            <Typography type={TypographyType.Subhead} bold>
              {useCase.label}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {useCase.description}
            </Typography>
          </div>
          {variants.map((variant) => (
            <div key={variant} className="flex items-start">
              {useCase.render(variant)}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

const ContentStates = (): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[72rem] flex-col gap-8">
      <SectionTitle
        title="Content states & variations"
        subtitle="Every content shape — message only, with action, error, loading and long-truncating — current vs proposed v2, in both themes regardless of the Storybook toolbar."
      />
      <ThemePanel theme="light" ambient={ambient}>
        <Matrix />
      </ThemePanel>
      <ThemePanel theme="dark" ambient={ambient}>
        <Matrix />
      </ThemePanel>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 4 — Anatomy & spacing
// ---------------------------------------------------------------------------

const platformSpacing: TableRow[] = [
  {
    Platform: 'daily.dev v2 (proposed)',
    Width: 'hug · ≤360px',
    Padding: '8 × 12px',
    Radius: '12px',
  },
  {
    Platform: 'daily.dev (current)',
    Width: '200–80vw',
    Padding: '8px',
    Radius: '14px',
  },
  {
    Platform: 'Sonner (Vercel, Cursor)',
    Width: '356px',
    Padding: '16px',
    Radius: '8px',
  },
  { Platform: 'Material 3', Width: 'min 344dp', Padding: '16dp', Radius: '4dp' },
  { Platform: 'Linear / Raycast', Width: 'hug', Padding: '~10–12px', Radius: '8px' },
];

const Anatomy = (): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[64rem] flex-col gap-10">
      <SectionTitle
        title="Anatomy & spacing"
        subtitle="The proposed chip's structure: a status icon, a single bold line, an optional action and a dismiss — all on one row. No accent bar, no progress bar."
      />

      <ThemePanel theme={ambient} ambient={ambient}>
        <div className="flex flex-wrap items-center gap-x-14 gap-y-6">
          <Toast
            variant="v2"
            semantic="success"
            title="Post bookmarked"
            action="Undo"
          />
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            {[
              ['Width', 'Hug content · max 360px'],
              ['Height', '44px (min-h-11)'],
              ['Vertical padding', '8px (py-2)'],
              ['Left / right padding', '12px / 8px'],
              ['Gap (icon → text → action)', '10px (gap-2.5)'],
              ['Status icon', '20px (Size.XSmall)'],
              ['Title', '14px bold · single line'],
              ['Corner radius', '12px (rounded-12)'],
              ['Border', '1px hairline'],
              ['Shadow', 'shadow-3'],
            ].map(([k, v]) => (
              <React.Fragment key={k}>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {k}
                </Typography>
                <Typography type={TypographyType.Footnote} bold>
                  {v}
                </Typography>
              </React.Fragment>
            ))}
          </div>
        </div>
      </ThemePanel>

      <ComparisonTable
        columns={['Platform', 'Width', 'Padding', 'Radius']}
        rows={platformSpacing}
        template="1.6fr 1fr 1fr 1fr"
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 5 — Behaviour: position, stacking, motion & timing
// ---------------------------------------------------------------------------

// Top-center stack: front toast on top, rear ones peek BELOW, scaled + dimmed
// (collapsed). On hover they would expand downward to full height.
const StackMock = (): ReactElement => (
  <div className="relative flex h-40 w-full justify-center">
    {[2, 1, 0].map((depth) => (
      <div
        key={depth}
        className="absolute top-0"
        style={{
          transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.05})`,
          opacity: depth === 0 ? 1 : 0.55 - depth * 0.12,
          zIndex: 10 - depth,
        }}
      >
        <Toast
          variant="v2"
          semantic={depth === 0 ? 'success' : 'default'}
          title={depth === 0 ? 'Post bookmarked' : `Earlier toast ${depth}`}
          showClose={false}
        />
      </div>
    ))}
  </div>
);

const motionRows: TableRow[] = [
  {
    Stage: 'Enter',
    Behaviour: 'translateY(−12px → 0) + fade in',
    Spec: '350ms ease-out',
  },
  {
    Stage: 'Exit',
    Behaviour: 'reverse + fade, then unmount',
    Spec: '200ms + 200ms unmount',
  },
  {
    Stage: 'Stack',
    Behaviour: 'max 3 visible, rear scaled, expand on hover',
    Spec: 'scale .95 / .90 · 14px gap',
  },
  {
    Stage: 'Swipe',
    Behaviour: 'swipe up to dismiss (top anchor)',
    Spec: '45px or velocity > 0.11',
  },
  {
    Stage: 'In-place update',
    Behaviour: 'loading morphs to success on same toast',
    Spec: 'same id, no remount',
  },
  {
    Stage: 'Reduced motion',
    Behaviour: 'drop transforms, opacity-only fade',
    Spec: 'prefers-reduced-motion',
  },
];

const timingRows: TableRow[] = [
  {
    Variant: 'Success / Info',
    'Auto-dismiss': '3–4s',
    Rationale: 'Low-stakes confirmation — short, Sonner-like.',
  },
  {
    Variant: 'Default',
    'Auto-dismiss': '4s',
    Rationale: 'Neutral system messages.',
  },
  {
    Variant: 'Warning',
    'Auto-dismiss': '6s',
    Rationale: 'Needs a beat longer to register.',
  },
  {
    Variant: 'Error',
    'Auto-dismiss': 'persist / 8s',
    Rationale: 'Give time to read; recoverable errors shouldn’t vanish.',
  },
  {
    Variant: 'With action',
    'Auto-dismiss': 'persist',
    Rationale: 'Undo / Retry must stay until acted on or dismissed.',
  },
  {
    Variant: 'Loading',
    'Auto-dismiss': 'until resolved',
    Rationale: 'Promise toast — swaps to success/error on settle.',
  },
];

const Behaviour = (): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[64rem] flex-col gap-10">
      <SectionTitle
        title="Behaviour — position, stacking, motion & timing"
        subtitle="Top-center is deliberate: it acknowledges an action the user just took, landing where their attention already is without covering the content below. Today a new toast replaces the current one; v2 keeps up to three in a collapsed stack that expands downward on hover (Sonner)."
      />

      <div className="flex flex-col gap-4 laptop:flex-row">
        <ThemePanel theme="light" ambient={ambient}>
          <Typography type={TypographyType.Footnote} bold>
            Collapsed top-center stack (max 3)
          </Typography>
          <StackMock />
        </ThemePanel>
        <ThemePanel theme="dark" ambient={ambient}>
          <Typography type={TypographyType.Footnote} bold>
            Collapsed top-center stack (max 3)
          </Typography>
          <StackMock />
        </ThemePanel>
      </div>

      <div className="flex flex-col gap-3">
        <Typography type={TypographyType.Title3} bold>
          Motion
        </Typography>
        <ComparisonTable
          columns={['Stage', 'Behaviour', 'Spec']}
          rows={motionRows}
          template="1fr 2fr 1.4fr"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Typography type={TypographyType.Title3} bold>
          Auto-dismiss timing
        </Typography>
        <ComparisonTable
          columns={['Variant', 'Auto-dismiss', 'Rationale']}
          rows={timingRows}
          template="1fr 1fr 2.4fr"
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 6 — Guidelines
// ---------------------------------------------------------------------------

const guidelines: { title: string; body: string }[] = [
  {
    title: 'Keep the inverting chip — fix the contents',
    body: 'The chip background inverts per theme (dark on a light page, light on a dark page) — that’s daily.dev’s signature and it pops. The bug was colouring icons against the page instead of the chip. Render the chip’s contents in an inverted theme context so text stays monochrome-readable and status icons stay vibrant on both polarities.',
  },
  {
    title: 'One vibrant status icon, monochrome text',
    body: 'Follow Material’s inverse-surface rule: the only colour is a single leading status icon, mapped to the food palette — avocado (success), ketchup (error), bun (warning), water (info). Text stays high-contrast neutral. Don’t tint the whole chip per status.',
  },
  {
    title: 'Compact, single-line, medium weight',
    body: 'One 14px line at 500 (medium) — not bold. Sonner and Linear sit at ~500, Geist medium, Material 3 at 400; 700 reads heavier than any reference. ~44px tall, py-2 px-3, no description — compact confirmations are one line (“Link copied”, “Bookmarked”). Use 600 (semibold) only if a toast ever pairs a title with a description, to create hierarchy.',
  },
  {
    title: 'Drop the accent bar and the progress bar',
    body: 'No left accent bar (Sonner/Linear don’t use one) and no countdown bar — a shrinking progress bar reads dated, adds noise and pushes the layout. Pair pause-on-hover with sensible durations instead.',
  },
  {
    title: 'Top-center, because it acknowledges an action',
    body: 'Keep top-center: it confirms something the user just did, landing near their gaze without covering content below. (Bottom-right is for passive, background events — not our case.) 24px offset, slide down on enter.',
  },
  {
    title: 'Time by severity, pause on hover',
    body: 'Success/info 3–4s, warning 6s, errors persist or 8s, loading until the promise resolves, anything with an action persists. Pause the timer on hover and when the tab is hidden so users can finish reading.',
  },
  {
    title: 'Stack, don’t replace',
    body: 'Fire several actions quickly today and each toast wipes the last. Keep up to three in a collapsed stack with a 14px gap and rear toasts scaled to .95/.90; expand downward on hover. Update loading → success in place on the same toast.',
  },
  {
    title: 'Accessible & motion-safe',
    body: 'role="status" / aria-live="polite" for confirmations, role="alert" / assertive for errors (today everything is assertive). Mount the live region up-front, keep the dismiss control a sibling of the message, support Esc and swipe-up, and fall back to an opacity-only fade under prefers-reduced-motion.',
  },
];

const Guidelines = (): ReactElement => (
  <div className="flex w-full max-w-[64rem] flex-col gap-6">
    <Typography type={TypographyType.Title2} bold>
      Proposed guidelines
    </Typography>
    <div className="grid gap-4 tablet:grid-cols-2">
      {guidelines.map((item) => (
        <div
          key={item.title}
          className="flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4"
        >
          <Typography type={TypographyType.Body} bold>
            {item.title}
          </Typography>
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Secondary}
          >
            {item.body}
          </Typography>
        </div>
      ))}
    </div>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Quaternary}>
      References: Sonner (src constants — 356px, 4000ms, 3-toast stack, 14px gap,
      rear scale .95/.90, swipe 45px, 200ms unmount, pause-on-hover/tab-blur),
      Material 3 Snackbar (inverse-surface, accent = icon only), Vercel Geist,
      Linear, Raycast, Radix Toast (role=status, foreground/background live
      region) and GitHub Primer’s accessibility guidance on toasts.
    </Typography>
  </div>
);

// ---------------------------------------------------------------------------
// Story 7 — Font weight review
// ---------------------------------------------------------------------------

const WEIGHTS: { weight: Weight; label: string; note: string }[] = [
  { weight: 'normal', label: '400 · Regular', note: 'Material 3 snackbar' },
  {
    weight: 'medium',
    label: '500 · Medium',
    note: 'Sonner · Linear · Geist — recommended',
  },
  {
    weight: 'semibold',
    label: '600 · Semibold',
    note: 'only when paired with a description',
  },
  { weight: 'bold', label: '700 · Bold', note: 'heavier than any reference' },
];

const WeightList = (): ReactElement => (
  <div className="flex flex-col gap-4">
    {WEIGHTS.map(({ weight, label, note }) => (
      <div key={weight} className="flex flex-col gap-1.5">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {label} · {note}
        </Typography>
        <Toast
          variant="v2"
          semantic="success"
          title="Link copied to clipboard"
          weight={weight}
        />
      </div>
    ))}
  </div>
);

const FontWeight = (): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[60rem] flex-col gap-8">
      <SectionTitle
        title="Font weight — which to use"
        subtitle="The recommendation is 500 (medium). For a single-line confirmation, 400 reads a touch weak on the chip while 700 (bold) is heavier than any reference product — Sonner and Linear sit at ~500, Geist medium, Material 3 at 400. 600 (semibold) is reserved for the rare case where a toast pairs a title with a description and needs hierarchy. Compare them in both themes below."
      />
      <ThemePanel theme="light" ambient={ambient}>
        <WeightList />
      </ThemePanel>
      <ThemePanel theme="dark" ambient={ambient}>
        <WeightList />
      </ThemePanel>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 8 — Interactive playground (Storybook controls)
// ---------------------------------------------------------------------------

type PlaygroundArgs = {
  semantic: Semantic;
  title: string;
  action: string;
  showClose: boolean;
  weight: Weight;
};

// The canonical default behaviour, composed from the chosen options:
//   enter/exit = slide + fade + scale · timer = ring around dismiss (6s) ·
//   weight = medium. Loops enter → 6s hold → exit so it previews live.
const PLAYGROUND_TOTAL = 7000;
// Single injected stylesheet for every animated story. `pathLength="100"` lets
// the ring/fuse animate stroke-dashoffset 0→100 regardless of geometry; the
// timing-function set inside a keyframe governs the interval that FOLLOWS it
// (so enter eases out, exit eases in). `.dd-pause:hover` freezes descendants.
const MOTION_CSS = `
/* Timer drains */
@keyframes ddDrainWidth { from { width: 100%; } to { width: 0%; } }
@keyframes ddDrainScaleX { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@keyframes ddRing { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 100; } }
@keyframes ddDim { 0%, 55% { opacity: 1; } 80% { opacity: 0.4; } 100% { opacity: 1; } }
@keyframes ddExit { 0%, 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-16px); } }
/* Enter/exit transitions */
@keyframes ddTrCurrent {
  0% { transform: translateY(-72px); animation-timing-function: ease-in-out; }
  7% { transform: translateY(0); }
  72% { transform: translateY(0); animation-timing-function: ease-in-out; }
  79% { transform: translateY(-72px); }
  100% { transform: translateY(-72px); }
}
@keyframes ddTrSlideFade {
  0% { opacity: 0; transform: translateY(-16px); animation-timing-function: cubic-bezier(0,0,0.2,1); }
  9% { opacity: 1; transform: translateY(0); }
  72% { opacity: 1; transform: translateY(0); animation-timing-function: cubic-bezier(0.4,0,1,1); }
  80% { opacity: 0; transform: translateY(-12px); }
  100% { opacity: 0; transform: translateY(-16px); }
}
@keyframes ddTrScaleFade {
  0% { opacity: 0; transform: scale(0.9); animation-timing-function: cubic-bezier(0,0,0.2,1); }
  9% { opacity: 1; transform: scale(1); }
  72% { opacity: 1; transform: scale(1); animation-timing-function: cubic-bezier(0.4,0,1,1); }
  80% { opacity: 0; transform: scale(0.96); }
  100% { opacity: 0; transform: scale(0.9); }
}
@keyframes ddTrSpring {
  0% { opacity: 0; transform: translateY(-22px); animation-timing-function: cubic-bezier(0.34,1.56,0.64,1); }
  14% { opacity: 1; transform: translateY(0); }
  72% { opacity: 1; transform: translateY(0); animation-timing-function: cubic-bezier(0.4,0,1,1); }
  80% { opacity: 0; transform: translateY(-12px); }
  100% { opacity: 0; transform: translateY(-22px); }
}
@keyframes ddTrCombo {
  0% { opacity: 0; transform: translateY(-14px) scale(0.96); animation-timing-function: cubic-bezier(0.21,1.02,0.73,1); }
  10% { opacity: 1; transform: translateY(0) scale(1); }
  72% { opacity: 1; transform: translateY(0) scale(1); animation-timing-function: cubic-bezier(0.4,0,1,1); }
  80% { opacity: 0; transform: translateY(-10px) scale(0.98); }
  100% { opacity: 0; transform: translateY(-14px) scale(0.96); }
}
/* Playground default lifecycle (enter → 6s hold → exit), ring drain synced to it */
@keyframes ddDefaultLoop {
  0% { opacity: 0; transform: translateY(-14px) scale(0.96); animation-timing-function: cubic-bezier(0.21,1.02,0.73,1); }
  4.3% { opacity: 1; transform: translateY(0) scale(1); }
  90% { opacity: 1; transform: translateY(0) scale(1); animation-timing-function: cubic-bezier(0.4,0,1,1); }
  96% { opacity: 0; transform: translateY(-10px) scale(0.98); }
  100% { opacity: 0; transform: translateY(-10px) scale(0.96); }
}
@keyframes ddRingLoop {
  0% { stroke-dashoffset: 0; }
  4.3% { stroke-dashoffset: 0; }
  90% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 100; }
}
/* Shared: pause on hover, respect reduced motion */
.dd-pause:hover .dd-anim { animation-play-state: paused !important; }
@media (prefers-reduced-motion: reduce) { .dd-anim { animation: none !important; } }
`;

const MotionStyles = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
);

const PlaygroundToast = ({
  args,
  runId,
}: {
  args: PlaygroundArgs;
  runId: number;
}): ReactElement => (
  <div className="dd-pause invert flex min-h-28 items-center">
    <div
      key={`${runId}-${args.semantic}-${args.showClose}-${args.action}-${args.weight}-${args.title}`}
      className={classNames(
        'dd-anim',
        CHIP_SURFACE,
        chipPadding(args.showClose),
      )}
      style={animStyle('ddDefaultLoop', PLAYGROUND_TOTAL, { loop: true })}
    >
      <StatusIcon semantic={args.semantic} />
      <ChipTitle weight={args.weight}>{args.title}</ChipTitle>
      {args.action && (
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.XSmall}
          className="ml-1 shrink-0"
        >
          {args.action}
        </Button>
      )}
      {args.showClose && (
        <RingClose
          style={animStyle('ddRingLoop', PLAYGROUND_TOTAL, { loop: true })}
        />
      )}
    </div>
  </div>
);

const PlaygroundView = (args: PlaygroundArgs): ReactElement => {
  const ambient = useAmbientTheme();
  const [runId, setRunId] = useState(0);

  return (
    <div className="flex w-full max-w-[60rem] flex-col gap-8">
      <MotionStyles />
      <SectionTitle
        title="Playground — the default toast, live"
        subtitle="Composed from the chosen defaults: slide + fade + scale enter/exit, ring-around-dismiss 6s timer, and 500 (medium) weight. Use the Controls panel below the canvas to change the variant, message, action and dismiss; it renders in both themes and loops so you can watch the full behaviour. Hover the toast to pause it."
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.XSmall}
          onClick={() => setRunId((id) => id + 1)}
        >
          Replay
        </Button>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Tip: hover the toast to freeze the frame
        </Typography>
      </div>
      <div className="flex flex-col gap-4 laptop:flex-row">
        {(['light', 'dark'] as Theme[]).map((theme) => (
          <ThemePanel key={theme} theme={theme} ambient={ambient}>
            <PlaygroundToast args={args} runId={runId} />
          </ThemePanel>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 9 — Auto-dismiss timer (animated, the cabbage-line reimagined)
// ---------------------------------------------------------------------------

type TimerKind =
  | 'bottomLine'
  | 'bottomCenter'
  | 'ring'
  | 'fuse'
  | 'bgDrain'
  | 'dimLift';

type TimerChipProps = {
  kind: TimerKind;
  durationMs: number;
  runId: number;
  loop?: boolean;
  withExit?: boolean;
  title?: string;
  semantic?: Semantic;
};

const TimerChip = ({
  kind,
  durationMs,
  runId,
  loop = true,
  withExit = false,
  title = 'Link copied to clipboard',
  semantic = 'success',
}: TimerChipProps): ReactElement => {
  const timerAnim = (name: string): CSSProperties =>
    animStyle(name, durationMs, { loop });

  const showRingClose = kind === 'ring';

  return (
    // key forces remount on replay / duration change so the animation restarts.
    <div
      key={`${kind}-${runId}-${durationMs}`}
      className="dd-pause invert relative w-fit"
    >
      <div
        className={classNames('dd-anim relative overflow-hidden', CHIP_SURFACE, 'pr-2')}
        style={
          withExit
            ? {
                animationName: 'ddExit',
                animationDuration: `${durationMs + 350}ms`,
                animationTimingFunction: 'ease-in',
                animationIterationCount: 1,
                animationFillMode: 'forwards',
              }
            : kind === 'dimLift'
            ? timerAnim('ddDim')
            : undefined
        }
      >
        {kind === 'bgDrain' && (
          <span
            className="dd-anim absolute inset-0 origin-left bg-accent-cabbage-flat"
            style={timerAnim('ddDrainScaleX')}
          />
        )}

        <span className="relative z-10 flex min-w-0 items-center gap-2.5">
          <StatusIcon semantic={semantic} />
          <ChipTitle>{title}</ChipTitle>
          {showRingClose ? (
            <RingClose style={timerAnim('ddRing')} />
          ) : (
            <CloseButton />
          )}
        </span>

        {kind === 'bottomLine' && (
          <span
            className="dd-anim absolute bottom-0 left-0 z-20 h-0.5 w-full bg-accent-cabbage-default"
            style={timerAnim('ddDrainWidth')}
          />
        )}
        {kind === 'bottomCenter' && (
          <span
            className="dd-anim absolute bottom-0 left-0 z-20 h-0.5 w-full origin-center bg-accent-cabbage-default"
            style={timerAnim('ddDrainScaleX')}
          />
        )}
      </div>

      {kind === 'fuse' && (
        <svg
          className="pointer-events-none absolute inset-0 size-full overflow-visible text-accent-cabbage-default"
          aria-hidden
        >
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            pathLength={100}
            strokeDasharray="100"
            className="dd-anim"
            style={timerAnim('ddRing')}
          />
        </svg>
      )}
    </div>
  );
};

const TIMER_OPTIONS: {
  kind: TimerKind;
  label: string;
  description: string;
  recommend?: 'primary' | 'alt';
}[] = [
  {
    kind: 'ring',
    label: 'Ring around dismiss',
    description:
      'The chosen default (6s): a circular countdown wrapping the × button — combines the dismiss affordance and the timer in one control. Compact and modern (story-style).',
    recommend: 'primary',
  },
  {
    kind: 'bottomLine',
    label: 'Inset bottom line (drain →)',
    description:
      'Your current cabbage line, refined: moved inside the chip at the bottom edge, full width, draining left-to-right. Familiar, lowest-risk.',
    recommend: 'alt',
  },
  {
    kind: 'bottomCenter',
    label: 'Bottom line (center-out)',
    description:
      'Same bottom line but depleting symmetrically from the center — a softer, more playful read of the same idea.',
  },
  {
    kind: 'fuse',
    label: 'Border fuse',
    description:
      'The chip’s border itself burns down around the perimeter. The most expressive option — great for a brand moment, busier visually.',
  },
  {
    kind: 'bgDrain',
    label: 'Background drain',
    description:
      'A faint cabbage tint recedes across the chip. Ambient and chrome-free — no extra line, but the subtlest signal.',
  },
  {
    kind: 'dimLift',
    label: 'Dim & lift (no bar)',
    description:
      'No indicator at all — the chip simply fades as its time runs out, then slides away. The Sonner/Linear minimalist stance, shown for contrast.',
  },
];

const RecommendBadge = ({ kind }: { kind: 'primary' | 'alt' }): ReactElement => (
  <span
    className={classNames(
      'rounded-6 px-1.5 py-0.5 typo-caption2 font-bold',
      kind === 'primary'
        ? 'bg-accent-avocado-flat text-accent-avocado-default'
        : 'bg-accent-cabbage-flat text-accent-cabbage-default',
    )}
  >
    {kind === 'primary' ? 'Default ✓' : 'Alternative'}
  </span>
);

const TimerGallery = ({
  durationMs,
  runId,
}: {
  durationMs: number;
  runId: number;
}): ReactElement => (
  <div className="grid gap-x-8 gap-y-7 tablet:grid-cols-2">
    {TIMER_OPTIONS.map((opt) => (
      <div key={opt.kind} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Typography
            type={TypographyType.Subhead}
            bold
            color={TypographyColor.Primary}
          >
            {opt.label}
          </Typography>
          {opt.recommend && <RecommendBadge kind={opt.recommend} />}
        </div>
        <TimerChip kind={opt.kind} durationMs={durationMs} runId={runId} />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {opt.description}
        </Typography>
      </div>
    ))}
  </div>
);

const DURATIONS = [3000, 4000, 6000];

const AutoDismissTimer = (): ReactElement => {
  const ambient = useAmbientTheme();
  const [durationMs, setDurationMs] = useState(6000);
  const [runId, setRunId] = useState(0);

  return (
    <div className="flex w-full max-w-[68rem] flex-col gap-8">
      <MotionStyles />
      <SectionTitle
        title="Auto-dismiss timer — the cabbage line, reimagined"
        subtitle="Bringing back the countdown indicator the old toast had, but with options. Every treatment loops below so you can compare the feel; hover any toast to pause it (the real component pauses on hover too). The full enter-wait-exit behaviour is at the bottom."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Typography
          type={TypographyType.Footnote}
          bold
          color={TypographyColor.Primary}
        >
          Duration
        </Typography>
        {DURATIONS.map((d) => (
          <Button
            key={d}
            type="button"
            variant={
              d === durationMs ? ButtonVariant.Primary : ButtonVariant.Float
            }
            size={ButtonSize.XSmall}
            onClick={() => setDurationMs(d)}
          >
            {d / 1000}s
          </Button>
        ))}
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.XSmall}
          className="ml-2"
          onClick={() => setRunId((id) => id + 1)}
        >
          Replay
        </Button>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Tip: hover a toast to pause its timer
        </Typography>
      </div>

      <ThemePanel theme="light" ambient={ambient}>
        <TimerGallery durationMs={durationMs} runId={runId} />
      </ThemePanel>
      <ThemePanel theme="dark" ambient={ambient}>
        <TimerGallery durationMs={durationMs} runId={runId} />
      </ThemePanel>

      <div className="flex flex-col gap-3">
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
        >
          Full behaviour — countdown then auto-dismiss
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          The default ring around dismiss, running once: the chip waits out the
          timer while the ring drains, then slides up and fades — exactly what a
          user sees. Hit Replay to run it again; hover to pause.
        </Typography>
        <ThemePanel theme={ambient} ambient={ambient}>
          <TimerChip
            kind="ring"
            durationMs={durationMs}
            runId={runId}
            loop={false}
            withExit
          />
        </ThemePanel>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 10 — Enter / exit transition (animated)
// ---------------------------------------------------------------------------

const TransitionChip = ({
  name,
  cycleMs,
  runId,
}: {
  name: string;
  cycleMs: number;
  runId: number;
}): ReactElement => (
  <div className="dd-pause invert flex h-24 items-center justify-center overflow-hidden rounded-12 bg-surface-float">
    <div
      key={`${name}-${cycleMs}-${runId}`}
      className={classNames('dd-anim', CHIP_SURFACE, 'pr-2')}
      style={animStyle(name, cycleMs, { loop: true })}
    >
      <StatusIcon semantic="success" />
      <ChipTitle>Link copied to clipboard</ChipTitle>
      <CloseButton />
    </div>
  </div>
);

const TRANSITIONS: {
  name: string;
  label: string;
  description: string;
  recommend?: 'primary' | 'alt';
}[] = [
  {
    name: 'ddTrCurrent',
    label: 'Current',
    description:
      '140ms slide from 80px above, ease-in-out, no fade. Snappy but it travels far and pops in/out abruptly without opacity.',
  },
  {
    name: 'ddTrCombo',
    label: 'Slide + fade + scale',
    description:
      'The chosen default: a subtle scale 0.96→1 on top of the slide+fade (Sonner’s easing). The most refined, premium feel.',
    recommend: 'primary',
  },
  {
    name: 'ddTrSlideFade',
    label: 'Slide + fade',
    description:
      'Short 16px slide down with an opacity fade — ease-out in (~300ms), ease-in out (~200ms). Clean, calm, simpler alternative.',
    recommend: 'alt',
  },
  {
    name: 'ddTrScaleFade',
    label: 'Scale + fade (pop)',
    description:
      'Scales up 0.9→1 with a fade, no slide. Reads as a gentle “pop” in place — nice, but less directional for a top anchor.',
  },
  {
    name: 'ddTrSpring',
    label: 'Spring slide (overshoot)',
    description:
      'Slide with a bouncy back-ease that overshoots and settles. Playful and energetic — can feel too lively for frequent toasts.',
  },
];

const TransitionGallery = ({
  cycleMs,
  runId,
}: {
  cycleMs: number;
  runId: number;
}): ReactElement => (
  <div className="grid gap-x-8 gap-y-6 tablet:grid-cols-2">
    {TRANSITIONS.map((t) => (
      <div key={t.name} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Typography
            type={TypographyType.Subhead}
            bold
            color={TypographyColor.Primary}
          >
            {t.label}
          </Typography>
          {t.recommend && <RecommendBadge kind={t.recommend} />}
        </div>
        <TransitionChip name={t.name} cycleMs={cycleMs} runId={runId} />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {t.description}
        </Typography>
      </div>
    ))}
  </div>
);

const transitionSpec: TableRow[] = [
  {
    Property: 'Properties animated',
    Current: 'transform only',
    Recommended: 'transform + opacity',
    Why: 'GPU-composited = smooth; opacity softens the edges',
  },
  {
    Property: 'Travel distance',
    Current: '80px (far)',
    Recommended: '12–16px',
    Why: 'Short travel reads as settling, not flying in',
  },
  {
    Property: 'Enter duration',
    Current: '140ms',
    Recommended: '~300ms',
    Why: 'Enough to perceive motion without lag',
  },
  {
    Property: 'Exit duration',
    Current: '140ms',
    Recommended: '~200ms',
    Why: 'Exit faster than enter — gets out of the way',
  },
  {
    Property: 'Enter easing',
    Current: 'ease-in-out',
    Recommended: 'ease-out · cubic-bezier(0,0,.2,1)',
    Why: 'Decelerate into place feels natural',
  },
  {
    Property: 'Exit easing',
    Current: 'ease-in-out',
    Recommended: 'ease-in · cubic-bezier(.4,0,1,1)',
    Why: 'Accelerate away to feel decisive',
  },
  {
    Property: 'Stack reflow',
    Current: 'n/a (one at a time)',
    Recommended: 'FLIP transform on the survivors',
    Why: 'Remaining toasts glide to their new slot',
  },
  {
    Property: 'Reduced motion',
    Current: 'Still slides',
    Recommended: 'Opacity-only fade',
    Why: 'Respects prefers-reduced-motion',
  },
];

const EnterExitTransition = (): ReactElement => {
  const ambient = useAmbientTheme();
  const [cycleMs, setCycleMs] = useState(3200);
  const [runId, setRunId] = useState(0);

  return (
    <div className="flex w-full max-w-[68rem] flex-col gap-8">
      <MotionStyles />
      <SectionTitle
        title="Enter / exit transition — appear & disappear"
        subtitle="Each toast loops appear → hold → disappear so you can compare the feel. Hover any toast to pause it. Use slow-mo to study the easing. The recommendation: a short slide + fade, optionally with a subtle scale."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Typography
          type={TypographyType.Footnote}
          bold
          color={TypographyColor.Primary}
        >
          Speed
        </Typography>
        {[
          { label: 'Normal', value: 3200 },
          { label: 'Slow-mo', value: 7000 },
        ].map((s) => (
          <Button
            key={s.value}
            type="button"
            variant={
              s.value === cycleMs ? ButtonVariant.Primary : ButtonVariant.Float
            }
            size={ButtonSize.XSmall}
            onClick={() => setCycleMs(s.value)}
          >
            {s.label}
          </Button>
        ))}
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.XSmall}
          className="ml-2"
          onClick={() => setRunId((id) => id + 1)}
        >
          Restart
        </Button>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Tip: hover a toast to freeze the frame
        </Typography>
      </div>

      <ThemePanel theme="light" ambient={ambient}>
        <TransitionGallery cycleMs={cycleMs} runId={runId} />
      </ThemePanel>
      <ThemePanel theme="dark" ambient={ambient}>
        <TransitionGallery cycleMs={cycleMs} runId={runId} />
      </ThemePanel>

      <div className="flex flex-col gap-3">
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
        >
          What makes it smooth
        </Typography>
        <ComparisonTable
          columns={['Property', 'Current', 'Recommended', 'Why']}
          rows={transitionSpec}
          template="1.2fr 1fr 1.5fr 1.8fr"
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

const queryClient = new QueryClient();

const meta: Meta = {
  title: 'Components/Toast/Redesign Comparison',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex min-h-screen justify-center bg-background-default p-8 text-text-primary">
    {children}
  </div>
);

export const SpecSheetStory: Story = {
  name: 'Spec sheet',
  render: () => (
    <Page>
      <SpecSheet />
    </Page>
  ),
};

export const SemanticVariantsStory: Story = {
  name: 'Semantic variants',
  render: () => (
    <Page>
      <SemanticVariants />
    </Page>
  ),
};

export const ContentStatesStory: Story = {
  name: 'Content states',
  render: () => (
    <Page>
      <ContentStates />
    </Page>
  ),
};

export const AnatomyStory: Story = {
  name: 'Anatomy & spacing',
  render: () => (
    <Page>
      <Anatomy />
    </Page>
  ),
};

export const BehaviourStory: Story = {
  name: 'Behaviour',
  render: () => (
    <Page>
      <Behaviour />
    </Page>
  ),
};

export const FontWeightStory: Story = {
  name: 'Font weight',
  render: () => (
    <Page>
      <FontWeight />
    </Page>
  ),
};

export const AutoDismissTimerStory: Story = {
  name: 'Auto-dismiss timer',
  render: () => (
    <Page>
      <AutoDismissTimer />
    </Page>
  ),
};

export const EnterExitTransitionStory: Story = {
  name: 'Enter / exit transition',
  render: () => (
    <Page>
      <EnterExitTransition />
    </Page>
  ),
};

export const ProposedGuidelines: Story = {
  name: 'Guidelines',
  render: () => (
    <Page>
      <Guidelines />
    </Page>
  ),
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: 'Playground',
  parameters: { controls: { disable: false } },
  args: {
    semantic: 'success',
    title: 'Link copied to clipboard',
    action: '',
    showClose: true,
    weight: 'medium',
  },
  argTypes: {
    semantic: {
      control: 'select',
      options: SEMANTIC_ORDER,
      description: 'Semantic variant (icon + colour + timing)',
    },
    title: { control: 'text', description: 'Toast message' },
    action: {
      control: 'text',
      description: 'Action button label — leave empty for none',
    },
    showClose: { control: 'boolean', description: 'Show the dismiss button' },
    weight: {
      control: 'inline-radio',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Title font weight (recommended: medium)',
    },
  },
  render: (args) => (
    <Page>
      <PlaygroundView {...args} />
    </Page>
  ),
};
