import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
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
  InfoIcon,
  BookmarkIcon,
  LinkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

/**
 * Design-review playground (not shipping UI). Compares the CURRENT tooltip with
 * a PROPOSED "v2" spec aligned to how Linear, Vercel (Geist), shadcn/ui (Cursor,
 * Lovable) and ChatGPT style their tooltips — across EVERY property, not just
 * colour: type scale, line-height, weight, padding, radius, border, shadow,
 * max-width, icons and keyboard shortcuts.
 *
 * Reference values gathered:
 *   shadcn/ui : text-xs 12/16, px-3 py-1.5, rounded-md 6px, INVERTED, arrow on
 *   Geist     : ~13px, 6px radius, theme surface + 1px border + soft shadow
 *   Linear    : ~12–13px medium, 8px radius, elevated surface, no arrow, key pills
 *   ChatGPT   : ~12px, dark/inverted, no arrow
 */

// CURRENT shipped tooltip (see Tooltip.tsx): 14px, rounded-10, no border, inverts.
const CURRENT_CLASS =
  'max-w-[18rem] rounded-10 bg-text-primary px-3 py-1 text-surface-invert typo-subhead';

// PROPOSED v2 — theme-matching elevated surface (Geist/Linear direction).
const V2_CLASS =
  'max-w-[18rem] rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2 py-1 text-text-primary shadow-2 typo-caption1 font-medium';

// PROPOSED v2 — inverted variant (shadcn/ChatGPT direction), same sizing as v2.
const V2_INVERTED_CLASS =
  'max-w-[18rem] rounded-8 bg-text-primary px-2 py-1 text-surface-invert shadow-2 typo-caption1 font-medium';

type Variant = 'current' | 'v2' | 'inverted';

const VARIANT_CLASS: Record<Variant, string> = {
  current: CURRENT_CLASS,
  v2: V2_CLASS,
  inverted: V2_INVERTED_CLASS,
};

type ArrowSide = 'top' | 'right' | 'bottom' | 'left';

type BubbleProps = {
  variant: Variant;
  children: ReactNode;
  className?: string;
  arrow?: ArrowSide;
};

// Per-side arrow placement + which faces of the rotated square get the border.
const arrowPosition: Record<ArrowSide, string> = {
  bottom: 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-b border-r',
  top: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-t border-l',
  left: 'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-b border-l',
  right: 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-t border-r',
};

// Static, always-visible replica of the tooltip surface so many states can be
// laid out in a table without fighting Radix's portal/positioning.
const Bubble = ({
  variant,
  children,
  className,
  arrow,
}: BubbleProps): ReactElement => (
  <div className="relative inline-block">
    <div
      className={classNames(
        VARIANT_CLASS[variant],
        'relative flex w-fit items-center gap-1.5',
        className,
      )}
    >
      {children}
    </div>
    {arrow && (
      <span
        className={classNames(
          'absolute size-2 rotate-45',
          arrowPosition[arrow],
          variant === 'v2'
            ? 'border-border-subtlest-tertiary bg-background-subtle'
            : 'border-transparent bg-text-primary',
        )}
      />
    )}
  </div>
);

const dimClass: Record<Variant, string> = {
  current: 'text-surface-invert/60',
  v2: 'text-text-quaternary',
  inverted: 'text-surface-invert/60',
};

// Compact dimmed shortcut hint (Linear/ChatGPT inline style). Spacing comes from
// the container's uniform 6px gap — no extra margin.
const ShortcutHint = ({
  variant,
  keys,
}: {
  variant: Variant;
  keys: string[];
}): ReactElement => (
  <span className={dimClass[variant]}>{keys.join(' ')}</span>
);

// Keyboard-shortcut pills (Linear keycap style).
const KeyPills = ({
  variant,
  keys,
}: {
  variant: Variant;
  keys: string[];
}): ReactElement => (
  <span className="flex items-center gap-0.5">
    {keys.map((key) => (
      <kbd
        key={key}
        className={classNames(
          'flex min-w-4 justify-center rounded-4 px-1 font-sans typo-caption2 not-italic',
          variant === 'v2'
            ? 'border border-border-subtlest-tertiary bg-background-default text-text-tertiary'
            : 'bg-surface-invert/15 text-surface-invert/80',
        )}
      >
        {key}
      </kbd>
    ))}
  </span>
);

