import type { Meta } from '@storybook/react-vite';
import type { FrameArgs, VariantInfo } from './frame';
import { frameMetaBase, variantStory } from './frame';
import { VariantList } from './VariantList';
import { VariantCards } from './VariantCards';
import { VariantFocus } from './VariantFocus';
import { VariantJourney } from './VariantJourney';
import { VariantPopover } from './VariantPopover';

const meta: Meta<FrameArgs> = {
  title: 'Intro Quests/2. Variations',
  ...frameMetaBase,
};

export default meta;

const variant = (info: Omit<VariantInfo, 'label'> & { letter: string }) =>
  variantStory({ ...info, label: `Variation ${info.letter}` });

export const ActionList = variant({
  letter: 'A',
  name: 'Action list',
  thesis:
    'The smallest step from today. One column, but every row carries its real verb as a button, the whole row is the hit area, and finished steps fold away so the list only shows what is left.',
  tryThis: [
    'Click "Turn on": the browser prompt opens right here, no settings page',
    'Click anywhere on the profile row: it fills the next missing field',
    'Finish two steps to see "Claim all"',
  ],
  Component: VariantList,
});

export const ActionCards = variant({
  letter: 'B',
  name: 'Action cards',
  thesis:
    'The giveback "Take action" grammar. A board of tiles with the payout set big in the corner and a full width button at the foot. The two API steps share one wide card because the second only exists after the first.',
  tryThis: [
    'Only the next step gets the solid button; the rest stay secondary',
    'Create the key, then copy the command: the second step unlocks',
    'Done tiles keep their place with a dashed edge',
  ],
  Component: VariantCards,
});

export const OneStepAtATime = variant({
  letter: 'C',
  name: 'One step at a time',
  thesis:
    'One quest owns the popup: big icon, one sentence on why, the inline action, one large button. Claiming moves to the next open step on its own, so the set can be cleared without choosing what to do.',
  tryThis: [
    'Claim a step and watch it advance by itself',
    'Use the icon chips at the bottom to jump around',
    '"Skip for now" never dead ends',
  ],
  Component: VariantFocus,
});

export const JourneyTrail = variant({
  letter: 'D',
  name: 'Journey trail',
  thesis:
    'The giveback reward ladder applied to setup. Green is done, your photo marks where you are, gray is ahead, gold appears once at the summit. "Joined daily.dev" starts checked so nobody opens it at zero.',
  tryThis: [
    'The step you are on is the only one expanded',
    'Click any other step to open it instead',
    'Switch to "Two done, one to claim" to see the trail fill',
  ],
  Component: VariantJourney,
});

export const HeaderPopover = variant({
  letter: 'E',
  name: 'Header popover, grouped',
  thesis:
    'Setup should not cost a modal. This drops out of the header button that opened it and leaves the feed visible. Quests are grouped by what they get you, the API pair is labeled optional, and one-click quests keep their button on the collapsed row.',
  tryThis: [
    'The header button ring fills as you go',
    'Collapsed rows still act: "Add to Chrome" works without expanding',
    'Try "Notifications blocked" for the recovery state',
  ],
  Component: VariantPopover,
  placement: 'popover',
});
