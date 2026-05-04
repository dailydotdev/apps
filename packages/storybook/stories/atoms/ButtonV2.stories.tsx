import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ButtonV2 } from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { ColorName as ButtonColor } from '@dailydotdev/shared/src/styles/colors';
import {
  PlusIcon,
  ShareIcon,
  StarIcon,
} from '@dailydotdev/shared/src/components/icons';

const meta: Meta<typeof ButtonV2> = {
  title: 'Atoms/ButtonV2',
  component: ButtonV2,
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(ButtonVariant),
    },
    size: {
      control: { type: 'select' },
      options: Object.values(ButtonSize),
    },
    color: {
      control: { type: 'select' },
      options: [undefined, ...Object.values(ButtonColor)],
    },
    disabled: { control: 'boolean' },
    inactive: { control: 'boolean' },
    loading: { control: 'boolean' },
    bold: { control: 'boolean' },
    useDefaultCursor: { control: 'boolean' },
    iconPosition: {
      control: { type: 'inline-radio' },
      options: Object.values(ButtonIconPosition),
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ButtonV2>;

const PrimaryColors: Array<ButtonColor | undefined> = [
  undefined,
  ButtonColor.Cabbage,
  ButtonColor.BlueCheese,
  ButtonColor.Avocado,
  ButtonColor.Bun,
  ButtonColor.Ketchup,
];

const STATE_LABELS = [
  'Default',
  'Hover',
  'Focus-visible',
  'Active',
  'Disabled',
  'Inactive',
  'Loading',
] as const;

type StateProps = {
  hoverClass?: string;
  activeClass?: string;
  focusClass?: string;
  disabled?: boolean;
  inactive?: boolean;
  loading?: boolean;
};

const stateProps: Record<(typeof STATE_LABELS)[number], StateProps> = {
  Default: {},
  Hover: { hoverClass: 'hover' },
  'Focus-visible': { focusClass: 'focus-visible' },
  Active: { activeClass: 'active' },
  Disabled: { disabled: true },
  Inactive: { inactive: true },
  Loading: { loading: true },
};

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-12 items-center justify-center px-2 py-2">
    {children}
  </div>
);

const RowHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center px-2 py-2 typo-caption1 text-text-tertiary">
    {children}
  </div>
);

const ColumnHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center px-2 py-2 typo-caption1 font-bold text-text-primary">
    {children}
  </div>
);

/**
 * Headline story — every variant in every state, OLD next to NEW.
 *
 * Reads top-to-bottom so design/PM can scan diffs in one column.
 */