type UseCase = {
  label: string;
  description: string;
  render: (variant: Variant) => ReactNode;
};

const useCases: UseCase[] = [
  {
    label: 'Short label',
    description: 'The most common case — a word or two.',
    render: (variant) => <Bubble variant={variant}>Bookmark</Bubble>,
  },
  {
    label: 'Leading icon',
    description: 'Glyph + label, 16px icon, 6px gap.',
    render: (variant) => (
      <Bubble variant={variant}>
        <InfoIcon size={IconSize.Size16} />
        Saved to your library
      </Bubble>
    ),
  },
  {
    label: 'Inline shortcut',
    description: 'Label + dimmed shortcut text.',
    render: (variant) => (
      <Bubble variant={variant}>
        Search
        <ShortcutHint variant={variant} keys={['⌘', 'K']} />
      </Bubble>
    ),
  },
  {
    label: 'Shortcut pills',
    description: 'Label + keycap chips (Linear style).',
    render: (variant) => (
      <Bubble variant={variant}>
        Create post
        <KeyPills variant={variant} keys={['C']} />
      </Bubble>
    ),
  },
  {
    label: 'Long descriptive text',
    description: 'Wraps at the 288px max width.',
    render: (variant) => (
      <Bubble variant={variant}>
        Save this post to read later. Find it again under Bookmarks in the
        sidebar.
      </Bubble>
    ),
  },
  {
    label: 'With arrow',
    description: 'Optional pointer (v2 default is arrowless).',
    render: (variant) => (
      <Bubble variant={variant} arrow="bottom">
        Pointing at the trigger
      </Bubble>
    ),
  },
];

type Theme = 'light' | 'dark';

