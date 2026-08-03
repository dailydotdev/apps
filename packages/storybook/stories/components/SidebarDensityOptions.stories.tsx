import React, { useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  BookmarkIcon,
  CompassIcon,
  HomeIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

// Ten directions for the appearance page's sidebar-density control. The brief:
// smaller than the current pair of cards, and it must not read as though the
// settings sections below it live inside the previewed sidebar — which is what
// the mocked feed pane in the current preview does.

interface OptionProps {
  compact: boolean;
  onChange: (compact: boolean) => void;
}

const RAIL_ROWS = [
  { label: 'Home', Icon: HomeIcon },
  { label: 'Explore', Icon: CompassIcon },
  { label: 'Saved', Icon: BookmarkIcon },
];

// A rail on its own — no page behind it, so nothing implies the rest of the
// settings page is the sidebar's content area.
const MiniRail = ({
  withLabels,
  className,
}: {
  withLabels: boolean;
  className?: string;
}) => (
  <span
    aria-hidden
    className={classNames(
      'flex flex-col items-center gap-1 rounded-8 bg-surface-float py-1.5',
      withLabels ? 'w-11' : 'w-6',
      className,
    )}
  >
    {RAIL_ROWS.map(({ label }) => (
      <span key={label} className="flex flex-col items-center gap-0.5">
        <span className="size-2.5 rounded-4 bg-text-quaternary" />
        {withLabels && (
          <span className="h-0.5 w-4 rounded-2 bg-text-quaternary" />
        )}
      </span>
    ))}
  </span>
);

// Same idea at real fidelity: actual glyphs and actual label type, so the
// preview is the thing itself rather than an abstraction of it.
const RealRail = ({ withLabels }: { withLabels: boolean }) => (
  <span
    aria-hidden
    className={classNames(
      'flex flex-col items-center gap-0.5 rounded-10 bg-surface-float p-1',
      withLabels ? 'w-14' : 'w-10',
    )}
  >
    {RAIL_ROWS.map(({ label, Icon }) => (
      <span
        key={label}
        className="flex w-full flex-col items-center gap-0.5 rounded-8 py-1 text-text-tertiary"
      >
        <Icon size={IconSize.XSmall} />
        {withLabels && (
          <span className="leading-none text-text-quaternary typo-caption2">
            {label}
          </span>
        )}
      </span>
    ))}
  </span>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography bold type={TypographyType.Subhead}>
    {children}
  </Typography>
);

// A — Segmented control. Same shape as the Cards/List control that already sits
// directly above it on the appearance page.
const Segmented = ({ compact, onChange }: OptionProps) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <SectionLabel>Sidebar</SectionLabel>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Labels under the navigation icons
      </Typography>
    </div>
    <div className="flex rounded-10 bg-surface-float p-0.5">
      {[false, true].map((value) => (
        <button
          key={String(value)}
          type="button"
          aria-pressed={compact === value}
          onClick={() => onChange(value)}
          className={classNames(
            'rounded-8 px-3 py-1 typo-footnote transition-colors',
            compact === value
              ? 'bg-background-default text-text-primary'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {value ? 'Compact' : 'Comfortable'}
        </button>
      ))}
    </div>
  </div>
);

// B — One preview, not two. The control is a segmented pair and the single
// sample morphs, so there is one object on the page instead of a grid.
const SinglePreview = ({ compact, onChange }: OptionProps) => (
  <div className="flex items-center gap-4 rounded-12 border border-border-subtlest-tertiary p-3">
    <RealRail withLabels={!compact} />
    <div className="flex flex-1 flex-col gap-2">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {compact
          ? 'Icons only. The sidebar takes less width.'
          : 'Each icon keeps its label underneath.'}
      </Typography>
      <div className="flex gap-2">
        {[false, true].map((value) => (
          <Button
            key={String(value)}
            size={ButtonSize.XSmall}
            variant={
              compact === value ? ButtonVariant.Primary : ButtonVariant.Float
            }
            onClick={() => onChange(value)}
          >
            {value ? 'Compact' : 'Comfortable'}
          </Button>
        ))}
      </div>
    </div>
  </div>
);

// C — The current cards, halved: preview beside the copy instead of above it,
// and no mocked page pane.
const CompactCards = ({ compact, onChange }: OptionProps) => (
  <div className="grid grid-cols-2 gap-2">
    {[false, true].map((value) => (
      <button
        key={String(value)}
        type="button"
        aria-pressed={compact === value}
        onClick={() => onChange(value)}
        className={classNames(
          'flex items-center gap-3 rounded-12 border p-2.5 text-left transition-colors',
          compact === value
            ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
            : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
        )}
      >
        <MiniRail withLabels={!value} className="shrink-0" />
        <span className="flex flex-col">
          <Typography bold type={TypographyType.Footnote}>
            {value ? 'Compact' : 'Comfortable'}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {value ? 'Icons only' : 'Icons with labels'}
          </Typography>
        </span>
      </button>
    ))}
  </div>
);

// D — Settings-native radio rows. Reads like the rest of the page; the preview
// is a small trailing glyph rather than the main event.
const RadioRows = ({ compact, onChange }: OptionProps) => (
  <div className="flex flex-col overflow-hidden rounded-12 border border-border-subtlest-tertiary">
    {[false, true].map((value, index) => (
      <button
        key={String(value)}
        type="button"
        role="radio"
        aria-checked={compact === value}
        onClick={() => onChange(value)}
        className={classNames(
          'flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-hover',
          index > 0 && 'border-t border-border-subtlest-tertiary',
        )}
      >
        <span
          className={classNames(
            'flex size-4 shrink-0 items-center justify-center rounded-full border',
            compact === value
              ? 'border-accent-cabbage-default'
              : 'border-border-subtlest-secondary',
          )}
        >
          {compact === value && (
            <span className="size-2 rounded-full bg-accent-cabbage-default" />
          )}
        </span>
        <span className="flex flex-1 flex-col">
          <Typography type={TypographyType.Footnote}>
            {value ? 'Compact' : 'Comfortable'}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {value ? 'Icons only, narrower' : 'Icons with labels'}
          </Typography>
        </span>
        <MiniRail withLabels={!value} />
      </button>
    ))}
  </div>
);

// E — One row, the way every other preference on the page behaves. The preview
// is a single sample that swaps as you flip it.
const SwitchRow = ({ compact, onChange }: OptionProps) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <MiniRail withLabels={!compact} />
      <div className="flex flex-col">
        <Typography type={TypographyType.Callout}>Compact sidebar</Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Hide the labels under the navigation icons
        </Typography>
      </div>
    </div>
    <Switch
      inputId="density-switch"
      name="density"
      compact={false}
      checked={compact}
      onToggle={() => onChange(!compact)}
    />
  </div>
);

// F — Both samples inside ONE frame. A single bordered object can't be mistaken
// for a container the rest of the page sits in.
const SharedFrame = ({ compact, onChange }: OptionProps) => (
  <div className="flex items-stretch gap-2 rounded-12 border border-border-subtlest-tertiary p-2">
    {[false, true].map((value) => (
      <button
        key={String(value)}
        type="button"
        aria-pressed={compact === value}
        onClick={() => onChange(value)}
        className={classNames(
          'flex flex-1 flex-col items-center gap-2 rounded-8 p-2 transition-colors',
          compact === value ? 'bg-surface-float' : 'hover:bg-surface-hover',
        )}
      >
        <RealRail withLabels={!value} />
        <Typography
          type={TypographyType.Caption1}
          color={
            compact === value
              ? TypographyColor.Primary
              : TypographyColor.Tertiary
          }
        >
          {value ? 'Compact' : 'Comfortable'}
        </Typography>
      </button>
    ))}
  </div>
);

// G — Width, drawn to scale. The setting is really about how much room the rail
// takes, so say that literally and skip the sidebar mock entirely.
const WidthBars = ({ compact, onChange }: OptionProps) => (
  <div className="flex flex-col gap-1.5">
    {[
      { value: false, label: 'Comfortable', width: 'w-20', px: '80px' },
      { value: true, label: 'Compact', width: 'w-16', px: '64px' },
    ].map((row) => (
      <button
        key={String(row.value)}
        type="button"
        aria-pressed={compact === row.value}
        onClick={() => onChange(row.value)}
        className="flex items-center gap-3 rounded-10 px-2 py-1.5 text-left transition-colors hover:bg-surface-hover"
      >
        <span
          className={classNames(
            'h-6 shrink-0 rounded-6',
            row.width,
            compact === row.value
              ? 'bg-accent-cabbage-default'
              : 'bg-surface-float',
          )}
        />
        <Typography type={TypographyType.Footnote} className="flex-1">
          {row.label}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {row.px}
        </Typography>
        {compact === row.value && (
          <VIcon
            size={IconSize.XSmall}
            className="text-accent-cabbage-default"
          />
        )}
      </button>
    ))}
  </div>
);

// H — Tabs over one live sample. The sample is the real rail at real size, so
// what you see is exactly what the sidebar becomes.
const TabbedSample = ({ compact, onChange }: OptionProps) => (
  <div className="flex flex-col gap-2">
    <div
      role="tablist"
      className="flex gap-4 border-b border-border-subtlest-tertiary"
    >
      {[false, true].map((value) => (
        <button
          key={String(value)}
          type="button"
          role="tab"
          aria-selected={compact === value}
          onClick={() => onChange(value)}
          className={classNames(
            'border-b-2 pb-1.5 typo-footnote transition-colors',
            compact === value
              ? 'border-text-primary text-text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-primary',
          )}
        >
          {value ? 'Compact' : 'Comfortable'}
        </button>
      ))}
    </div>
    <div className="flex w-fit rounded-10 bg-background-subtle p-2">
      <RealRail withLabels={!compact} />
    </div>
  </div>
);

// I — Just the two rails, no cards at all. The selected one is outlined; the
// caption sits under each. Nothing frames the section.
const BareRails = ({ compact, onChange }: OptionProps) => (
  <div className="flex gap-3">
    {[false, true].map((value) => (
      <button
        key={String(value)}
        type="button"
        aria-pressed={compact === value}
        onClick={() => onChange(value)}
        className="flex flex-col items-center gap-1.5"
      >
        <span
          className={classNames(
            'rounded-12 p-1 ring-2 transition-colors',
            compact === value
              ? 'ring-accent-cabbage-default'
              : 'ring-transparent',
          )}
        >
          <RealRail withLabels={!value} />
        </span>
        <Typography
          type={TypographyType.Caption1}
          color={
            compact === value
              ? TypographyColor.Primary
              : TypographyColor.Tertiary
          }
        >
          {value ? 'Compact' : 'Comfortable'}
        </Typography>
      </button>
    ))}
  </div>
);

// J — Text-first with a peek. The row is pure settings copy; the sample only
// appears beside it, small, as confirmation.
const TextFirst = ({ compact, onChange }: OptionProps) => (
  <div className="flex items-center justify-between gap-4 rounded-12 bg-surface-float px-3 py-2.5">
    <div className="flex flex-col">
      <Typography type={TypographyType.Callout}>Sidebar density</Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {compact ? 'Compact — icons only' : 'Comfortable — icons with labels'}
      </Typography>
    </div>
    <div className="flex items-center gap-3">
      <MiniRail withLabels={!compact} />
      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Secondary}
        onClick={() => onChange(!compact)}
      >
        Change
      </Button>
    </div>
  </div>
);

