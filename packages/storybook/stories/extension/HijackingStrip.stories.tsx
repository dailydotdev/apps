import React from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HijackingVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import HijackingLoginStrip from 'extension/src/newtab/HijackingLoginStrip';
import ExtensionProviders from './_providers';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';
import { MockFeedGrid } from './_mockFeed';

// =============================================================
// The extension new-tab "hijacking" strip, one story per arm of
// `hijacking_variants3`, each rendered above a fake feed so the
// strip is judged in context. The cover arms pin while the feed
// scrolls: `cover` sticks to the top, `cover_bottom` floats
// fixed at the bottom of the viewport.
// =============================================================

const ARM_NOTES: Record<HijackingVariant, string> = {
  [HijackingVariant.Default]: 'control — left-aligned, cat',
  [HijackingVariant.CTA]: 'cat stage hero — dual CTA, hands off to webapp',
  [HijackingVariant.Auth]: 'previous winner — centered, inline auth',
  [HijackingVariant.Cover]: 'new — homepage cover art, sticky at the top',
  [HijackingVariant.CoverBottom]:
    'new — same cover card, pinned to the viewport bottom',
};

type StripInFeedProps = {
  variant: HijackingVariant;
  showFeed: boolean;
};

const StripInFeed = ({ variant, showFeed }: StripInFeedProps): ReactElement => (
  <ExtensionProviders anonymous>
    <FeatureOverrides values={{ hijacking_variants3: variant }}>
      <div className="dark min-h-dvh bg-background-default p-6">
        <p className="mb-4 text-text-tertiary typo-footnote">
          <strong className="text-text-secondary">{variant}</strong> —{' '}
          {ARM_NOTES[variant]}
        </p>
        {/* One shared column wraps strip + cards, mirroring the real feed
            container, so `position: sticky` on the strip behaves as it does
            in the extension. */}
        <div className="relative mx-auto max-w-[60rem]">
          <HijackingLoginStrip />
          {showFeed && <MockFeedGrid />}
        </div>
      </div>
    </FeatureOverrides>
  </ExtensionProviders>
);

const meta: Meta<typeof StripInFeed> = {
  title: 'Extension/HijackingStrip',
  component: StripInFeed,
  parameters: {
    layout: 'fullscreen',
    themes: { themeOverride: 'dark' },
  },
  args: {
    showFeed: true,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(HijackingVariant),
    },
  },
};

export default meta;

type Story = StoryObj<typeof StripInFeed>;

/** The new arm: homepage cover art, sticky at the top of the feed. */
export const Cover: Story = {
  args: { variant: HijackingVariant.Cover },
};

/** The new arm's sibling: the cover card fixed at the viewport bottom. */
export const CoverBottom: Story = {
  args: { variant: HijackingVariant.CoverBottom },
};

/** The previous experiment winner: centered inline-auth hero. */
export const AuthPreviousWinner: Story = {
  args: { variant: HijackingVariant.Auth },
};

/** Reference: the cat stage hero (dual CTA, webapp handoff). */
export const CatCta: Story = {
  args: { variant: HijackingVariant.CTA },
};

/** Reference: the original control strip. */
export const Control: Story = {
  args: { variant: HijackingVariant.Default },
};

/** The new arm in isolation, no feed — for tight visual tweaks. */
export const CoverAlone: Story = {
  args: { variant: HijackingVariant.Cover, showFeed: false },
};
