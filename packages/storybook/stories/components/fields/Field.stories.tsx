import React, { useId } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { FieldSize } from '@dailydotdev/shared/src/components/fields/fieldSizes';
import { FieldVariant } from '@dailydotdev/shared/src/components/fields/fieldVariants';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AtIcon,
  LockIcon,
  SearchIcon,
  MagicIcon,
  EyeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { LegacyTextField } from './legacy/LegacyTextField';
import { LegacyTextarea } from './legacy/LegacyTextarea';

const figmaUrl =
  'https://www.figma.com/design/C7n8EiXBwV1sYIEHkQHS8R/daily.dev---Design-System';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

const meta: Meta<typeof TextField> = {
  title: 'Components/Fields/Field',
  component: TextField,
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: figmaUrl },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextField>;

// --- Layout primitives (shared with the Toggle comparison page) ------------

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
    <h1 className="typo-title1 font-bold">Fields — before &amp; after</h1>
    <p className="max-w-2xl typo-body text-text-tertiary">
      A complete side-by-side of every field, previous design on the left and
      the redesign on the right, so the team can see exactly what changed and
      play with it. The new fields share their motion, focus border and sizing
      language with the redesigned Toggle and the Button system — a field and a
      button of the same size line up pixel-for-pixel. Every field here is live:
      click to focus, type, hover, tab. Use the theme toolbar to check light and
      dark.
    </p>
  </header>
);

const whatChanged = [
  'Resting border on every field so fields are delineated from the page.',
  'Focus and validity use one 1px border: text-primary on focus, red on error, blue on a focused read-only field — no more left-edge accent bar.',
  'Sizes share the button scale (height, radius, icon size) so fields and buttons line up.',
  'Two background variants: Filled (floated surface) and Outline (transparent).',
  'Password keeps its colour-graded strength indicator; disabled fields are dimmed.',
  'Dropdown popover refreshed: rounded-14 card, inset rows, smooth highlight.',
];