// The design system flips themes via `html.light` (global) or the relative
// `.invert` class on a subtree. To pin a panel to a specific theme regardless
// of the Storybook toolbar, read the ambient theme and add `.invert` to the
// panel that needs the opposite.
const useAmbientTheme = (): Theme => {
  const read = (): Theme =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('light')
      ? 'light'
      : 'dark';
  const [theme, setTheme] = useState<Theme>('dark');

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
    <div className="flex h-full flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
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

// ---------------------------------------------------------------------------
// Story 1 — Spec sheet (every property, current vs proposed vs industry)
// ---------------------------------------------------------------------------

type SpecRow = {
  prop: string;
  current: string;
  proposed: string;
  reference: string;
};

const spec: SpecRow[] = [
  {
    prop: 'Font size',
    current: '14px · typo-subhead',
    proposed: '12px · typo-caption1',
    reference: 'shadcn 12 · Linear 12–13 · Geist 13',
  },
  {
    prop: 'Line height',
    current: '18px',
    proposed: '16px',
    reference: 'shadcn 16',
  },
  {
    prop: 'Font weight',
    current: '400 regular',
    proposed: '500 medium',
    reference: 'Linear ~510 · shadcn 400',
  },
  {
    prop: 'Padding (Y × X)',
    current: '4 × 12px',
    proposed: '4 × 8px · py-1 px-2',
    reference: 'Radix 4×8 · Linear 5×8 · shadcn 6×12',
  },
  {
    prop: 'Corner radius',
    current: '10px · rounded-10',
    proposed: '8px · rounded-8',
    reference: 'shadcn 6 · Linear 8 · Geist 6',
  },
  {
    prop: 'Background',
    current: 'Inverts theme',
    proposed: 'Theme surface · bg-background-subtle',
    reference: 'Geist/Linear match · shadcn/ChatGPT invert',
  },
  {
    prop: 'Text colour',
    current: 'surface-invert',
    proposed: 'text-primary',
    reference: '—',
  },
  {
    prop: 'Border',
    current: 'None',
    proposed: '1px border-subtlest-tertiary',
    reference: 'Geist/Linear 1px hairline',
  },
  {
    prop: 'Shadow',
    current: 'None',
    proposed: 'shadow-2 (soft)',
    reference: 'all use a soft drop shadow',
  },
  {
    prop: 'Max width',
    current: 'Unbounded',
    proposed: '288px · max-w-[18rem]',
    reference: 'common 200–320px',
  },
  {
    prop: 'Icon support',
    current: 'None',
    proposed: '16px leading icon · 6px gap',
    reference: 'Linear/Geist support leading icons',
  },
  {
    prop: 'Arrow',
    current: 'Always shown',
    proposed: 'Off by default',
    reference: 'Linear/ChatGPT none · shadcn yes',
  },
  {
    prop: 'Open delay',
    current: '200ms',
    proposed: '200ms (keep)',
    reference: 'Geist 200–300ms',
  },
  {
    prop: 'Animation',
    current: '400ms slide + fade',
    proposed: '150ms fade + 4px slide',
    reference: 'shadcn ~150ms fade/zoom',
  },
];

const PreviewPair = ({ ambient }: { ambient: Theme }): ReactElement => (
  <div className="flex flex-col gap-4 laptop:flex-row">
    {(['light', 'dark'] as Theme[]).map((theme) => (
      <div
        key={theme}
        className={classNames('flex-1', theme !== ambient && 'invert')}
      >
        <div className="flex flex-col gap-4 rounded-12 border border-border-subtlest-tertiary bg-background-default p-5">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            {theme === 'dark' ? 'Dark' : 'Light'}
          </Typography>
          <div className="flex flex-wrap items-start gap-x-10 gap-y-3">
            <div className="flex flex-col items-start gap-1.5">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                Current
              </Typography>
              <Bubble variant="current">
                <InfoIcon size={IconSize.Size16} />
                Search
                <ShortcutHint variant="current" keys={['⌘', 'K']} />
              </Bubble>
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                Proposed v2
              </Typography>
              <Bubble variant="v2">
                <InfoIcon size={IconSize.Size16} />
                Search
                <ShortcutHint variant="v2" keys={['⌘', 'K']} />
              </Bubble>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SpecSheet = (): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[64rem] flex-col gap-8">
      <SectionTitle
        title="Tooltip spec — current vs proposed"
        subtitle="Every property reviewed against Linear, Geist (Vercel), shadcn/ui (Cursor, Lovable) and ChatGPT. The proposal tightens the type scale, padding and radius, and switches to a theme-matching elevated surface."
      />

      <PreviewPair ambient={ambient} />

      <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
        <div className="grid grid-cols-[1.1fr_1.2fr_1.5fr_1.7fr] bg-background-subtle">
          {['Property', 'Current', 'Proposed v2', 'Industry reference'].map(
            (head) => (
              <div key={head} className="px-4 py-3">
                <Typography type={TypographyType.Footnote} bold>
                  {head}
                </Typography>
              </div>
            ),
          )}
        </div>
        {spec.map((row, index) => (
          <div
            key={row.prop}
            className={classNames(
              'grid grid-cols-[1.1fr_1.2fr_1.5fr_1.7fr] border-t border-border-subtlest-tertiary',
              index % 2 === 1 && 'bg-surface-float',
            )}
          >
            <div className="px-4 py-2.5">
              <Typography type={TypographyType.Footnote} bold>
                {row.prop}
              </Typography>
            </div>
            <div className="px-4 py-2.5">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {row.current}
              </Typography>
            </div>
            <div className="px-4 py-2.5">
              <Typography type={TypographyType.Footnote}>
                {row.proposed}
              </Typography>
            </div>
            <div className="px-4 py-2.5">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Quaternary}
              >
                {row.reference}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 2 — Use-case matrix (current vs v2, both themes)
// ---------------------------------------------------------------------------

const VariantHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): ReactElement => (
  <div className="flex flex-col gap-0.5">
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {subtitle}
    </Typography>
  </div>
);

const Matrix = ({ variants }: { variants: Variant[] }): ReactElement => {
  const labels: Record<Variant, { title: string; subtitle: string }> = {
    current: { title: 'Current', subtitle: '14px · inverts' },
    v2: { title: 'Proposed v2', subtitle: '12px · theme surface' },
    inverted: { title: 'v2 inverted', subtitle: '12px · shadcn/ChatGPT' },
  };
  const cols = `180px ${variants.map(() => '1fr').join(' ')}`;

  return (
    <div className="grid items-center gap-x-6 gap-y-8" style={{ gridTemplateColumns: cols }}>
      <div />
      {variants.map((variant) => (
        <VariantHeader key={variant} {...labels[variant]} />
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

const ComparisonMatrixStory = ({
  variants,
  title,
  subtitle,
  withPlacement,
}: {
  variants: Variant[];
  title: string;
  subtitle: string;
  withPlacement?: boolean;
}): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[72rem] flex-col gap-8">
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="flex flex-col gap-6">
        <ThemePanel theme="light" ambient={ambient}>
          <Matrix variants={variants} />
        </ThemePanel>
        <ThemePanel theme="dark" ambient={ambient}>
          <Matrix variants={variants} />
        </ThemePanel>
      </div>

      {withPlacement && (
        <div className="flex flex-col gap-4">
          <Typography type={TypographyType.Title3} bold>
            Placement & arrow (proposed v2)
          </Typography>
          <div className="flex flex-col gap-6 laptop:flex-row">
            <ThemePanel theme="light" ambient={ambient}>
              <Placement />
            </ThemePanel>
            <ThemePanel theme="dark" ambient={ambient}>
              <Placement />
            </ThemePanel>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Placement — all four sides with arrow (part of the All states story)
// ---------------------------------------------------------------------------

const placements: { placement: string; arrow: ArrowSide }[] = [
  { placement: 'Top', arrow: 'bottom' },
  { placement: 'Bottom', arrow: 'top' },
  { placement: 'Left', arrow: 'right' },
  { placement: 'Right', arrow: 'left' },
];

const Placement = (): ReactElement => (
  <div className="grid grid-cols-2 gap-x-10 gap-y-12 tablet:grid-cols-4">
    {placements.map(({ placement, arrow }) => (
      <div key={placement} className="flex flex-col items-center gap-3">
        <div className="flex h-12 items-center justify-center">
          <Bubble variant="v2" arrow={arrow}>
            Tooltip
          </Bubble>
        </div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {placement}
        </Typography>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Padding & gap — internal spacing review vs the big platforms
// ---------------------------------------------------------------------------

const SpacingSample = ({
  padClass,
  gapClass,
  label,
  sub,
}: {
  padClass: string;
  gapClass: string;
  label: string;
  sub: string;
}): ReactElement => (
  <div className="flex flex-col items-start gap-2">
    <div
      className={classNames(
        'flex w-fit items-center rounded-8 border border-border-subtlest-tertiary bg-background-subtle py-1 text-text-primary shadow-2 typo-caption1 font-medium',
        padClass,
        gapClass,
      )}
    >
      <InfoIcon size={IconSize.Size16} />
      Search
      <span className="text-text-quaternary">⌘ K</span>
    </div>
    <div className="flex flex-col">
      <Typography type={TypographyType.Footnote} bold>
        {label}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {sub}
      </Typography>
    </div>
  </div>
);

const platformSpacing: {
  platform: string;
  horizontal: string;
  gap: string;
}[] = [
  { platform: 'daily.dev v2 (proposed)', horizontal: '8px · px-2', gap: '6px uniform' },
  { platform: 'shadcn (Cursor, Lovable)', horizontal: '12px · px-3', gap: '8px' },
  { platform: 'Linear', horizontal: '~8px', gap: '~6–8px' },
  { platform: 'Radix Themes', horizontal: '8px', gap: '—' },
  { platform: 'Material 3', horizontal: '8px', gap: '8px' },
  { platform: 'ChatGPT', horizontal: '~10px', gap: '~6px' },
];

const PaddingGap = (): ReactElement => {
  const ambient = useAmbientTheme();

  return (
    <div className="flex w-full max-w-[64rem] flex-col gap-10">
      <SectionTitle
        title="Padding & gap"
        subtitle="A close look at horizontal padding and the spacing between the icon, label and shortcut — with the same tooltip rendered at each platform's values so you can compare the feel."
      />

      <div className={classNames(ambient === 'dark' && 'invert')}>
        <div className="flex flex-col gap-8 rounded-16 border border-border-subtlest-tertiary bg-background-default p-8">
          <Typography type={TypographyType.Footnote} bold>
            Anatomy (proposed v2)
          </Typography>
          <div className="flex flex-wrap items-center gap-x-14 gap-y-6">
            <Bubble variant="v2" className="!typo-callout">
              <InfoIcon size={IconSize.Size16} />
              Search
              <ShortcutHint variant="v2" keys={['⌘', 'K']} />
            </Bubble>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {[
                ['Left / right padding', '8px (px-2)'],
                ['Top / bottom padding', '4px (py-1)'],
                ['Internal gap (all elements)', '6px (gap-1.5)'],
                ['Corner radius', '8px (rounded-8)'],
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

          <div className="h-px bg-border-subtlest-tertiary" />

          <Typography type={TypographyType.Footnote} bold>
            Horizontal padding — 8 / 10 / 12px
          </Typography>
          <div className="flex flex-wrap gap-x-14 gap-y-6">
            <SpacingSample
              padClass="px-2"
              gapClass="gap-1.5"
              label="8px · px-2 (chosen)"
              sub="Linear · Radix · Material"
            />
            <SpacingSample
              padClass="px-2.5"
              gapClass="gap-1.5"
              label="10px · px-2.5"
              sub="balanced daily.dev value"
            />
            <SpacingSample
              padClass="px-3"
              gapClass="gap-1.5"
              label="12px · px-3"
              sub="shadcn (Cursor, Lovable)"
            />
          </div>

          <div className="h-px bg-border-subtlest-tertiary" />

          <Typography type={TypographyType.Footnote} bold>
            Internal gap — 6 vs 8px
          </Typography>
          <div className="flex flex-wrap gap-x-14 gap-y-6">
            <SpacingSample
              padClass="px-2"
              gapClass="gap-1.5"
              label="6px · gap-1.5 (chosen)"
              sub="uniform, Linear-like"
            />
            <SpacingSample
              padClass="px-2"
              gapClass="gap-2"
              label="8px · gap-2"
              sub="roomier, shadcn/Material"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
        <div className="grid grid-cols-[1.4fr_1fr_1.2fr] bg-background-subtle">
          {['Platform', 'Horizontal padding', 'Internal gap'].map((head) => (
            <div key={head} className="px-4 py-3">
              <Typography type={TypographyType.Footnote} bold>
                {head}
              </Typography>
            </div>
          ))}
        </div>
        {platformSpacing.map((row, index) => (
          <div
            key={row.platform}
            className={classNames(
              'grid grid-cols-[1.4fr_1fr_1.2fr] border-t border-border-subtlest-tertiary',
              index % 2 === 1 && 'bg-surface-float',
            )}
          >
            <div className="px-4 py-2.5">
              <Typography type={TypographyType.Footnote} bold>
                {row.platform}
              </Typography>
            </div>
            <div className="px-4 py-2.5">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {row.horizontal}
              </Typography>
            </div>
            <div className="px-4 py-2.5">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {row.gap}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 3 — Live behaviour
// ---------------------------------------------------------------------------

const LiveDemo = (): ReactElement => (
  <div className="flex w-full max-w-[64rem] flex-col gap-6">
    <SectionTitle
      title="Live hover behaviour"
      subtitle="The real shipped Tooltip component (now v2). Hover or keyboard-focus the buttons; use the Storybook theme toolbar to flip light/dark."
    />
    <div className="flex flex-wrap items-center gap-10 rounded-16 border border-border-subtlest-tertiary bg-background-default p-10">
      <div className="flex flex-col items-center gap-3">
        <Tooltip content="Proposed tooltip">
          <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
            Plain label
          </Button>
        </Tooltip>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Theme-matching · 12px
        </Typography>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Tooltip
          content={
            <>
              <BookmarkIcon size={IconSize.Size16} />
              Bookmark
              <ShortcutHint variant="v2" keys={['B']} />
            </>
          }
        >
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            Icon + shortcut
          </Button>
        </Tooltip>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          With icon &amp; hint
        </Typography>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Tooltip content="Open in a new tab to keep reading without losing your place in the feed">
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            <LinkIcon size={IconSize.Size16} />
            Long content
          </Button>
        </Tooltip>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Wraps at 288px
        </Typography>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Tooltip content="With a pointer" showArrow>
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            showArrow
          </Button>
        </Tooltip>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Opt-in arrow
        </Typography>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Story 4 — Guidelines
// ---------------------------------------------------------------------------

const guidelines: { title: string; body: string }[] = [
  {
    title: 'Match the theme, don’t invert it',
    body: 'Elevated surface in the same theme (dark-on-dark, light-on-light) with a 1px hairline border + soft shadow — the Geist/Linear direction. Note: shadcn (Cursor, Lovable) and ChatGPT invert instead; the inverted variant is shown for comparison.',
  },
  {
    title: 'Tighten the type',
    body: '12px / 16px medium (typo-caption1, font-medium). 14px reads oversized for a supplementary hint — every reference product uses 12–13px.',
  },
  {
    title: 'Compact padding & radius',
    body: 'py-1 px-2 (4×8px) — matches Radix Themes exactly, in the Linear/Geist range — with the radius tightened from 10px to 8px. The 2:1 horizontal-to-vertical ratio keeps it balanced and compact.',
  },
  {
    title: 'Soft shadow for depth',
    body: 'A theme-matching tooltip is low-contrast against the page, so it needs a soft shadow (shadow-2, our lightest tier) plus the 1px border to lift off the surface — especially in light mode. Inverted tooltips (shadcn/ChatGPT) skip the shadow because the contrast alone separates them.',
  },
  {
    title: 'Icons & shortcuts',
    body: 'Support a 16px leading icon with a uniform 6px gap between all internal elements, and a trailing keyboard hint — dimmed inline text or keycap pills (Linear). Keep them optically aligned to the label baseline.',
  },
  {
    title: 'Keep it short',
    body: 'Under ~150 characters, single line where possible, capped at 288px. Anything essential belongs in the UI, not a tooltip.',
  },
  {
    title: 'Motion & delay',
    body: '~200ms open delay to avoid flicker; a quick 150ms fade + 4px slide on open. No bounce, no long 400ms transitions.',
  },
  {
    title: 'Arrow is optional',
    body: 'Default arrowless for a cleaner look (Linear/ChatGPT). Keep the arrow available for cases where the anchor is ambiguous.',
  },
  {
    title: 'Accessible by default',
    body: 'Open on keyboard focus as well as hover, dismiss on Escape, link the trigger via aria. String content already sets an aria-label today.',
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
      References: shadcn/ui Tooltip (text-xs, px-3 py-1.5, rounded-md, inverted),
      Vercel Geist Tooltip, Linear, ChatGPT, plus tooltip UX guidance from
      LogRocket, UXPin, Setproduct and UX Design World.
    </Typography>
  </div>
);

// ---------------------------------------------------------------------------

const queryClient = new QueryClient();

const meta: Meta = {
  title: 'Components/Tooltip/Redesign Comparison',
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
  <div className="flex min-h-screen justify-center bg-background-default p-8">
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

export const AllStates: Story = {
  name: 'All states & variations',
  render: () => (
    <Page>
      <ComparisonMatrixStory
        variants={['current', 'v2']}
        withPlacement
        title="All states & variations"
        subtitle="Every content variation and placement, current vs proposed v2, in both themes regardless of the Storybook toolbar."
      />
    </Page>
  ),
};

export const PaddingAndGap: Story = {
  name: 'Padding & gap',
  render: () => (
    <Page>
      <PaddingGap />
    </Page>
  ),
};

export const ColourDirection: Story = {
  name: 'Colour direction',
  render: () => (
    <Page>
      <ComparisonMatrixStory
        variants={['current', 'v2', 'inverted']}
        title="Colour direction — pick one"
        subtitle="Same v2 sizing, three colour treatments: current (inverts), v2 theme-matching (Geist/Linear), and v2 inverted (shadcn/ChatGPT). Helps decide the colour question."
      />
    </Page>
  ),
};

export const LiveBehaviour: Story = {
  name: 'Live behaviour',
  render: () => (
    <Page>
      <LiveDemo />
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