const VARIANTS: {
  key: string;
  title: string;
  note: string;
  Component: (props: OptionProps) => React.ReactElement;
}[] = [
  {
    key: 'A',
    title: 'Segmented control',
    note: 'Matches the Cards/List control directly above it on the page.',
    Component: Segmented,
  },
  {
    key: 'B',
    title: 'One morphing preview',
    note: 'A single sample instead of a grid of two.',
    Component: SinglePreview,
  },
  {
    key: 'C',
    title: 'Halved cards',
    note: "Today's idea, laid sideways and without the mocked page.",
    Component: CompactCards,
  },
  {
    key: 'D',
    title: 'Radio rows',
    note: 'Reads like the rest of the settings page.',
    Component: RadioRows,
  },
  {
    key: 'E',
    title: 'Switch row',
    note: 'One row, exactly like every other preference here.',
    Component: SwitchRow,
  },
  {
    key: 'F',
    title: 'Shared frame',
    note: "One bordered object — can't be read as a container for the page.",
    Component: SharedFrame,
  },
  {
    key: 'G',
    title: 'Width to scale',
    note: 'Says the actual thing the setting changes: how much room it takes.',
    Component: WidthBars,
  },
  {
    key: 'H',
    title: 'Tabs over a live sample',
    note: 'Real rail at real size, so the preview is the thing itself.',
    Component: TabbedSample,
  },
  {
    key: 'I',
    title: 'Bare rails',
    note: 'No card chrome at all; the selected rail is ringed.',
    Component: BareRails,
  },
  {
    key: 'J',
    title: 'Text-first with a peek',
    note: 'Copy leads, the sample is only confirmation.',
    Component: TextFirst,
  },
];

const Variant = ({
  entry,
}: {
  entry: (typeof VARIANTS)[number];
}): React.ReactElement => {
  const [compact, setCompact] = useState(false);
  const { Component } = entry;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <Typography bold type={TypographyType.Footnote}>
          {entry.key} — {entry.title}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {entry.note}
        </Typography>
      </div>
      <div className="rounded-14 border border-dashed border-border-subtlest-tertiary p-4">
        <Component compact={compact} onChange={setCompact} />
      </div>
    </section>
  );
};

const meta: Meta = {
  title: 'Components/Sidebar/Density options',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// The dashed frame around each is the story's own scaffolding — it marks where
// the control ends, and is not part of any design.
export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-7 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Ten takes on the sidebar density control. All interactive — click
        through each. Pick one and I&apos;ll ship it.
      </Typography>
      {VARIANTS.map((entry) => (
        <Variant key={entry.key} entry={entry} />
      ))}
    </div>
  ),
};