const WhatChanged = () => (
  <section className="flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-5">
    <h2 className="typo-title3 font-bold">What changed</h2>
    <ul className="flex flex-col gap-2">
      {whatChanged.map((item) => (
        <li key={item} className="flex gap-2 typo-callout text-text-tertiary">
          <span className="text-accent-cabbage-default">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </section>
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
  <div className="flex w-72 flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
    <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
      {label}
    </span>
    <div className="flex flex-1 flex-col justify-center gap-3">{children}</div>
  </div>
);

const comparisonGrid = { gridTemplateColumns: '180px 1fr 1fr' } as const;

const ComparisonHeader = () => (
  <div className="grid gap-4 px-4" style={comparisonGrid}>
    <span />
    <span className="typo-footnote font-bold uppercase tracking-wide text-text-tertiary">
      Previous
    </span>
    <span className="typo-footnote font-bold uppercase tracking-wide text-accent-cabbage-default">
      New design
    </span>
  </div>
);

const ComparisonRow = ({
  title,
  caption,
  previous,
  next,
}: {
  title: string;
  caption?: string;
  previous: React.ReactNode;
  next: React.ReactNode;
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
    <div className="border-r border-border-subtlest-tertiary pr-4">
      {previous}
    </div>
    <div>{next}</div>
  </div>
);

// Live, interactive new TextField with the inputId/name boilerplate handled.
const NewField = (
  props: Omit<
    React.ComponentProps<typeof TextField>,
    'inputId' | 'name'
  > & { name?: string },
) => {
  const id = useId();
  return <TextField inputId={id} name={props.name ?? id} {...props} />;
};

const popoverTopics = ['Frontend', 'Backend', 'AI', 'DevOps'];

/**
 * Static preview of the dropdown popover so the old vs new card can sit side by
 * side without a click. `legacy` paints the previous values (rounded-12 card,
 * no inset padding, 28px rows); the default is the redesigned popover
 * (rounded-14 card, 6px inset padding, 32px rows, softer highlight).
 */
const PopoverPreview = ({ legacy }: { legacy?: boolean }) => (
  <div
    className={classNames(
      'w-full border border-border-subtlest-secondary bg-background-subtle shadow-2',
      legacy ? 'rounded-12 px-1 py-1' : 'rounded-14 p-1.5',
    )}
  >
    {popoverTopics.map((topic, i) => (
      <div
        key={topic}
        className={classNames(
          'flex items-center truncate rounded-10 typo-footnote',
          legacy ? 'h-7 px-2' : 'h-8 px-2.5',
          i === 0 ? 'bg-surface-hover text-text-primary' : 'text-text-tertiary',
        )}
      >
        {topic}
      </div>
    ))}
  </div>
);

const topics = ['Frontend', 'Backend', 'AI', 'DevOps', 'Career'];

// Live, interactive new Textarea with the inputId/name boilerplate handled.
const LiveTextarea = (
  props: Omit<React.ComponentProps<typeof Textarea>, 'inputId' | 'name'> & {
    name?: string;
  },
) => {
  const id = useId();
  return <Textarea inputId={id} name={props.name ?? id} {...props} />;
};

// The faint border + optional surface fill applied to a redesigned dropdown.
const dropdownTrigger = (extra?: string) => ({
  button: classNames('border border-border-subtlest-secondary', extra),
});

// --- Stories ---------------------------------------------------------------

/**
 * The headline comparison: previous design on the left, redesign on the right,
 * across the core text input states. Hover / focus are live on every field.
 */
export const Comparison: Story = {
  render: () => (
    <Page>
      <PageHeader />

      <WhatChanged />

      <Section
        title="Text input · states"
        description="Same props on the previous field (left) and the new field (right). The new field drops the left-edge accent bar and communicates focus and validity with one consistent mechanism — a clean 1px border (text-primary on focus, red on error) — plus smooth surface transitions."
      >
        <div className="flex flex-col gap-3">
          <ComparisonHeader />
          <ComparisonRow
            title="Rest"
            caption="empty"
            previous={<LegacyTextField label="Email" />}
            next={<NewField label="Email" />}
          />
          <ComparisonRow
            title="Filled"
            caption="has value"
            previous={<LegacyTextField label="Email" defaultValue="ido@daily.dev" />}
            next={<NewField label="Email" value="ido@daily.dev" />}
          />
          <ComparisonRow
            title="Invalid"
            caption="red border"
            previous={
              <LegacyTextField
                label="Email"
                defaultValue="not-an-email"
                invalid
                hint="Enter a valid email"
              />
            }
            next={
              <NewField
                label="Email"
                value="not-an-email"
                valid={false}
                hint="Enter a valid email"
              />
            }
          />
          <ComparisonRow
            title="Read-only"
            caption="not editable"
            previous={
              <LegacyTextField label="Email" defaultValue="ido@daily.dev" readOnly />
            }
            next={<NewField label="Email" value="ido@daily.dev" readOnly />}
          />
          <ComparisonRow
            title="Disabled"
            caption="dimmed"
            previous={
              <LegacyTextField label="Email" defaultValue="ido@daily.dev" disabled />
            }
            next={<NewField label="Email" value="ido@daily.dev" disabled />}
          />
          <ComparisonRow
            title="With left icon"
            previous={
              <LegacyTextField
                label="Email"
                leftIcon={<AtIcon size={IconSize.Small} />}
              />
            }
            next={
              <NewField label="Email" leftIcon={<AtIcon size={IconSize.Small} />} />
            }
          />
        </div>
      </Section>

      <Section
        title="Field types"
        description="The label behaviour is preserved across the redesign: primary floats the label, secondary keeps an outer label, tertiary uses the label as the placeholder."
      >
        <div className="flex flex-col gap-3">
          <ComparisonHeader />
          <ComparisonRow
            title="Primary"
            caption="floating label"
            previous={<LegacyTextField fieldType="primary" label="Full name" />}
            next={<NewField fieldType="primary" label="Full name" />}
          />
          <ComparisonRow
            title="Secondary"
            caption="outer label"
            previous={
              <LegacyTextField
                fieldType="secondary"
                label="Full name"
                placeholder="Jane Doe"
              />
            }
            next={
              <NewField
                fieldType="secondary"
                label="Full name"
                placeholder="Jane Doe"
              />
            }
          />
          <ComparisonRow
            title="Tertiary"
            caption="label as placeholder"
            previous={<LegacyTextField fieldType="tertiary" label="Search topics" />}
            next={<NewField fieldType="tertiary" label="Search topics" />}
          />
        </div>
      </Section>

      <Section
        title="Password & Search"
        description="Composed fields inherit the new look. Password keeps the previous left-edge strength indicator and colour-graded fill — type a password on the right to see it light up."
      >
        <div className="flex flex-col gap-3">
          <ComparisonHeader />
          <ComparisonRow
            title="Password"
            caption="strong"
            previous={
              <LegacyTextField
                label="Password"
                type="password"
                defaultValue="sup3r-secret"
                leftIcon={<LockIcon size={IconSize.Small} />}
                passwordLevel={3}
                hint="Strong as it gets"
              />
            }
            next={
              <PasswordField
                inputId="pwd-new"
                name="pwd-new"
                label="Password"
                minLength={6}
              />
            }
          />
          <ComparisonRow
            title="Search"
            previous={
              <LegacyTextField
                label="Search"
                leftIcon={<SearchIcon size={IconSize.Small} />}
              />
            }
            next={<SearchField inputId="search-new" placeholder="Search" />}
          />
        </div>
      </Section>

      <Section
        title="Textarea"
        description="The multi-line field follows the same border language — faint resting border, focus and red error borders, dimmed when disabled — with the built-in character counter."
      >
        <div className="flex flex-col gap-3">
          <ComparisonHeader />
          <ComparisonRow
            title="Rest"
            caption="empty"
            previous={<LegacyTextarea label="Tell us more" rows={3} />}
            next={
              <LiveTextarea
                fieldType="tertiary"
                label="Tell us more"
                placeholder="Share the details…"
                rows={3}
              />
            }
          />
          <ComparisonRow
            title="Filled"
            caption="has value"
            previous={
              <LegacyTextarea
                label="Bio"
                rows={3}
                defaultValue="Frontend engineer who loves a tidy design system."
              />
            }
            next={
              <LiveTextarea
                fieldType="tertiary"
                label="Bio"
                rows={3}
                value="Frontend engineer who loves a tidy design system."
              />
            }
          />
          <ComparisonRow
            title="Invalid"
            caption="red border"
            previous={
              <LegacyTextarea
                label="Bio"
                rows={3}
                defaultValue="too short"
                invalid
                hint="Tell us a little more"
              />
            }
            next={
              <LiveTextarea
                fieldType="tertiary"
                label="Bio"
                rows={3}
                value="too short"
                valid={false}
                hint="Tell us a little more"
              />
            }
          />
        </div>
      </Section>

      <Section
        title="Dropdown"
        description="The trigger joins the field family (faint border, shared size scale) and the popover is refreshed: a rounded-14 card with inset rows, taller 32px items and a smooth highlight. The triggers below are live — click to open the real popover."
      >
        <div className="flex flex-col gap-3">
          <ComparisonHeader />
          <ComparisonRow
            title="Trigger"
            caption="placeholder"
            previous={
              <Dropdown
                placeholder="Pick a topic"
                selectedIndex={-1}
                options={topics}
                onChange={() => {}}
                buttonSize={ButtonSize.Large}
              />
            }
            next={
              <Dropdown
                placeholder="Pick a topic"
                selectedIndex={-1}
                options={topics}
                onChange={() => {}}
                buttonSize={ButtonSize.Large}
                className={dropdownTrigger('bg-surface-float')}
              />
            }
          />
          <ComparisonRow
            title="Trigger"
            caption="selected"
            previous={
              <Dropdown
                selectedIndex={1}
                options={topics}
                onChange={() => {}}
                buttonSize={ButtonSize.Large}
              />
            }
            next={
              <Dropdown
                selectedIndex={1}
                options={topics}
                onChange={() => {}}
                buttonSize={ButtonSize.Large}
                className={dropdownTrigger('bg-surface-float')}
              />
            }
          />
          <ComparisonRow
            title="Popover"
            caption="open menu"
            previous={<PopoverPreview legacy />}
            next={<PopoverPreview />}
          />
        </div>
      </Section>

      <Section
        title="New · background variants"
        description="A new capability with no previous equivalent. Filled sits on the floated surface; Outline is transparent and defined by its border alone (with a faint hover fill), mirroring the Subtle/Secondary button look. Both share the faint resting border."
      >
        <div className="flex flex-wrap gap-4">
          <Card label="Filled · default">
            <NewField
              variant={FieldVariant.Filled}
              fieldType="tertiary"
              label="Email"
              leftIcon={<AtIcon size={IconSize.Small} />}
            />
          </Card>
          <Card label="Outline · transparent">
            <NewField
              variant={FieldVariant.Outline}
              fieldType="tertiary"
              label="Email"
              leftIcon={<AtIcon size={IconSize.Small} />}
            />
          </Card>
          <Card label="Filled · filled value">
            <NewField
              variant={FieldVariant.Filled}
              fieldType="tertiary"
              label="Email"
              value="ido@daily.dev"
            />
          </Card>
          <Card label="Outline · filled value">
            <NewField
              variant={FieldVariant.Outline}
              fieldType="tertiary"
              label="Email"
              value="ido@daily.dev"
            />
          </Card>
        </div>
      </Section>

      <Section
        title="New · size alignment with buttons"
        description="The key change: fields now use the exact same size scale as buttons. A field and a button of the same size share height, corner radius and icon size, so they sit together cleanly in one strip."
      >
        <div className="flex flex-col gap-4">
          {[
            { size: FieldSize.Large, button: ButtonSize.Large, label: 'Large' },
            {
              size: FieldSize.Medium,
              button: ButtonSize.Medium,
              label: 'Medium',
            },
            { size: FieldSize.Small, button: ButtonSize.Small, label: 'Small' },
          ].map(({ size, button, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-16 typo-caption1 uppercase tracking-wide text-text-quaternary">
                {label}
              </span>
              <NewField
                fieldSize={size}
                fieldType="tertiary"
                label="Email"
                leftIcon={<AtIcon />}
                className={{ container: 'flex-1' }}
              />
              <Button size={button} variant={ButtonVariant.Primary}>
                Subscribe
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

/** Just the new field family, in its primary states. */
export const NewDesign: Story = {
  render: () => (
    <Page>
      <Section title="New field family">
        <div className="flex max-w-md flex-col gap-4">
          <NewField label="Email" leftIcon={<AtIcon size={IconSize.Small} />} />
          <NewField
            fieldType="secondary"
            label="Display name"
            placeholder="Jane Doe"
          />
          <PasswordField
            inputId="pwd-showcase"
            name="pwd-showcase"
            label="Password"
            minLength={6}
          />
          <SearchField inputId="search-showcase" placeholder="Search anything" />
          <Dropdown
            placeholder="Pick a topic"
            selectedIndex={-1}
            options={['Frontend', 'Backend', 'AI', 'DevOps']}
            onChange={() => {}}
            buttonSize={ButtonSize.Large}
          />
        </div>
      </Section>

      <Section
        title="Interactions"
        description="Hover to reveal the surface layer, click to focus the text-primary border, and type to see the value styling."
      >
        <div className="flex flex-wrap gap-4">
          <Card label="Hover me">
            <NewField label="Hover" />
          </Card>
          <Card label="Click to focus">
            <NewField label="Focus" leftIcon={<MagicIcon size={IconSize.Small} />} />
          </Card>
          <Card label="Type to fill">
            <NewField label="Type here" />
          </Card>
        </div>
      </Section>
    </Page>
  ),
};

// --- Comprehensive state coverage ------------------------------------------

const StateRow = ({
  label,
  caption,
  children,
}: {
  label: string;
  caption?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-4">
    <div className="flex w-44 shrink-0 flex-col pt-2.5">
      <span className="typo-caption1 font-bold uppercase tracking-wide text-text-tertiary">
        {label}
      </span>
      {caption && (
        <span className="typo-caption1 text-text-quaternary">{caption}</span>
      )}
    </div>
    <div className="w-80">{children}</div>
  </div>
);

const StateGroup = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 rounded-12 border border-border-subtlest-tertiary p-5">
    {title && (
      <span className="typo-footnote font-bold uppercase tracking-wide text-accent-cabbage-default">
        {title}
      </span>
    )}
    {children}
  </div>
);

const LivePassword = () => {
  const id = useId();
  return <PasswordField inputId={id} name={id} label="Password" minLength={6} />;
};

const StaticPassword = ({
  level,
  value,
  hint,
  progress,
  hintColor,
}: {
  level: number;
  value: string;
  hint: string;
  progress?: string;
  hintColor: string;
}) => {
  const id = useId();
  return (
    <TextField
      inputId={id}
      name={id}
      type="password"
      label="Password"
      value={value}
      leftIcon={<LockIcon size={IconSize.Small} />}
      hint={hint}
      progress={progress}
      className={{ baseField: `password-${level}`, hint: hintColor }}
      actionButton={
        <button type="button" aria-label="Toggle password visibility">
          <EyeIcon className="text-text-secondary" />
        </button>
      }
    />
  );
};

const LiveSearch = (
  props: Omit<React.ComponentProps<typeof SearchField>, 'inputId'>,
) => {
  const id = useId();
  return <SearchField inputId={id} {...props} />;
};

/**
 * Every state of the core text input on one page — rest, hover, focus, filled,
 * invalid (+ focused), required, read-only, disabled — plus every affordance
 * (icons, action button, char counter, hint).
 */
export const TextFieldStates: Story = {
  name: 'TextField · states',
  render: () => (
    <Page>
      <Section
        title="TextField — every state"
        description="Focus and validity use the same 1px border mechanism: text-primary on focus, red on error, blue on a focused read-only field. Hover/focus rows are forced for the snapshot; every field is still live."
      >
        <StateGroup title="Core states">
          <StateRow label="Rest" caption="empty">
            <NewField fieldType="tertiary" label="Email" />
          </StateRow>
          <StateRow label="Hover" caption="surface layer">
            <NewField
              fieldType="tertiary"
              label="Email"
              className={{ baseField: '!bg-surface-hover' }}
            />
          </StateRow>
          <StateRow label="Focused" caption="text-primary border">
            <NewField fieldType="tertiary" label="Email" focused />
          </StateRow>
          <StateRow label="Filled" caption="has value">
            <NewField fieldType="tertiary" label="Email" value="ido@daily.dev" />
          </StateRow>
          <StateRow label="Invalid" caption="red border">
            <NewField
              fieldType="tertiary"
              label="Email"
              value="not-an-email"
              valid={false}
              hint="Enter a valid email"
            />
          </StateRow>
          <StateRow label="Invalid + focused">
            <NewField
              fieldType="tertiary"
              label="Email"
              value="not-an-email"
              valid={false}
              focused
              hint="Enter a valid email"
            />
          </StateRow>
          <StateRow label="Required" caption="failed validation">
            <NewField
              fieldType="tertiary"
              label="Email"
              required
              valid={false}
              hint="This field is required"
            />
          </StateRow>
          <StateRow label="Read-only">
            <NewField
              fieldType="tertiary"
              label="Email"
              value="ido@daily.dev"
              readOnly
            />
          </StateRow>
          <StateRow label="Read-only focused" caption="blue border">
            <NewField
              fieldType="tertiary"
              label="Email"
              value="ido@daily.dev"
              readOnly
              focused
            />
          </StateRow>
          <StateRow label="Disabled" caption="dimmed">
            <NewField
              fieldType="tertiary"
              label="Email"
              value="ido@daily.dev"
              disabled
            />
          </StateRow>
          <StateRow label="Disabled empty">
            <NewField fieldType="tertiary" label="Email" disabled />
          </StateRow>
        </StateGroup>

        <StateGroup title="Affordances">
          <StateRow label="Left icon">
            <NewField
              fieldType="tertiary"
              label="Email"
              leftIcon={<AtIcon size={IconSize.Small} />}
            />
          </StateRow>
          <StateRow label="Right icon">
            <NewField
              fieldType="tertiary"
              label="Search"
              rightIcon={<MagicIcon size={IconSize.Small} />}
            />
          </StateRow>
          <StateRow label="Action button">
            <NewField
              fieldType="tertiary"
              label="Coupon code"
              actionButton={
                <Button size={ButtonSize.XSmall} variant={ButtonVariant.Primary}>
                  Apply
                </Button>
              }
            />
          </StateRow>
          <StateRow label="Char counter">
            <NewField
              fieldType="tertiary"
              label="Headline"
              maxLength={40}
              value="A short headline"
            />
          </StateRow>
          <StateRow label="Hint" caption="helper text">
            <NewField
              fieldType="tertiary"
              label="Email"
              hint="We'll never share it."
            />
          </StateRow>
        </StateGroup>
      </Section>
    </Page>
  ),
};

/** The three label behaviours, each across rest / focus / filled / invalid. */
export const FieldTypes: Story = {
  name: 'TextField · field types',
  render: () => (
    <Page>
      <Section
        title="Field types"
        description="primary floats the label once filled, secondary keeps an outer label, tertiary uses the label as the placeholder."
      >
        {(['primary', 'secondary', 'tertiary'] as const).map((ft) => (
          <StateGroup key={ft} title={ft}>
            <StateRow label="Rest">
              <NewField fieldType={ft} label="Full name" placeholder="Jane Doe" />
            </StateRow>
            <StateRow label="Focused">
              <NewField
                fieldType={ft}
                label="Full name"
                placeholder="Jane Doe"
                focused
              />
            </StateRow>
            <StateRow label="Filled">
              <NewField fieldType={ft} label="Full name" value="Jane Doe" />
            </StateRow>
            <StateRow label="Invalid">
              <NewField
                fieldType={ft}
                label="Full name"
                value="x"
                valid={false}
                hint="Too short"
              />
            </StateRow>
          </StateGroup>
        ))}
      </Section>
    </Page>
  ),
};

/** Filled vs Outline background treatments across the key states. */
export const Variants: Story = {
  name: 'TextField · variants',
  render: () => (
    <Page>
      <Section
        title="Variants × states"
        description="Filled sits on the floated surface; Outline is transparent and defined by its border alone. Both share the faint resting border and the same focus/validity borders."
      >
        {[
          { variant: FieldVariant.Filled, title: 'Filled' },
          { variant: FieldVariant.Outline, title: 'Outline' },
        ].map(({ variant, title }) => (
          <StateGroup key={title} title={title}>
            <StateRow label="Rest">
              <NewField
                variant={variant}
                fieldType="tertiary"
                label="Email"
                leftIcon={<AtIcon size={IconSize.Small} />}
              />
            </StateRow>
            <StateRow label="Focused">
              <NewField
                variant={variant}
                fieldType="tertiary"
                label="Email"
                leftIcon={<AtIcon size={IconSize.Small} />}
                focused
              />
            </StateRow>
            <StateRow label="Filled">
              <NewField
                variant={variant}
                fieldType="tertiary"
                label="Email"
                value="ido@daily.dev"
              />
            </StateRow>
            <StateRow label="Invalid">
              <NewField
                variant={variant}
                fieldType="tertiary"
                label="Email"
                value="nope"
                valid={false}
                hint="Enter a valid email"
              />
            </StateRow>
            <StateRow label="Disabled">
              <NewField
                variant={variant}
                fieldType="tertiary"
                label="Email"
                value="ido@daily.dev"
                disabled
              />
            </StateRow>
          </StateGroup>
        ))}
      </Section>
    </Page>
  ),
};

/** Every field size, each next to the button of the same size. */
export const Sizes: Story = {
  name: 'TextField · sizes',
  render: () => (
    <Page>
      <Section
        title="Sizes — aligned with buttons"
        description="A field and a button of the same size share height, corner radius and icon size, so they line up pixel-for-pixel in a strip."
      >
        <div className="flex flex-col gap-4">
          {(
            [
              [FieldSize.XLarge, ButtonSize.XLarge, 'XLarge'],
              [FieldSize.Large, ButtonSize.Large, 'Large'],
              [FieldSize.Medium, ButtonSize.Medium, 'Medium'],
              [FieldSize.Small, ButtonSize.Small, 'Small'],
              [FieldSize.XSmall, ButtonSize.XSmall, 'XSmall'],
            ] as const
          ).map(([fs, bs, label]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-16 typo-caption1 uppercase tracking-wide text-text-quaternary">
                {label}
              </span>
              <NewField
                fieldSize={fs}
                fieldType="tertiary"
                label="Email"
                leftIcon={<AtIcon />}
                className={{ container: 'flex-1' }}
              />
              <Button size={bs} variant={ButtonVariant.Primary}>
                Subscribe
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

/** Password strength ladder (static previews) plus the live, interactive field. */
export const PasswordStates: Story = {
  name: 'PasswordField · states',
  render: () => (
    <Page>
      <Section
        title="Password — strength & visibility"
        description="Strength uses the left-edge colour-graded indicator, a coloured hint and a progress bar (a progress cue, not a validity cue). A too-short password is invalid and gets the red border like any other field."
      >
        <StateGroup title="Strength ladder">
          <StateRow label="Rest" caption="empty">
            <NewField
              type="password"
              label="Password"
              leftIcon={<LockIcon size={IconSize.Small} />}
              actionButton={
                <button type="button" aria-label="Toggle password visibility">
                  <EyeIcon className="text-text-secondary" />
                </button>
              }
            />
          </StateRow>
          <StateRow label="Risky" caption="level 0–1">
            <StaticPassword
              level={0}
              value="abcdef"
              hint="Risky"
              progress="bg-status-error w-1/6"
              hintColor="text-status-error"
            />
          </StateRow>
          <StateRow label="Almost" caption="level 2">
            <StaticPassword
              level={2}
              value="abcd1234"
              hint="You're almost there"
              progress="bg-status-warning w-1/4"
              hintColor="text-status-warning"
            />
          </StateRow>
          <StateRow label="Strong" caption="level 3">
            <StaticPassword
              level={3}
              value="Str0ng!Pass#2026"
              hint="Strong as it gets"
              progress="bg-status-success w-1/2"
              hintColor="text-status-success"
            />
          </StateRow>
          <StateRow label="Invalid" caption="too short → red border">
            <NewField
              type="password"
              label="Password"
              value="ab"
              valid={false}
              leftIcon={<LockIcon size={IconSize.Small} />}
              hint="Password needs a minimum length of 6"
            />
          </StateRow>
        </StateGroup>
        <StateGroup title="Live">
          <StateRow label="Live field" caption="type to see it light up">
            <LivePassword />
          </StateRow>
        </StateGroup>
      </Section>
    </Page>
  ),
};

/** Search field across states, sizes and the primary/secondary variants. */
export const SearchStates: Story = {
  name: 'SearchField · states',
  render: () => (
    <Page>
      <Section
        title="Search — states, sizes & variants"
        description="The search field shares the field border and surface. Primary shows an inline clear button when filled; secondary shows a submit affordance."
      >
        <StateGroup title="Primary · large">
          <StateRow label="Rest">
            <LiveSearch placeholder="Search" />
          </StateRow>
          <StateRow label="With value" caption="clear button">
            <LiveSearch value="react" />
          </StateRow>
          <StateRow label="Disabled" caption="dimmed">
            <LiveSearch placeholder="Search" disabled />
          </StateRow>
        </StateGroup>
        <StateGroup title="Sizes">
          <StateRow label="Large">
            <LiveSearch placeholder="Search" fieldSize="large" />
          </StateRow>
          <StateRow label="Medium">
            <LiveSearch placeholder="Search" fieldSize="medium" />
          </StateRow>
        </StateGroup>
        <StateGroup title="Secondary">
          <StateRow label="Rest" caption="submit button">
            <LiveSearch placeholder="Search" fieldType="secondary" />
          </StateRow>
          <StateRow label="With value">
            <LiveSearch value="typescript" fieldType="secondary" />
          </StateRow>
        </StateGroup>
      </Section>
    </Page>
  ),
};

/** Textarea across rest / focus / filled / invalid / disabled / read-only. */
export const TextareaStates: Story = {
  name: 'Textarea · states',
  render: () => (
    <Page>
      <Section
        title="Textarea — states"
        description="Same border language as the inputs (focus, red error border, dimmed disabled) with a built-in character counter."
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          <Card label="Rest">
            <LiveTextarea
              fieldType="tertiary"
              label="Tell us about yourself"
              rows={3}
            />
          </Card>
          <Card label="Focused">
            <LiveTextarea
              fieldType="tertiary"
              label="Tell us about yourself"
              rows={3}
              className={{ baseField: 'focused' }}
            />
          </Card>
          <Card label="Filled">
            <LiveTextarea
              fieldType="tertiary"
              label="Bio"
              rows={3}
              value="Frontend engineer who loves a tidy design system."
            />
          </Card>
          <Card label="Invalid">
            <LiveTextarea
              fieldType="tertiary"
              label="Bio"
              rows={3}
              value="too short"
              valid={false}
              hint="Tell us a little more"
            />
          </Card>
          <Card label="Disabled">
            <LiveTextarea
              fieldType="tertiary"
              label="Bio"
              rows={3}
              value="Read-only content"
              disabled
            />
          </Card>
          <Card label="Read-only">
            <LiveTextarea
              fieldType="tertiary"
              label="Bio"
              rows={3}
              value="Read-only content"
              readOnly
            />
          </Card>
        </div>
      </Section>
    </Page>
  ),
};

/** Dropdown trigger states + sizes. Click any trigger to review the popover. */
export const DropdownStates: Story = {
  name: 'Dropdown · states',
  render: () => (
    <Page>
      <Section
        title="Dropdown — trigger states"
        description="Click any trigger to review the popover (rounded-14 card, inset rows, smooth highlight). The trigger shares the field border and surface."
      >
        <div className="flex flex-wrap gap-6">
          <div className="flex w-64 flex-col gap-2">
            <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
              Placeholder
            </span>
            <Dropdown
              placeholder="Pick a topic"
              selectedIndex={-1}
              options={topics}
              onChange={() => {}}
              buttonSize={ButtonSize.Large}
              className={dropdownTrigger('bg-surface-float')}
            />
          </div>
          <div className="flex w-64 flex-col gap-2">
            <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
              Selected · filled
            </span>
            <Dropdown
              selectedIndex={1}
              options={topics}
              onChange={() => {}}
              buttonSize={ButtonSize.Large}
              className={dropdownTrigger('bg-surface-float')}
            />
          </div>
          <div className="flex w-64 flex-col gap-2">
            <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
              Selected · outline
            </span>
            <Dropdown
              selectedIndex={2}
              options={topics}
              onChange={() => {}}
              buttonSize={ButtonSize.Large}
              className={dropdownTrigger()}
            />
          </div>
          <div className="flex w-64 flex-col gap-2">
            <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
              Disabled
            </span>
            <Dropdown
              placeholder="Pick a topic"
              selectedIndex={-1}
              options={topics}
              onChange={() => {}}
              disabled
              buttonSize={ButtonSize.Large}
              className={dropdownTrigger('bg-surface-float')}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Dropdown sizes"
        description="The trigger uses the button size scale, so dropdowns line up with buttons and fields of the same size."
      >
        <div className="flex flex-col gap-4">
          {(
            [
              [ButtonSize.Large, 'Large'],
              [ButtonSize.Medium, 'Medium'],
              [ButtonSize.Small, 'Small'],
            ] as const
          ).map(([bs, label]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-16 typo-caption1 uppercase tracking-wide text-text-quaternary">
                {label}
              </span>
              <Dropdown
                selectedIndex={0}
                options={topics}
                onChange={() => {}}
                buttonSize={bs}
                className={dropdownTrigger('bg-surface-float')}
              />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
