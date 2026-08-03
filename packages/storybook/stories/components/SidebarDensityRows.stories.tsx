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

// Round two. The brief from round one:
//   1. Match the settings idiom — title + description on the left, the control
//      right-aligned, exactly like the notifications page rows.
//   2. Keep E's preview: seeing what changes is the point.
//   3. E's flaw was the reflow — the preview changed width and shoved the row
//      around on toggle. Every preview here lives in a FIXED slot, so nothing
//      moves when you flip it.
// A, C and E were the picks, so each appears here re-cut to those rules.

interface OptionProps {
  compact: boolean;
  onChange: (compact: boolean) => void;
}

const RAIL_ROWS = [
  { label: 'Home', Icon: HomeIcon },
  { label: 'Explore', Icon: CompassIcon },
  { label: 'Saved', Icon: BookmarkIcon },
];

// Every preview sits in this box. It never changes size, so no variant below
// can shift its row — the rail inside is centred and free to change width.
const PREVIEW_SLOT = 'relative h-14 w-14 shrink-0';

const Rail = ({
  withLabels,
  real,
}: {
  withLabels: boolean;
  real?: boolean;
}) => (
  <span
    aria-hidden
    className={classNames(
      'flex flex-col items-center rounded-8 bg-surface-float',
      real ? 'gap-0.5 p-1' : 'gap-1 py-1.5',
      withLabels ? (real ? 'w-11' : 'w-9') : 'w-6',
    )}
  >
    {/* Real glyphs are far taller per row than the abstract dots, so this
      variant shows two rows rather than three — the point is that a label sits
      under the icon, not how many rows the rail has. */}
    {(real ? RAIL_ROWS.slice(0, 2) : RAIL_ROWS).map(({ label, Icon }) =>
      real ? (
        <span
          key={label}
          className="flex flex-col items-center text-text-tertiary"
        >
          <Icon size={IconSize.XXSmall} />
          {withLabels && (
            <span className="leading-none text-text-quaternary typo-caption2">
              {label}
            </span>
          )}
        </span>
      ) : (
        <span key={label} className="flex flex-col items-center gap-0.5">
          <span className="size-2 rounded-2 bg-text-quaternary" />
          {withLabels && (
            <span className="h-0.5 w-3.5 rounded-2 bg-text-quaternary" />
          )}
        </span>
      ),
    )}
  </span>
);

