import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Case, Page } from '../hero-cover/parts';

/*
 * What a builder needs beyond the pictures: the production components and
 * tokens each piece is made of, how every edge case is handled, the
 * accessibility checks (contrast measured live from the tokens, so it
 * follows the toolbar's theme), and the gaps to decide before building.
 */

const meta: Meta = {
  title: 'GTA VI/5. Build notes',
  // Not pinned to dark, so the toolbar's theme switch re-measures contrast.
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="max-w-full overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[56rem] border-collapse text-left typo-footnote">
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              scope="col"
              className="px-3 py-2 font-bold text-text-primary"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'px-3 py-2',
                  cellIndex === 0
                    ? 'font-bold text-text-primary'
                    : 'text-text-secondary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Code = ({ children }: { children: ReactNode }): ReactElement => (
  <code className="rounded-4 bg-surface-float px-1 font-mono text-text-primary">
    {children}
  </code>
);

/* ------------------------------------------------------------ contrast */

type Rgba = [number, number, number, number];

const parseColor = (value: string): Rgba | null => {
  const rgb = value.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b, a = '1'] = rgb[1].split(/[\s,/]+/).filter(Boolean);
    return [Number(r), Number(g), Number(b), Number(a)];
  }
  const srgb = value.match(/color\(srgb ([^)]+)\)/);
  if (srgb) {
    const [r, g, b, a = '1'] = srgb[1].split(/[\s/]+/).filter(Boolean);
    return [Number(r) * 255, Number(g) * 255, Number(b) * 255, Number(a)];
  }
  return null;
};

const over = (top: Rgba, bottom: Rgba): Rgba => {
  const a = top[3];
  return [
    top[0] * a + bottom[0] * (1 - a),
    top[1] * a + bottom[1] * (1 - a),
    top[2] * a + bottom[2] * (1 - a),
    1,
  ];
};

