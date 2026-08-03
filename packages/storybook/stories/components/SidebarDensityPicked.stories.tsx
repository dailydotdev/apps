import React, { useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';

// R, taken further: the pair of rails IS the control. Only the
// selected/unselected treatment varies below. Both states occupy identical
// space in every variant, so choosing never moves the row.

interface OptionProps {
  compact: boolean;
  onChange: (compact: boolean) => void;
}

// The rail carries no fill of its own, leaving the rectangle's colour free to
// carry the selection.
const RailArt = ({ withLabels }: { withLabels: boolean }) => (
  <span
    aria-hidden
    className={classNames(
      'flex flex-col items-center gap-1',
      withLabels ? 'w-7' : 'w-3',
    )}
  >
    {[0, 1, 2].map((row) => (
      <span key={row} className="flex flex-col items-center gap-0.5">
        <span className="size-2 rounded-2 bg-text-quaternary" />
        {withLabels && (
          <span className="h-0.5 w-4 rounded-2 bg-text-quaternary" />
        )}
      </span>
    ))}
  </span>
);

interface Treatment {
  thumb: (selected: boolean) => string;
  label: (selected: boolean) => string;
  check?: boolean;
}

const Option = ({
  value,
  compact,
  onChange,
  treatment,
}: OptionProps & { value: boolean; treatment: Treatment }) => {
  const selected = compact === value;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onChange(value)}
      className="flex flex-col items-center gap-1"
    >
      <span
        className={classNames(
          'relative flex h-14 w-16 items-center justify-center rounded-10 border transition-colors',
          treatment.thumb(selected),
        )}
      >
        <RailArt withLabels={!value} />
        {treatment.check && selected && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent-cabbage-default">
            <VIcon size={IconSize.XXSmall} className="text-white" />
          </span>
        )}
      </span>
      <span
        className={classNames(
          'typo-caption1 transition-colors',
          treatment.label(selected),
        )}
      >
        {value ? 'Compact' : 'Comfortable'}
      </span>
    </button>
  );
};

const Picker = ({
  compact,
  onChange,
  treatment,
}: OptionProps & { treatment: Treatment }) => (
  <div className="flex flex-row items-start justify-between gap-4">
    <div className="flex flex-1 flex-col gap-0.5 pt-1">
      <Typography type={TypographyType.Callout}>Sidebar</Typography>
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Footnote}
      >
        Labels under the navigation icons
      </Typography>
    </div>
    <div className="flex shrink-0 gap-2">
      {[false, true].map((value) => (
        <Option
          key={String(value)}
          value={value}
          compact={compact}
          onChange={onChange}
          treatment={treatment}
        />
      ))}
    </div>
  </div>
);

// Unselected is the same everywhere, so the comparison is purely about how the
// selected one reads.
const IDLE =
  'border-border-subtlest-tertiary hover:border-border-subtlest-secondary';

