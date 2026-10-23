import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PrototypeArgs } from './checkout/Prototype';
import { Prototype } from './checkout/Prototype';
import { Frame } from './docs/Frame';
import { Stage } from './showcase/Stage';
import {
  BelowFoldShowcase,
  PaymentSideShowcase,
  PreviewChecklist,
  SuccessTour,
  SyncedChecklist,
} from './showcase/variants';

/* Exploration, 14 Oct: PR #6868's animated feature showcase (tabs + scenes)
   placed inside the approved checkout. The approved stories (1–7) are
   untouched; these only plug into optional slots. */

const meta: Meta<PrototypeArgs> = {
  title: 'Plus Checkout/8. Showcase variants',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  // The placements are compared against the static list (B is the default design now).
  args: { cycle: 'annual', entry: 'default', featureList: 'static' },
  argTypes: {
    cycle: { control: 'inline-radio', options: ['annual', 'monthly'] },
    entry: { control: 'select', options: ['default', 'ads', 'brief', 'custom-feed', 'clickbait', 'bookmarks'] },
  },
};

export default meta;

type Story = StoryObj<PrototypeArgs>;

const ID = 'plus-checkout-8-showcase-variants--';

const variants = [
  {
    id: 'a-hover-preview',
    name: 'A · Preview on hover',
    how: 'The checklist stays as approved. Every feature gets a play mark on hover; hovering or focusing one plays its scene in a window that floats over the bill. Tap to pin on touch.',
    cost: 'No height. Hidden until someone looks, so it can’t distract from paying. On phones it opens inline under the list.',
  },
  {
    id: 'b-list-plays',
    name: 'B · The list plays',
    how: 'All ten features have a scene (#6868’s six plus four new ones: API limits, auto-translate, bonus quests, priority support), so every row behaves the same. The scene window always sits under the list and rotates on its own. Hovering (or focusing) a feature shows its scene and holds it while the pointer is on the list; leaving resumes the rotation. The active feature gets a grey highlight that hugs its label (checks stay green), and a progress line runs under it while it plays.',
    cost: '+~240px on the left: at 1280×800 the bill drops below the fold. The liveliest option, the one that most changes the approved screen.',
  },
  {
    id: 'c-below-fold',
    name: 'C · Below the fold',
    how: 'The checkout stays one screen. Scrolling past it shows the full showcase — tabs beside the window — with a “Back to your plan” button.',
    cost: 'Zero change above the fold. Only people who scroll (the unsure ones) see it.',
  },
  {
    id: 'd-signed-out',
    name: 'D · Fills the empty payment half (signed out)',
    how: 'When there is no frame — signed out, or already Plus — the payment half has room. The showcase plays under the sign-in buttons (or under Manage subscription).',
    cost: 'Only in those two states; the buying page is unchanged.',
  },
  {
    id: 'e-success-tour',
    name: 'E · Success tour',
    how: 'After paying: “What just changed”, the same scenes, Briefing first. Turns the demo into onboarding.',
    cost: 'Post-purchase only; no effect on conversion, helps activation.',
  },
];

const Overview = () => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6 text-text-primary">
    <header className="flex max-w-3xl flex-col gap-1.5">
      <h1 className="font-bold typo-title1">The Plus showcase, inside the checkout</h1>
      <p className="typo-callout text-text-tertiary">
        The animated feature tabs from PR #6868 (the in-feed “Upgrade the feed” banner), placed five ways. The approved page in stories 1–7 is unchanged; open each variant to play with it.
      </p>
    </header>
    <section className="flex flex-col gap-3">
      <h2 className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">From the PR, as is</h2>
      <div className="max-w-[56rem]"><Stage /></div>
    </section>
    {variants.map((v) => (
      <section key={v.id} className="grid gap-5 border-t border-border-subtlest-tertiary pt-6 laptop:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold typo-title3">{v.name}</h2>
          <p className="typo-footnote text-text-secondary">{v.how}</p>
          <p className="typo-footnote text-text-tertiary"><b className="text-text-secondary">Cost:</b> {v.cost}</p>
        </div>
        <div className="grid items-start gap-4 tablet:grid-cols-[1fr_12rem]">
          <Frame id={`${ID}${v.id}`} width={1280} height={v.id === 'c-below-fold' ? 1500 : 800} label="Desktop 1280" />
          <Frame id={`${ID}${v.id}`} width={375} height={v.id === 'c-below-fold' ? 2600 : 812} label="Phone 375" />
        </div>
      </section>
    ))}
  </div>
);

export const AllVariants: Story = { name: '★ All variants', render: () => <Overview /> };

export const AHoverPreview: Story = {
  name: 'A · Preview on hover',
  render: (args) => <Prototype {...args} slots={{ features: (s) => <PreviewChecklist state={s} /> }} />,
};

export const BListPlays: Story = {
  name: 'B · The list plays',
  render: (args) => <Prototype {...args} slots={{ features: (s) => <SyncedChecklist state={s} /> }} />,
};

export const CBelowFold: Story = {
  name: 'C · Below the fold',
  render: (args) => <Prototype {...args} slots={{ belowFold: (s) => <BelowFoldShowcase state={s} /> }} />,
};

export const DSignedOut: Story = {
  name: 'D · Payment half, signed out',
  args: { viewer: 'anonymous' },
  render: (args) => <Prototype {...args} slots={{ paymentExtra: (s) => <PaymentSideShowcase state={s} /> }} />,
};

export const DAlreadyPlus: Story = {
  name: 'D · Payment half, already Plus',
  args: { viewer: 'plus' },
  render: (args) => <Prototype {...args} slots={{ paymentExtra: (s) => <PaymentSideShowcase state={s} /> }} />,
};

export const ESuccessTour: Story = {
  name: 'E · Success tour',
  args: { phase: 'success' },
  render: (args) => <Prototype {...args} successExtra={<SuccessTour />} />,
};
