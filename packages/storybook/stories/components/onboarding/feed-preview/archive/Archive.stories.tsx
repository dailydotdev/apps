import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import type { PreviewArgs } from '../storyHarness';
import { baseMeta, variantStory } from '../storyHarness';
import { PhoneFrames } from '../PhoneFrames';
import { FeedPreviewOverview } from './FeedPreviewOverview';
import { SplitView } from './variants/SplitView';
import { PeekSheet } from './variants/PeekSheet';
import { ByTag } from './variants/ByTag';
import { RealCards } from './variants/RealCards';
import { AutoStrip } from './variants/AutoStrip';
import { TagPeek } from './variants/TagPeek';
import { PickToasts } from './variants/PickToasts';
import { PhoneMock } from './variants/PhoneMock';
import { FirstEdition } from './variants/FirstEdition';
import { SwipeTune } from './variants/SwipeTune';
import { YouVsEveryone } from './variants/YouVsEveryone';
import { FeedMix } from './variants/FeedMix';
import { NowPlaying } from './variants/NowPlaying';
import { TomorrowMorning } from './variants/TomorrowMorning';

// Rounds one and two, kept for reference. A, F and O moved on to Finalists.
const meta: Meta<PreviewArgs> = {
  ...baseMeta,
  title: 'Components/Onboarding/Feed preview/Archive',
};

export default meta;

type Story = StoryObj<PreviewArgs>;

export const Research: Story = {
  name: 'Research and rounds 1–2',
  parameters: { controls: { disable: true } },
  render: () => <FeedPreviewOverview />,
};

export const B: Story = variantStory('B · Split view', SplitView);
export const C: Story = variantStory('C · Peek sheet', PeekSheet);
export const D: Story = variantStory('D · By tag', ByTag);
export const E: Story = variantStory('E · Real cards, contained', RealCards);
export const F: Story = variantStory('F (round 1) · Trending strip', AutoStrip);
export const G: Story = variantStory('G · Tag peek', TagPeek);
export const H: Story = variantStory('H · Pick toasts', PickToasts);
export const I: Story = variantStory('I · On your phone', PhoneMock);
export const J: Story = variantStory('J · First edition', FirstEdition);
export const K: Story = variantStory('K · Swipe to tune', SwipeTune);
export const L: Story = variantStory('L · You vs everyone', YouVsEveryone);
export const M: Story = variantStory('M · Feed mix', FeedMix);
export const N: Story = variantStory('N · Now playing', NowPlaying);
export const P: Story = variantStory('P · Tomorrow morning', TomorrowMorning);

export const OnAPhone: Story = {
  name: 'Every archived variant on a phone',
  parameters: { controls: { disable: true } },
  render: () => (
    <PhoneFrames
      description="390px, five tags picked, preview open. B and I are laptop layouts that show A on phones, so they are left out here. Each frame scrolls."
      frames={[
        { id: 'c', label: 'C · Peek sheet' },
        { id: 'd', label: 'D · By tag' },
        { id: 'e', label: 'E · Real cards' },
        { id: 'f', label: 'F (round 1) · Trending strip' },
        { id: 'g', label: 'G · Tag peek' },
        { id: 'h', label: 'H · Pick toasts' },
        { id: 'j', label: 'J · First edition' },
        { id: 'k', label: 'K · Swipe to tune' },
        { id: 'l', label: 'L · You vs everyone' },
        { id: 'm', label: 'M · Feed mix' },
        { id: 'n', label: 'N · Now playing' },
        { id: 'p', label: 'P · Tomorrow morning' },
      ]}
      storyPrefix="components-onboarding-feed-preview-archive"
      title="Every archived variant on a phone"
    />
  ),
};