const luminance = ([r, g, b]: Rgba): number => {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const ratio = (a: Rgba, b: Rgba): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

type Kind = 'text' | 'large' | 'ui';

const thresholds: Record<Kind, { aa: number; aaa: number | null }> = {
  text: { aa: 4.5, aaa: 7 },
  large: { aa: 3, aaa: 4.5 },
  ui: { aa: 3, aaa: null },
};

const Badge = ({ pass, label }: { pass: boolean; label: string }) => (
  <span
    className={classNames(
      'rounded-6 px-1.5 py-0.5 font-bold typo-caption2',
      pass
        ? 'bg-status-success text-surface-invert'
        : 'bg-status-error text-white',
    )}
  >
    {label} {pass ? 'pass' : 'fail'}
  </span>
);

/**
 * Measures one pairing from the live tokens: the sample's text color over
 * its background, over the page (or a worst-case art color).
 */
const Contrast = ({
  label,
  where,
  fg,
  bg,
  base,
  kind,
}: {
  label: string;
  where: string;
  fg: string;
  bg: string;
  /** A color behind the background, e.g. the art's lightest tone. */
  base?: string;
  kind: Kind;
}): ReactElement => {
  const sampleRef = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<number | null>(null);
  const [theme, setTheme] = useState(document.documentElement.className);

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.className),
    );
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sample = sampleRef.current;
    if (!sample) {
      return;
    }
    const page = parseColor(
      getComputedStyle(document.body).getPropertyValue('background-color'),
    );
    const pageColor =
      page && page[3] > 0
        ? page
        : (parseColor(
            getComputedStyle(sample.closest('.bg-background-default') ?? sample)
              .backgroundColor,
          ) as Rgba);
    const baseColor = base
      ? (parseColor(base) as Rgba)
      : (pageColor ?? [14, 18, 23, 1]);
    const background = over(
      parseColor(
        getComputedStyle(sample.parentElement as Element).backgroundColor,
      ) ?? [0, 0, 0, 0],
      baseColor,
    );
    const foreground = over(
      parseColor(getComputedStyle(sample).color) ?? [0, 0, 0, 1],
      background,
    );
    setValue(ratio(foreground, background));
  }, [base, bg, fg, theme]);

  const { aa, aaa } = thresholds[kind];
  return (
    <tr className="border-t border-border-subtlest-tertiary align-middle">
      <td className="px-3 py-2 font-bold text-text-primary">{label}</td>
      <td className="px-3 py-2 text-text-secondary">{where}</td>
      <td className="px-3 py-2">
        <span
          className={classNames(
            'inline-flex rounded-8 px-2 py-1 font-bold typo-callout',
            bg,
          )}
          style={base ? { boxShadow: `inset 0 0 0 100px ${base}` } : undefined}
        >
          <span ref={sampleRef} className={classNames('relative', fg)}>
            Aa
          </span>
        </span>
      </td>
      <td className="px-3 py-2 font-bold text-text-primary">
        {value ? `${value.toFixed(2)}:1` : '…'}
      </td>
      <td className="px-3 py-2">
        {value && (
          <span className="flex gap-1">
            <Badge pass={value >= aa} label="AA" />
            {aaa && <Badge pass={value >= aaa} label="AAA" />}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-text-tertiary">
        {
          { text: 'Text', large: 'Large or bold text', ui: 'Icon / non-text' }[
            kind
          ]
        }
      </td>
    </tr>
  );
};

/* -------------------------------------------------------------- page */

export const BuildNotes: StoryObj = {
  name: '5. Build notes',
  render: () => (
    <Page
      chapter="GTA VI · Build notes"
      question="What does a builder need beyond the pictures?"
      title="Build notes"
      goal="Name the production components and tokens each piece is made of, settle every edge case, check accessibility, and list the decisions a builder would otherwise get stuck on."
      metric="A builder can start without asking."
    >
      <Case
        title="1. Components and tokens"
        note="Every piece is a production component with a small branch, not a new component. Stand-ins in stories/gta-vi/production hold the exact diff."
      >
        <Table
          head={[
            'Piece',
            'Production component',
            'Change',
            'Tokens and classes',
          ]}
          rows={[
            [
              'Award in the picker',
              <>
                <Code>GiveAwardModal</Code> › <Code>AwardItem</Code>{' '}
                (components/modals/award)
              </>,
              'None to the component. A product with value 0 already reads Free; the backend lists it first during launch week.',
              <>
                <Code>ButtonVariant.Float</Code>, <Code>bg-surface-float</Code>,{' '}
                <Code>rounded-14</Code>, image <Code>size-20</Code>,{' '}
                <Code>TypographyType.Footnote</Code> /{' '}
                <Code>TypographyColor.Secondary</Code>
              </>,
            ],
            [
              'Free footer',
              <>
                <Code>GiveAwardModal</Code> › <Code>CommentScreen</Code>
              </>,
              <>
                For an event product, a Footnote line replaces{' '}
                <Code>AwardFeesNote</Code>.
              </>,
              <>
                <Code>TypographyType.Footnote</Code>,{' '}
                <Code>TypographyColor.Tertiary</Code>; expired:{' '}
                <Code>TypographyColor.StatusError</Code>
              </>,
            ],
            [
              'Award received',
              <>
                <Code>CommentAwardActions</Code>, <Code>PostAwardAction</Code>,
                profile <Code>BadgesAndAwards</Code> › <Code>Award</Code>
              </>,
              'None. The image renders at size-6 (comment), size-8 (profile).',
              'The art itself: light frame, white-outlined VI, 74% of its canvas like the other awards.',
            ],
            [
              'Event chips',
              <>
                <Code>AchievementShelfCard</Code>{' '}
                (features/profile/components/achievements)
              </>,
              <>
                An <Code>event</Code> field on <Code>Achievement</Code> swaps
                the &lt;1% rare chip for Free or Rare, with{' '}
                <Code>MedalBadgeIcon</Code>.
              </>,
              <>
                Free: <Code>bg-accent-cabbage-default</Code> with{' '}
                <Code>text-background-default</Code>, which flips with the theme
                (any fixed ink fails AA at 14px in one of them). Rare: the
                card&apos;s existing <Code>rarityPillClasses</Code>.{' '}
                <Code>rounded-max</Code>.
              </>,
            ],
            [
              'Unlocked date',
              <Code>AchievementShelfCard</Code>,
              'Event cards say "Unlocked Nov 19, 2026" (always the year) and the detail adds CalendarIcon.',
              <>
                <Code>TypographyType.Subhead</Code>,{' '}
                <Code>TypographyColor.Tertiary</Code>,{' '}
                <Code>IconSize.Size16</Code>
              </>,
            ],
            [
              'Theme option',
              <>
                <Code>ThemeSection</Code> (ProfileMenu/sections), shown by{' '}
                <Code>SidebarDesktopV2</Code>&apos;s settings popover,{' '}
                <Code>ProfileMenu</Code> and Settings › Appearance
              </>,
              <>
                A fourth <Code>themes</Code> entry. Picking it sets dark mode
                plus the cover.
              </>,
              <>
                <Code>ButtonGroup</Code>, <Code>ButtonSize.XSmall</Code>,{' '}
                <Code>ButtonVariant.Float</Code> when active; glyph gradient
                from <Code>--theme-accent-cabbage/bacon/bun-default</Code>
              </>,
            ],
            [
              'Home cover',
              'The home page header (Hero Cover rail header)',
              'Art behind the shortcuts and greeting, fading into the page.',
              <>
                Fade to <Code>background-default</Code>; shortcut labels on{' '}
                <Code>bg-overlay-primary-pepper</Code> <Code>rounded-6</Code>;
                no raw colors
              </>,
            ],
          ]}
        />
      </Case>

      <Case
        title="2. Edge cases"
        note="Each is drawn on GTA VI › 4. All states."
      >
        <Table
          head={[
            'Piece',
            'Empty',
            'Loading',
            'Error and validation',
            'Overflow and scaling',
          ]}
          rows={[
            [
              'Award picker',
              'No products: the grid is empty (production). After launch week the event award simply isn’t returned.',
              'Proposed: ElementPlaceholder tiles at the tile size (production shows nothing).',
              'A paid award over balance: production’s Buy Cores footer. Free award: never blocked by balance.',
              'Long or missing receiver name wraps / falls back to @username. Grid: 3 columns, 4 from tablet.',
            ],
            [
              'Award send',
              'Empty note is fine (optional).',
              'Button loading state.',
              'useTransactionError toast. Proposed: free window closed mid-flow disables Send and says why.',
              'Note stops at maxNoteLength (400) and scrolls.',
            ],
            [
              'Award received',
              'No awards: the profile grid doesn’t render; the comment shows the award button only.',
              'BadgesAndAwardsSkeleton.',
              'Image fails: browser alt is empty (decorative); the count still reads.',
              'largeNumberFormat on comments (1.3K); profile prints x1284 raw, as today. Awards word hides below tablet.',
            ],
            [
              'Achievement shelf',
              'EmptyStateCard. Before Nov 19 the event cards don’t exist.',
              'Five ElementPlaceholder cards.',
              'Image fails: the fallback 404s today, so the art goes blank (see Omissions). Still Read missed: removed from the shelf after the day.',
              'Names and descriptions wrap (the description clamp is broken in production, see Omissions); keep event copy to two lines. 3 columns on phones, 5 from laptop.',
            ],
            [
              'Theme',
              'No shortcuts: the art still fills the top; layout doesn’t move.',
              'Proposed: the cover area keeps its height while the art loads, so nothing shifts.',
              'Proposed: a cover that fails to load drops out; the theme stays picked.',
              'Greeting truncates on one line. Art crops by object-position per breakpoint; phones use a taller crop.',
            ],
          ]}
        />
      </Case>

      <Case
        title="3. Accessibility: contrast"
        note="Measured now from the live tokens. Switch the toolbar theme to light to re-measure. AA is the bar; AAA is reported."
      >
        <div className="max-w-full overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
          <table className="w-full min-w-[56rem] border-collapse text-left typo-footnote">
            <thead>
              <tr className="bg-surface-float">
                {['Pair', 'Where', 'Sample', 'Ratio', 'WCAG', 'Kind'].map(
                  (cell) => (
                    <th
                      key={cell}
                      scope="col"
                      className="px-3 py-2 font-bold text-text-primary"
                    >
                      {cell}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              <Contrast
                label="Free price"
                where="Award tile"
                fg="text-text-secondary"
                bg="bg-surface-float"
                kind="text"
              />
              <Contrast
                label="Free chip"
                where="Achievement card and detail"
                fg="text-background-default"
                bg="bg-accent-cabbage-default"
                kind="text"
              />
              <Contrast
                label="Rare chip"
                where="Achievement card and detail"
                fg="text-[#08110c]"
                bg="bg-[#efab27]"
                kind="text"
              />
              <Contrast
                label="Free-until note"
                where="Award note screen"
                fg="text-text-tertiary"
                bg="bg-background-default"
                kind="text"
              />
              <Contrast
                label="Expired message"
                where="Award note screen"
                fg="text-status-error"
                bg="bg-background-default"
                kind="text"
              />
              <Contrast
                label="Award count"
                where="Comment"
                fg="text-text-tertiary"
                bg="bg-background-default"
                kind="large"
              />
              <Contrast
                label="Shortcut label on scrim"
                where="Themed home, over the art's lightest pink"
                fg="text-white"
                bg="bg-overlay-primary-pepper"
                base="rgb(255, 190, 210)"
                kind="text"
              />
              <Contrast
                label="Greeting"
                where="Themed home, where the art has faded"
                fg="text-text-primary"
                bg="bg-background-default"
                kind="large"
              />
              <Contrast
                label="VI glyph"
                where="Theme row, inactive"
                fg="text-accent-bacon-default"
                bg="bg-background-default"
                kind="ui"
              />
            </tbody>
          </table>
        </div>
      </Case>

      <Case title="3. Accessibility: keyboard and screen readers">
        <Table
          head={['Piece', 'Keyboard flow', 'Screen reader']}
          rows={[
            [
              'Award picker',
              'Modal traps focus (production Modal). Tab: balance + (Buy Cores), Close, then each award in grid order, Vice City first. Enter or Space picks. Escape closes.',
              'Dialog named "Give an Award". Each tile: "Vice City, free" / "Heart, 50 Cores"; images are decorative. Balance reads "Balance: 8.1K Cores".',
            ],
            [
              'Award note',
              'Back, Close, note, Send. Send is disabled (not hidden) when the free window has closed.',
              'Note has a label. Errors use role="alert": the toast, and the expired message.',
            ],
            [
              'Award on a comment',
              'The count is one button: opens the award list or the picker, as today.',
              'Reads "3 Awards, featured: Vice City", since the word Awards is hidden below tablet.',
            ],
            [
              'Achievement card',
              'Each card is one button that opens the detail; Escape closes it and focus returns to the card.',
              'Button "View Made It to Vice City". The chip is text (Free / Rare) next to a decorative icon; the date is text.',
            ],
            [
              'Theme row',
              'Tab through Dark, Light, Auto, VI; Enter or Space picks. Focus ring is ButtonGroup’s.',
              'Buttons are labeled ("Vice City") with aria-pressed on the current one. The cover is aria-hidden: it’s decoration.',
            ],
          ]}
        />
      </Case>

      <Case
        title="4. Omissions: what a builder would get stuck on"
        note="Each with the simplest fix we'd ship."
      >
        <Table
          head={['Gap', 'Simplest viable fix']}
          rows={[
            [
              'How the award becomes free only during launch week',
              <>
                A normal award product with <Code>value: 0</Code> and{' '}
                <Code>flags.availableUntil</Code>; the products query hides it
                after that date, and the award mutation rejects it after that
                date. No client logic beyond the expired message.
              </>,
            ],
            [
              'Spam: a free award costs nothing',
              'Reuse the existing one-award-per-entity rule (userState.awarded). No new limit.',
            ],
            [
              'Free awards and revenue share',
              'Value 0 means no transaction and no revenue share; AwardFeesNote is replaced for it.',
            ],
            [
              'Achievement type has no event field',
              <>
                Add <Code>event?: &apos;free&apos; | &apos;rare&apos;</Code> to{' '}
                <Code>Achievement</Code> in graphql/user/achievements.ts (types
                are hand-written) and to the query fragment.
              </>,
            ],
            [
              'Which day counts as Nov 19',
              'The reader’s timezone (user.timezone), as the streak does. Granting: Vice City on any boot that day; Still Read on the first read that day, from the same event that counts the streak.',
            ],
            [
              'Rarity on event achievements',
              'Exclude them from rarity: the chip names the kind, and they shouldn’t push others out of the <1% band.',
            ],
            [
              'Still Read after the day',
              'The backend stops returning it to readers who don’t have it once Nov 20 starts in their timezone.',
            ],
            [
              'Storing the theme',
              <>
                Add <Code>viceCity</Code> to the settings theme enum on the
                backend. Clients that don’t know it fall back to dark, so old
                extension versions don’t break.
              </>,
            ],
            [
              'Light mode and the theme',
              'VI is dark-only: picking it sets dark. Picking Light or Auto turns VI off.',
            ],
            [
              'After the event',
              'Keep VI in the Theme row; people who like it keep it. Revisit at the next event.',
            ],
            [
              'Feature flags',
              <>
                <Code>gta_vi_award</Code>, <Code>gta_vi_achievements</Code>,{' '}
                <Code>gta_vi_theme</Code> in featureManagement.ts, all default
                false.
              </>,
            ],
            [
              'Analytics',
              <>
                Theme: the existing <Code>LogEvent.ChangeSettings</Code> with{' '}
                <Code>target_id: viceCity</Code>. Award: existing award events
                carry the product id.
              </>,
            ],
            [
              'Found in production: the card description never clamps',
              <>
                <Code>AchievementShelfCard</Code> sets{' '}
                <Code>line-clamp-1 hidden tablet:block</Code>, and{' '}
                <Code>tablet:block</Code> overrides the clamp&apos;s display.
                Fix separately with <Code>tablet:line-clamp-1</Code> if product
                wants one line; it changes every card, so it&apos;s not part of
                this work.
              </>,
            ],
            [
              'Found in production: the achievement image fallback 404s',
              <>
                <Code>AchievementShelfCard</Code>&apos;s{' '}
                <Code>fallbackImage</Code> is{' '}
                <Code>https://daily.dev/default-achievement.png</Code>, which
                returns 404. Point it at an image on media.daily.dev.
              </>,
            ],
            [
              'Assets',
              'Move the art to webapp/public/app/assets and load with fromCDN; give the cover explicit height so it never shifts the layout.',
            ],
          ]}
        />
      </Case>
    </Page>
  ),
};
