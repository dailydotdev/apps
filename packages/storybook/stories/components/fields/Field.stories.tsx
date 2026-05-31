import React, { useId } from 'react';
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
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { LegacyTextField } from './legacy/LegacyTextField';

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
      A side-by-side review of the previous fields and the redesigned fields.
      The new fields share their motion, focus ring and sizing language with the
      redesigned Toggle and the Button system — a field and a button of the same
      size line up pixel-for-pixel. Every field on this page is live: click to
      focus, type, hover, and tab to verify the states and interactions. Use the
      theme toolbar to check light and dark.
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

// --- Stories ---------------------------------------------------------------

/**
 * The headline comparison: previous design on the left, redesign on the right,
 * across the core text input states. Hover / focus are live on every field.
 */
export const Comparison: Story = {
  render: () => (
    <Page>
      <PageHeader />

      <Section
        title="States"
        description="Same props on the previous field (left) and the new field (right). The new field swaps the left-edge accent bar for a crisp, even ring and adds smooth surface transitions."
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
            caption="error ring"
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
            title="Disabled"
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
        title="Variants"
        description="Every field now carries a faint resting border so fields are delineated from the page. Filled sits on the floated surface; Outline is transparent and defined by its border alone (with a faint hover fill), mirroring the Subtle/Secondary button look."
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
        title="Dropdown & textarea"
        description="The dropdown field and its popover are part of the family: faint border on the trigger, and a polished popover (rounded-14 card, inset items, smooth highlight). Click the dropdown to review the popover."
      >
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex w-72 flex-col gap-2">
            <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
              Dropdown · filled
            </span>
            <Dropdown
              placeholder="Pick a topic"
              selectedIndex={-1}
              options={['Frontend', 'Backend', 'AI', 'DevOps', 'Career']}
              onChange={() => {}}
              buttonSize={ButtonSize.Large}
              className={{
                button:
                  'border border-border-subtlest-tertiary bg-surface-float',
              }}
            />
          </div>
          <div className="flex w-72 flex-col gap-2">
            <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
              Dropdown · outline
            </span>
            <Dropdown
              placeholder="Pick a topic"
              selectedIndex={1}
              options={['Frontend', 'Backend', 'AI', 'DevOps', 'Career']}
              onChange={() => {}}
              buttonSize={ButtonSize.Large}
              className={{
                button: 'border border-border-subtlest-tertiary',
              }}
            />
          </div>
          <div className="flex w-96 flex-col gap-2">
            <span className="typo-caption1 uppercase tracking-wide text-text-quaternary">
              Textarea
            </span>
            <Textarea
              inputId="textarea-showcase"
              name="textarea-showcase"
              label="Tell us more"
              placeholder="Share the details…"
              rows={3}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Size alignment with buttons"
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
        description="Hover to reveal the surface layer, click to focus the even ring, and type to see the value styling."
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
