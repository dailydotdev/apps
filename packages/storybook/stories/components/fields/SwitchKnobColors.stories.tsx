import React, { useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';

/**
 * Candidate knob colors to compare on the dark-mode brand (cabbage) track.
 * Values are the raw design-system palette hexes so the swatches are exact.
 */
const KNOB_OPTIONS = [
  { id: 'white', label: 'Primary · white', sub: 'salt 0', value: '#FFFFFF' },
  { id: 'salt10', label: 'Salt 10', sub: 'salt 10', value: '#F5F8FC' },
  { id: 'salt20', label: 'Salt 20', sub: 'salt 20', value: '#EDF0F7' },
  { id: 'salt30', label: 'Salt 30', sub: 'salt 30', value: '#E4E9F2' },
  { id: 'cabbage10', label: 'Cabbage 10', sub: 'cabbage 10', value: '#E669FB' },
];

const gridColumns = { gridTemplateColumns: '220px 120px 120px 1fr' } as const;

const DemoToggle = ({
  value,
  checked: initialChecked,
}: {
  value: string;
  checked?: boolean;
}) => {
  const id = useId();
  const [checked, setChecked] = useState(Boolean(initialChecked));

  return (
    <div style={{ '--switch-knob': value } as React.CSSProperties}>
      <Switch
        inputId={id}
        name={id}
        checked={checked}
        onToggle={() => setChecked((prev) => !prev)}
        aria-label="Knob color demo"
      />
    </div>
  );
};

const meta: Meta<typeof Switch> = {
  title: 'Components/Fields/Switch Knob Colors',
  component: Switch,
  parameters: {
    layout: 'fullscreen',
    // Force dark mode — this comparison is about the dark-theme knob color.
    themes: { themeOverride: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

/**
 * Same toggle, dark theme, on the brand (cabbage) track — one row per candidate
 * knob color so they can be compared directly. Every toggle is live (click/drag).
 */
export const KnobColors: Story = {
  render: () => (
    <div className="flex min-h-screen flex-col gap-8 bg-background-default p-8 text-text-primary">
      <header className="flex flex-col gap-2">
        <span className="typo-footnote uppercase tracking-wide text-text-quaternary">
          Switch · Dark mode
        </span>
        <h1 className="typo-title2 font-bold">Knob color comparison</h1>
        <p className="max-w-2xl typo-callout text-text-tertiary">
          The same redesigned toggle on the brand (cabbage) track, with a
          different knob color per row. If the theme toolbar isn&apos;t already
          on Dark, switch it. Every toggle is live — click or drag the knob.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <div className="grid items-center gap-4 px-4" style={gridColumns}>
          <span className="typo-footnote uppercase tracking-wide text-text-tertiary">
            Knob color
          </span>
          <span className="text-center typo-footnote uppercase tracking-wide text-text-tertiary">
            Off
          </span>
          <span className="text-center typo-footnote uppercase tracking-wide text-text-tertiary">
            On
          </span>
          <span className="typo-footnote uppercase tracking-wide text-text-tertiary">
            Swatch
          </span>
        </div>

        {KNOB_OPTIONS.map((option) => (
          <div
            key={option.id}
            className="grid items-center gap-4 rounded-12 border border-border-subtlest-tertiary p-4"
            style={gridColumns}
          >
            <div className="flex flex-col gap-0.5">
              <span className="typo-callout font-bold">{option.label}</span>
              <span className="typo-caption1 text-text-tertiary">
                {option.sub}
              </span>
            </div>
            <div className="flex justify-center">
              <DemoToggle value={option.value} />
            </div>
            <div className="flex justify-center">
              <DemoToggle value={option.value} checked />
            </div>
            <div className="flex items-center gap-3">
              <span
                className="h-6 w-6 rounded-6 border border-border-subtlest-tertiary"
                style={{ background: option.value }}
              />
              <span className="typo-caption1 text-text-quaternary">
                {option.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