export const States: Story = {
  name: 'States — OLD vs NEW per variant',
  render: () => (
    <div className="flex flex-col gap-8">
      {Object.values(ButtonVariant).map((variant) => (
        <section
          key={variant}
          className="rounded-12 border border-border-subtlest-tertiary p-4"
        >
          <header className="mb-3 flex items-baseline gap-2">
            <h3 className="typo-callout font-bold text-text-primary">
              {variant}
            </h3>
            <span className="typo-caption1 text-text-tertiary">
              variant
            </span>
          </header>
          <div className="grid grid-cols-[120px_1fr_1fr] gap-1">
            <RowHeader>State</RowHeader>
            <ColumnHeader>OLD `Button`</ColumnHeader>
            <ColumnHeader>NEW `ButtonV2`</ColumnHeader>
            {STATE_LABELS.map((state) => {
              const sp = stateProps[state];
              const oldClasses = [
                sp.hoverClass && 'hover',
                sp.activeClass && 'active',
                sp.focusClass && 'focus-visible',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <React.Fragment key={state}>
                  <RowHeader>{state}</RowHeader>
                  <Cell>
                    <Button
                      variant={variant}
                      disabled={sp.disabled}
                      loading={sp.loading}
                      className={oldClasses || undefined}
                    >
                      {state}
                    </Button>
                  </Cell>
                  <Cell>
                    <ButtonV2
                      variant={variant}
                      disabled={sp.disabled}
                      inactive={sp.inactive}
                      loading={sp.loading}
                      className={oldClasses || undefined}
                    >
                      {state}
                    </ButtonV2>
                  </Cell>
                </React.Fragment>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  name: 'Variants × Color',
  render: () => (
    <div className="space-y-6">
      {Object.values(ButtonVariant).map((variant) => (
        <section key={variant}>
          <header className="mb-2 typo-callout font-bold text-text-primary">
            {variant}
          </header>
          <div className="flex flex-wrap gap-3">
            <ButtonV2 variant={variant}>No color</ButtonV2>
            {PrimaryColors.filter(Boolean).map((color) =>
              variant === ButtonVariant.Quiz ? null : (
                <ButtonV2
                  key={color as string}
                  variant={variant}
                  color={color as ButtonColor}
                >
                  {color as string}
                </ButtonV2>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Sizes — text + icon',
  render: () => (
    <div className="space-y-8">
      {Object.values(ButtonVariant).map((variant) => (
        <section key={variant}>
          <header className="mb-2 typo-callout font-bold text-text-primary">
            {variant}
          </header>
          <div className="flex flex-wrap items-center gap-3">
            {Object.values(ButtonSize).map((size) => (
              <ButtonV2 key={size} variant={variant} size={size}>
                {size}
              </ButtonV2>
            ))}
            {Object.values(ButtonSize).map((size) => (
              <ButtonV2
                key={`icon-${size}`}
                variant={variant}
                size={size}
                icon={<ShareIcon />}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

/**
 * House rule: "always rectangle with corner radius". No oval pills.
 * Chips/tags are just XSmall/Small buttons reusing the same radius
 * scale so the entire interface keeps a single corner-language.
 */
export const Chips: Story = {
  name: 'Chips & tags — rectangle with corner radius',
  render: () => (
    <div className="space-y-6">
      <section>
        <header className="mb-2 typo-callout font-bold text-text-primary">
          Filter chips (Float, Small) — `rounded-10`
        </header>
        <div className="flex flex-wrap gap-2">
          {['React', 'TypeScript', 'Rust', 'AI', 'Frontend'].map((tag) => (
            <ButtonV2
              key={tag}
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              {tag}
            </ButtonV2>
          ))}
        </div>
      </section>
      <section>
        <header className="mb-2 typo-callout font-bold text-text-primary">
          Tag pills (Subtle, XSmall) — `rounded-8`
        </header>
        <div className="flex flex-wrap gap-2">
          {['Beta', 'New', 'Pro', 'Soon'].map((tag) => (
            <ButtonV2
              key={tag}
              variant={ButtonVariant.Subtle}
              size={ButtonSize.XSmall}
              color={ButtonColor.Cabbage}
            >
              {tag}
            </ButtonV2>
          ))}
        </div>
      </section>
    </div>
  ),
};

export const Hierarchy: Story = {
  name: 'Hierarchy — real layout vignettes',
  render: () => (
    <div className="space-y-6">
      {/* Modal footer — Primary + Secondary */}
      <section className="rounded-12 border border-border-subtlest-tertiary bg-background-default p-4">
        <header className="mb-3 typo-caption1 text-text-tertiary">
          Modal footer
        </header>
        <div className="flex justify-end gap-2">
          <ButtonV2 variant={ButtonVariant.Float}>Cancel</ButtonV2>
          <ButtonV2
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
          >
            Save changes
          </ButtonV2>
        </div>
      </section>

      {/* Card actions — Tertiary icon row */}
      <section className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
        <header className="mb-3 typo-caption1 text-text-tertiary">
          Card actions
        </header>
        <div className="flex gap-1">
          <ButtonV2
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ShareIcon />}
          >
            Share
          </ButtonV2>
          <ButtonV2
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<StarIcon />}
          >
            Bookmark
          </ButtonV2>
        </div>
      </section>

      {/* Toolbar — Float icon-only */}
      <section className="rounded-12 border border-border-subtlest-tertiary bg-background-default p-4">
        <header className="mb-3 typo-caption1 text-text-tertiary">
          Toolbar (icon-only Float)
        </header>
        <div className="flex gap-1">
          <ButtonV2
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            icon={<PlusIcon />}
          />
          <ButtonV2
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            icon={<ShareIcon />}
          />
          <ButtonV2
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            icon={<StarIcon />}
          />
        </div>
      </section>
    </div>
  ),
};

export const InspirationAnchors: Story = {
  name: 'Inspiration anchors — DNA reference',
  render: () => (
    <div className="space-y-4">
      <p className="typo-callout text-text-secondary">
        Each row shows the same idea translated to our system.
        Use these as the visual North Stars when reviewing.
      </p>
      <table className="w-full table-fixed border-separate border-spacing-y-3">
        <thead>
          <tr className="text-left typo-caption1 text-text-tertiary">
            <th className="w-32">Inspired by</th>
            <th>Trait</th>
            <th>Our take (`ButtonV2`)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="typo-callout font-bold text-text-primary">
              Linear
            </td>
            <td className="typo-callout text-text-secondary">
              Tight 6 px radius, ring + subtle lift on hover, ghost is
              first-class.
            </td>
            <td>
              <ButtonV2 variant={ButtonVariant.Tertiary}>Ghost label</ButtonV2>
            </td>
          </tr>
          <tr>
            <td className="typo-callout font-bold text-text-primary">
              Notion
            </td>
            <td className="typo-callout text-text-secondary">
              8 px radius, warm hover bg, no transform — restraint.
            </td>
            <td>
              <ButtonV2 variant={ButtonVariant.Float}>Float button</ButtonV2>
            </td>
          </tr>
          <tr>
            <td className="typo-callout font-bold text-text-primary">
              ChatGPT
            </td>
            <td className="typo-callout text-text-secondary">
              Quiet ghost defaults; semantic intents map to our food
              palette. We keep ChatGPT&apos;s restraint but stay
              rectangular — no oval pills, just a generous radius at
              small sizes.
            </td>
            <td>
              <div className="flex gap-2">
                <ButtonV2
                  variant={ButtonVariant.Primary}
                  color={ButtonColor.Cabbage}
                  size={ButtonSize.Small}
                >
                  Brand CTA
                </ButtonV2>
                <ButtonV2 variant={ButtonVariant.Float} size={ButtonSize.Small}>
                  Ghost chip
                </ButtonV2>
              </div>
            </td>
          </tr>
          <tr>
            <td className="typo-callout font-bold text-text-primary">
              Claude
            </td>
            <td className="typo-callout text-text-secondary">
              Sequential color ladder (60 → 70 → 80) for default → hover
              → active; per-variant focus ring.
            </td>
            <td>
              <ButtonV2
                variant={ButtonVariant.Primary}
                color={ButtonColor.Bun}
              >
                Brand CTA
              </ButtonV2>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

/**
 * Single playground — flip every prop and watch.
 */
export const Playground: Story = {
  args: {
    variant: ButtonVariant.Primary,
    size: ButtonSize.Medium,
    children: 'Click me',
  },
};