const TREATMENTS: {
  key: string;
  title: string;
  note: string;
  treatment: Treatment;
}[] = [
  {
    key: 'R1',
    title: 'Grey fill, white label',
    note: 'The quietest. Selection reads as "filled in".',
    treatment: {
      thumb: (s) => (s ? 'border-transparent bg-surface-float' : IDLE),
      label: (s) => (s ? 'text-text-primary' : 'text-text-tertiary'),
    },
  },
  {
    key: 'R2',
    title: 'Grey fill, purple label',
    note: 'Same fill, but the label picks up the accent the toggles use.',
    treatment: {
      thumb: (s) => (s ? 'border-transparent bg-surface-float' : IDLE),
      label: (s) => (s ? 'text-accent-cabbage-default' : 'text-text-tertiary'),
    },
  },
  {
    key: 'R3',
    title: 'Grey fill, purple outline',
    note: 'Fill plus a 1px accent edge — the strongest without colour-flooding.',
    treatment: {
      thumb: (s) =>
        s ? 'border-accent-cabbage-default bg-surface-float' : IDLE,
      label: (s) => (s ? 'text-text-primary' : 'text-text-tertiary'),
    },
  },
  {
    key: 'R4',
    title: 'Purple tint',
    note: 'The accent-flat fill this repo uses for selected cards elsewhere.',
    treatment: {
      thumb: (s) =>
        s ? 'border-accent-cabbage-default bg-accent-cabbage-flat' : IDLE,
      label: (s) => (s ? 'text-accent-cabbage-default' : 'text-text-tertiary'),
    },
  },
  {
    key: 'R7',
    title: 'Purple tint + check badge',
    note: 'R4 and R5 together: accent fill, accent label, explicit mark.',
    treatment: {
      thumb: (s) =>
        s ? 'border-accent-cabbage-default bg-accent-cabbage-flat' : IDLE,
      label: (s) => (s ? 'text-accent-cabbage-default' : 'text-text-tertiary'),
      check: true,
    },
  },
  {
    key: 'R5',
    title: 'Grey fill + check badge',
    note: 'Adds an explicit "this one" mark, like a chosen avatar.',
    treatment: {
      thumb: (s) => (s ? 'border-transparent bg-surface-float' : IDLE),
      label: (s) => (s ? 'text-text-primary' : 'text-text-tertiary'),
      check: true,
    },
  },
  {
    key: 'R6',
    title: 'Inset dark fill',
    note: 'Matches the active segment of a segmented control.',
    treatment: {
      thumb: (s) =>
        s
          ? 'border-border-subtlest-primary bg-background-default'
          : 'border-transparent bg-surface-float',
      label: (s) => (s ? 'text-text-primary' : 'text-text-tertiary'),
    },
  },
];

const Variant = ({ entry }: { entry: (typeof TREATMENTS)[number] }) => {
  const [compact, setCompact] = useState(false);

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
        <Picker
          compact={compact}
          onChange={setCompact}
          treatment={entry.treatment}
        />
      </div>
    </section>
  );
};

const meta: Meta = {
  title: 'Components/Sidebar/Density picked',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Treatments: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-7 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        R with the labels, control on the right. Unselected always carries a
        hairline border so it reads as a target; what changes is how loudly the
        selected one announces itself.
      </Typography>
      {TREATMENTS.map((entry) => (
        <Variant key={entry.key} entry={entry} />
      ))}
    </div>
  ),
};

const NeighbourRow = ({ label }: { label: string }) => (
  <div className="flex flex-row items-center justify-between gap-4">
    <Typography type={TypographyType.Callout}>{label}</Typography>
    <Switch
      inputId={`neighbour-${label}`}
      name={label}
      compact={false}
      checked
      onToggle={() => undefined}
      className="w-20 justify-end"
    />
  </div>
);

const InPage = ({ entry }: { entry: (typeof TREATMENTS)[number] }) => {
  const [compact, setCompact] = useState(false);

  return (
    <div className="flex max-w-lg flex-col gap-6 rounded-16 border border-border-subtlest-tertiary p-6">
      <div className="flex flex-col gap-5">
        <Typography bold type={TypographyType.Subhead}>
          Layout
        </Typography>
        <Picker
          compact={compact}
          onChange={setCompact}
          treatment={entry.treatment}
        />
      </div>
      <div className="flex flex-col gap-5">
        <Typography bold type={TypographyType.Subhead}>
          Preferences
        </Typography>
        <NeighbourRow label="Show feed sorting menu" />
        <NeighbourRow label="Open links in new tab" />
      </div>
    </div>
  );
};

export const InPageContext: Story = {
  render: () => (
    <div className="flex flex-col gap-8 bg-background-default p-6">
      {TREATMENTS.filter((entry) => ['R3', 'R4', 'R7'].includes(entry.key)).map(
        (entry) => (
          <div key={entry.key} className="flex flex-col gap-2">
            <Typography bold type={TypographyType.Footnote}>
              {entry.key} — in the page
            </Typography>
            <InPage entry={entry} />
          </div>
        ),
      )}
    </div>
  ),
};