// The preview slot: both states are painted on top of each other and cross-fade,
// so the row's geometry is identical in either state.
const CrossfadePreview = ({
  compact,
  real,
}: {
  compact: boolean;
  real?: boolean;
}) => (
  <span
    className={classNames(PREVIEW_SLOT, 'flex items-center justify-center')}
  >
    {[false, true].map((value) => (
      <span
        key={String(value)}
        className={classNames(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
          compact === value ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Rail withLabels={!value} real={real} />
      </span>
    ))}
  </span>
);

// The settings row shell — title + description left, control right, matching
// the notifications page (`justify-between`, control in a fixed-width slot).
const Row = ({
  title,
  description,
  children,
  onClick,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const Element = onClick ? 'button' : 'div';

  return (
    <Element
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className="flex w-full flex-row items-center justify-between gap-4 text-left"
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <Typography type={TypographyType.Callout}>{title}</Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          {description}
        </Typography>
      </span>
      {children}
    </Element>
  );
};

const Segmented = ({ compact, onChange }: OptionProps) => (
  <span className="flex shrink-0 rounded-10 bg-surface-float p-0.5">
    {[false, true].map((value) => (
      <button
        key={String(value)}
        type="button"
        aria-pressed={compact === value}
        onClick={() => onChange(value)}
        className={classNames(
          'rounded-8 px-2.5 py-1 typo-footnote transition-colors',
          compact === value
            ? 'bg-background-default text-text-primary'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {value ? 'Compact' : 'Comfortable'}
      </button>
    ))}
  </span>
);

const SegmentedRow = ({ compact, onChange }: OptionProps) => (
  <Row title="Sidebar" description="Labels under the navigation icons">
    <Segmented compact={compact} onChange={onChange} />
  </Row>
);

const SegmentedWithPreview = ({ compact, onChange }: OptionProps) => (
  <Row title="Sidebar" description="Labels under the navigation icons">
    <span className="flex shrink-0 items-center gap-3">
      <CrossfadePreview compact={compact} />
      <Segmented compact={compact} onChange={onChange} />
    </span>
  </Row>
);

const SwitchWithPreview = ({ compact, onChange }: OptionProps) => (
  <Row
    title="Compact sidebar"
    description="Hide the labels under the navigation icons"
  >
    <span className="flex shrink-0 items-center gap-3">
      <CrossfadePreview compact={compact} />
      <Switch
        inputId="m-switch"
        name="m"
        compact={false}
        checked={compact}
        onToggle={() => onChange(!compact)}
        className="w-20 justify-end"
      />
    </span>
  </Row>
);

const SwitchWithRealPreview = ({ compact, onChange }: OptionProps) => (
  <Row
    title="Compact sidebar"
    description="Hide the labels under the navigation icons"
  >
    <span className="flex shrink-0 items-center gap-3">
      <CrossfadePreview compact={compact} real />
      <Switch
        inputId="n-switch"
        name="n"
        compact={false}
        checked={compact}
        onToggle={() => onChange(!compact)}
        className="w-20 justify-end"
      />
    </span>
  </Row>
);

const SwitchLabelsFade = ({ compact, onChange }: OptionProps) => (
  <Row
    title="Compact sidebar"
    description="Hide the labels under the navigation icons"
  >
    <span className="flex shrink-0 items-center gap-3">
      <span
        aria-hidden
        className={classNames(
          PREVIEW_SLOT,
          'flex flex-col items-center justify-center gap-1 rounded-8 bg-surface-float',
        )}
      >
        {RAIL_ROWS.map(({ label }) => (
          <span key={label} className="flex flex-col items-center gap-0.5">
            <span className="size-2 rounded-2 bg-text-quaternary" />
            <span
              className={classNames(
                'h-0.5 w-3.5 rounded-2 bg-text-quaternary transition-opacity duration-200',
                compact ? 'opacity-0' : 'opacity-100',
              )}
            />
          </span>
        ))}
      </span>
      <Switch
        inputId="o-switch"
        name="o"
        compact={false}
        checked={compact}
        onToggle={() => onChange(!compact)}
        className="w-20 justify-end"
      />
    </span>
  </Row>
);

const RadioRowsWithPreview = ({ compact, onChange }: OptionProps) => (
  <div className="flex flex-col gap-4">
    {[false, true].map((value) => (
      <Row
        key={String(value)}
        title={value ? 'Compact' : 'Comfortable'}
        description={value ? 'Icons only, narrower' : 'Icons with labels'}
        onClick={() => onChange(value)}
      >
        <span className="flex shrink-0 items-center gap-3">
          <span
            className={classNames(
              PREVIEW_SLOT,
              'flex items-center justify-center',
            )}
          >
            <Rail withLabels={!value} />
          </span>
          <span className="flex w-20 justify-end">
            <span
              className={classNames(
                'flex size-5 items-center justify-center rounded-full border',
                compact === value
                  ? 'border-accent-cabbage-default'
                  : 'border-border-subtlest-secondary',
              )}
            >
              {compact === value && (
                <span className="size-2.5 rounded-full bg-accent-cabbage-default" />
              )}
            </span>
          </span>
        </span>
      </Row>
    ))}
  </div>
);

const CheckRows = ({ compact, onChange }: OptionProps) => (
  <div className="flex flex-col gap-4">
    {[false, true].map((value) => (
      <Row
        key={String(value)}
        title={value ? 'Compact' : 'Comfortable'}
        description={value ? 'Icons only, narrower' : 'Icons with labels'}
        onClick={() => onChange(value)}
      >
        <span className="flex shrink-0 items-center gap-3">
          <span
            className={classNames(
              PREVIEW_SLOT,
              'flex items-center justify-center',
            )}
          >
            <Rail withLabels={!value} />
          </span>
          <span className="flex w-20 justify-end">
            <VIcon
              size={IconSize.Small}
              className={classNames(
                'text-accent-cabbage-default transition-opacity',
                compact === value ? 'opacity-100' : 'opacity-0',
              )}
            />
          </span>
        </span>
      </Row>
    ))}
  </div>
);

const RailPairControl = ({ compact, onChange }: OptionProps) => (
  <Row title="Sidebar" description="Labels under the navigation icons">
    <span className="flex shrink-0 items-center gap-2">
      {[false, true].map((value) => (
        <button
          key={String(value)}
          type="button"
          aria-pressed={compact === value}
          aria-label={value ? 'Compact' : 'Comfortable'}
          onClick={() => onChange(value)}
          className={classNames(
            PREVIEW_SLOT,
            'flex items-center justify-center rounded-10 ring-2 transition-colors',
            compact === value
              ? 'ring-accent-cabbage-default'
              : 'ring-transparent hover:ring-border-subtlest-secondary',
          )}
        >
          <Rail withLabels={!value} />
        </button>
      ))}
    </span>
  </Row>
);

const VARIANTS: {
  key: string;
  title: string;
  note: string;
  Component: (props: OptionProps) => React.ReactElement;
}[] = [
  {
    key: 'K',
    title: 'Segmented, no preview',
    note: 'A in the settings row. Smallest possible.',
    Component: SegmentedRow,
  },
  {
    key: 'L',
    title: 'Segmented + preview',
    note: 'A and E combined; preview cross-fades in a fixed slot.',
    Component: SegmentedWithPreview,
  },
  {
    key: 'M',
    title: 'Switch + preview',
    note: 'E with the shift fixed — identical geometry in both states.',
    Component: SwitchWithPreview,
  },
  {
    key: 'N',
    title: 'Switch + real glyphs',
    note: 'Same as M, but the preview uses the actual icons and label type.',
    Component: SwitchWithRealPreview,
  },
  {
    key: 'O',
    title: 'Switch + labels fade',
    note: 'Rail width is constant; only the labels fade. Cannot reflow.',
    Component: SwitchLabelsFade,
  },
  {
    key: 'P',
    title: 'Radio rows + preview',
    note: 'C as two settings rows, radio on the right.',
    Component: RadioRowsWithPreview,
  },
  {
    key: 'Q',
    title: 'Checkmark rows',
    note: 'Same, with a checkmark instead of a radio dial.',
    Component: CheckRows,
  },
  {
    key: 'R',
    title: 'The preview is the control',
    note: 'Two rails, right-aligned; click one to pick it.',
    Component: RailPairControl,
  },
];

const Variant = ({ entry }: { entry: (typeof VARIANTS)[number] }) => {
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
  title: 'Components/Sidebar/Density rows',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-7 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Round two: every option is a settings row with the control on the right,
        and every preview sits in a fixed slot so toggling never moves the
        layout. Toggle each one and watch the row stay put.
      </Typography>
      {VARIANTS.map((entry) => (
        <Variant key={entry.key} entry={entry} />
      ))}
    </div>
  ),
};

// Placement matters as much as the control: here the three strongest sit in the
// appearance page's real rhythm, between its actual neighbours.
const PageSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-5">
    <Typography bold type={TypographyType.Subhead}>
      {label}
    </Typography>
    {children}
  </div>
);

const NeighbourSwitch = ({ label }: { label: string }) => (
  <Row title={label} description="">
    <Switch
      inputId={`neighbour-${label}`}
      name={label}
      compact={false}
      checked
      onToggle={() => undefined}
      className="w-20 justify-end"
    />
  </Row>
);

const InPage = ({ which }: { which: 'L' | 'M' | 'Q' }) => {
  const [compact, setCompact] = useState(false);
  const Component = {
    L: SegmentedWithPreview,
    M: SwitchWithPreview,
    Q: CheckRows,
  }[which];

  return (
    <div className="flex max-w-lg flex-col gap-6 rounded-16 border border-border-subtlest-tertiary p-6">
      <PageSection label="Layout">
        <Component compact={compact} onChange={setCompact} />
      </PageSection>
      <PageSection label="Preferences">
        <NeighbourSwitch label="Show feed sorting menu" />
        <NeighbourSwitch label="Open links in new tab" />
      </PageSection>
    </div>
  );
};

export const InPageContext: Story = {
  render: () => (
    <div className="flex flex-col gap-8 bg-background-default p-6">
      {(['L', 'M', 'Q'] as const).map((which) => (
        <div key={which} className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Footnote}>
            {which} — in the page
          </Typography>
          <InPage which={which} />
        </div>
      ))}
    </div>
  ),
};
