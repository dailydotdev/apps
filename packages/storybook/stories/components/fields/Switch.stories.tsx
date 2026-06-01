import React, { useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import type { SwitchProps } from '@dailydotdev/shared/src/components/fields/Switch';
import { LegacySwitch } from './legacy/LegacySwitch';

const figmaUrl =
  'https://www.figma.com/design/C7n8EiXBwV1sYIEHkQHS8R/daily.dev---Design-System?node-id=796-69&m=dev';

const meta: Meta<typeof Switch> = {
  title: 'Components/Fields/Switch',
  component: Switch,
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: figmaUrl,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    compact: {
      control: 'boolean',
      description:
        'Small (footnote) label when true, medium (callout) when false',
    },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

/**
 * A self-contained, interactive toggle that owns its checked state so the real
 * hover / focus / press / toggle behaviour can be reviewed by clicking around.
 */
const InteractiveToggle = ({
  variant,
  ...props
}: Omit<SwitchProps, 'inputId' | 'name' | 'onToggle'> & {
  variant: 'legacy' | 'new';
}) => {
  const id = useId();
  const [checked, setChecked] = useState(Boolean(props.checked));
  const Component = variant === 'legacy' ? LegacySwitch : Switch;

  return (
    <Component
      {...props}
      inputId={id}
      name={id}
      checked={checked}
      onToggle={() => setChecked((prev) => !prev)}
    />
  );
};

// --- Layout primitives for the comparison page ----------------------------

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-8 text-text-primary">
    {children}
  </div>
);

const PageHeader = () => (
  <header className="flex flex-col gap-2">
    <span className="typo-footnote uppercase tracking-wide text-text-quaternary">
      Design system · Review
    </span>
    <h1 className="typo-title1 font-bold">
      Toggle / Switch — before &amp; after
    </h1>
    <p className="max-w-2xl typo-body text-text-tertiary">
      A side-by-side review of the previous toggle and the redesigned toggle
      from Figma. Every toggle on this page is live — hover, press, and tab to
      focus to verify the states, animations, and interactions. Use the theme
      toolbar to check light and dark.
    </p>
  </header>
);

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="typo-title3 font-bold">{title}</h2>
      {description && (
        <p className="max-w-2xl typo-callout text-text-tertiary">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);

const Card = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div
    className="flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4"
    style={{ width: '16rem' }}
  >
    <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
      {label}
    </span>
    <div className="flex flex-1 items-center">{children}</div>
  </div>
);

const comparisonGrid = { gridTemplateColumns: '200px 1fr 1fr' } as const;

/** A "previous" vs "new" pair for the same set of props. */
const ComparisonRow = ({
  title,
  caption,
  switchProps,
}: {
  title: string;
  caption?: string;
  switchProps: Omit<SwitchProps, 'inputId' | 'name' | 'onToggle' | 'variant'>;
}) => (
  <div
    className="grid items-center gap-4 rounded-12 border border-border-subtlest-tertiary p-4"
    style={comparisonGrid}
  >
    <div className="flex flex-col gap-0.5">
      <span className="typo-callout font-bold">{title}</span>
      {caption && (
        <span className="typo-caption1 text-text-tertiary">{caption}</span>
      )}
    </div>
    <div className="flex items-center justify-center border-r border-border-subtlest-tertiary py-2">
      <InteractiveToggle variant="legacy" {...switchProps} />
    </div>
    <div className="flex items-center justify-center py-2">
      <InteractiveToggle variant="new" {...switchProps} />
    </div>
  </div>
);

const ComparisonHeader = () => (
  <div className="grid gap-4 px-4" style={comparisonGrid}>
    <span />
    <span className="text-center typo-footnote font-bold uppercase tracking-wide text-text-tertiary">
      Previous
    </span>
    <span className="text-center typo-footnote font-bold uppercase tracking-wide text-accent-cabbage-default">
      New design
    </span>
  </div>
);

// --- Stories ---------------------------------------------------------------

/**
 * The headline comparison: previous design on the left, redesign on the right,
 * across every static state. Hover / focus / press are live on each toggle.
 */
export const Comparison: Story = {
  render: () => (
    <Page>
      <PageHeader />

      <Section
        title="States"
        description="Each row renders the same props on the previous toggle and the new toggle so you can compare them directly."
      >
        <div className="flex flex-col gap-3">
          <ComparisonHeader />
          <ComparisonRow
            title="On"
            caption="checked"
            switchProps={{ checked: true, children: 'Toggle label' }}
          />
          <ComparisonRow
            title="Off"
            caption="unchecked"
            switchProps={{ checked: false, children: 'Toggle label' }}
          />
          <ComparisonRow
            title="On · no label"
            switchProps={{ checked: true, 'aria-label': 'Toggle' }}
          />
          <ComparisonRow
            title="Off · no label"
            switchProps={{ checked: false, 'aria-label': 'Toggle' }}
          />
          <ComparisonRow
            title="Disabled · on"
            switchProps={{
              checked: true,
              disabled: true,
              children: 'Toggle label',
            }}
          />
          <ComparisonRow
            title="Disabled · off"
            switchProps={{
              checked: false,
              disabled: true,
              children: 'Toggle label',
            }}
          />
          <ComparisonRow
            title="Medium label"
            caption="compact={false}"
            switchProps={{
              checked: true,
              compact: false,
              children: 'Toggle label',
            }}
          />
        </div>
      </Section>

      <Section
        title="Interactions & animations"
        description="These are real, interactive toggles. Hover to reveal the surface layer, click and hold to squeeze the knob then drag it left/right to slide the switch (it snaps to the nearest side on release), and use Tab to see the keyboard focus ring."
      >
        <div className="flex flex-wrap gap-4">
          <Card label="Hover me">
            <InteractiveToggle
              variant="new"
              checked={false}
              aria-label="Hover"
            />
          </Card>
          <Card label="Click & hold (press)">
            <InteractiveToggle variant="new" checked aria-label="Press" />
          </Card>
          <Card label="Tab to focus">
            <InteractiveToggle
              variant="new"
              checked={false}
              aria-label="Focus"
            />
          </Card>
          <Card label="Toggle me">
            <InteractiveToggle variant="new" checked aria-label="Toggle" />
          </Card>
        </div>
      </Section>
    </Page>
  ),
};

/** Just the new toggle, in its on and off states with and without a label. */
export const NewDesign: Story = {
  render: () => (
    <Page>
      <Section
        title="New toggle"
        description="The redesigned daily.dev toggle."
      >
        <div className="flex flex-wrap items-center gap-8">
          <InteractiveToggle variant="new" checked>
            On by default
          </InteractiveToggle>
          <InteractiveToggle variant="new" checked={false}>
            Off by default
          </InteractiveToggle>
          <InteractiveToggle variant="new" checked aria-label="On no label" />
          <InteractiveToggle
            variant="new"
            checked={false}
            aria-label="Off no label"
          />
          <InteractiveToggle variant="new" checked disabled>
            Disabled on
          </InteractiveToggle>
          <InteractiveToggle variant="new" checked={false} disabled>
            Disabled off
          </InteractiveToggle>
        </div>
      </Section>
    </Page>
  ),
};

/** Fully controllable playground driven by Storybook controls. */
export const Playground: Story = {
  args: {
    checked: true,
    disabled: false,
    compact: true,
    children: 'Toggle label',
  },
  render: (args) => (
    <Page>
      <Section title="Playground">
        <InteractiveToggle
          variant="new"
          checked={args.checked}
          disabled={args.disabled}
          compact={args.compact}
          key={`${args.checked}-${args.disabled}-${args.compact}`}
        >
          {args.children}
        </InteractiveToggle>
      </Section>
    </Page>
  ),
};
