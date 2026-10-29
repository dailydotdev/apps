import type { Meta } from '@storybook/react-vite';
import type { FrameArgs, VariantInfo } from './frame';
import { frameMetaBase, variantStory } from './frame';
import { StampCard } from './round2/StampCard';
import { StrengthMeter } from './round2/StrengthMeter';
import { Chapters } from './round2/Chapters';
import { VisualGuide } from './round2/VisualGuide';
import { PatchyChat } from './round2/PatchyChat';
import { MergeChecks } from './round2/MergeChecks';
import { TerminalInit } from './round2/TerminalInit';
import { FloatingDock } from './round2/FloatingDock';
import { SwipeDeck } from './round2/SwipeDeck';
import { Assembled } from './round2/Assembled';

const meta: Meta<FrameArgs> = {
  title: 'Intro Quests/5. Ten concepts',
  ...frameMetaBase,
};

export default meta;

const concept = (
  number: number,
  info: Omit<VariantInfo, 'label'>,
): ReturnType<typeof variantStory> =>
  variantStory(
    { ...info, label: `Concept ${number}` },
    `${number} · ${info.name}`,
  );

export const Stamp = concept(1, {
  name: 'Stamp card',
  thesis:
    'A loyalty card with eight slots. Two are already stamped for things the user really did at signup, so the head start is honest. Claiming a quest is pressing the stamp, and the headline is how many stamps are left.',
  basedOn:
    'Kivetz 2006: a 12-stamp card with 2 free stamps fills faster than a 10-stamp card, and people speed up near the goal.',
  tryThis: [
    'Tap any slot to pick that quest',
    'Finish a quest, then claim it to see the stamp land',
  ],
  Component: StampCard,
});

export const Strength = concept(2, {
  name: 'Setup strength',
  thesis:
    'A level, not a to-do list. One "next best step" with how much it moves the meter, the rest as smaller ways to level up. Two finish lines (Regular, All-star) before 100%.',
  basedOn:
    'LinkedIn profile strength: tiers, starts above zero, shows how much each step moves the meter, disappears at the goal.',
  tryThis: [
    'The next best step is the biggest mover you have not done',
    'Cross 45% to reach Regular',
  ],
  Component: StrengthMeter,
});

export const ChapterLists = concept(3, {
  name: 'Two chapters',
  thesis:
    'Day one is four essentials. The API pair waits as a locked chapter 2 teaser, so it reads as a reward for finishing instead of more homework.',
  basedOn:
    'Appcues: one long list split into chained short lists took completion from 2% to 25%. Completion drops past 5 items.',
  tryThis: [
    'Pick "One left" or finish the four essentials to unlock chapter 2',
  ],
  Component: Chapters,
});

export const ShowThenDo = concept(4, {
  name: 'Show, then do',
  thesis:
    'One step open at a time with a live picture of the result beside it. The profile card fills in field by field, the new tab turns into your feed, the terminal prints the response.',
  basedOn:
    'Shopify setup guide: expandable steps, an illustration per step, steps that mark themselves done.',
  tryThis: [
    'Click "Add headline" and watch the profile card on the right',
    'Create the key, copy the command, see the JSON land',
  ],
  Component: VisualGuide,
});

export const Patchy = concept(5, {
  name: 'Patchy walks you through it',
  thesis:
    'A chat with the mascot. One ask at a time, the button lives inside his message, your answer shows up as your reply, and "Later" is always one tap away.',
  basedOn:
    'Slackbot: learn the product by doing a real thing in the conversation. Duolingo: the mascot carries the voice.',
  tryThis: ['Say "Later" a few times, then go back through the skipped ones'],
  Component: PatchyChat,
});

export const Merge = concept(6, {
  name: 'Merge your setup',
  thesis:
    'Setup as a pull request into your own daily.dev. Four required checks, two optional, and a merge button that turns green when the required ones pass. Merging claims everything at once.',
  basedOn:
    'GitHub PR checks, the most familiar progress UI a developer has. Required vs optional solves "are the API quests homework?"',
  tryThis: [
    'Open "Fix" on a check to do it in place',
    'Merge unlocks when the four required checks pass',
  ],
  Component: MergeChecks,
});

export const Terminal = concept(7, {
  name: 'npx daily init',
  thesis:
    'Setup reads like an install script: one question at a time, it prints what it did and keeps going. Y and n work on the keyboard. The API steps finally feel at home.',
  basedOn:
    'Developer onboarding guidance: get to "Hello World" fast, copy-paste first. A CLI prompt is the most native shape for one question at a time.',
  tryThis: ['Press Y or n on your keyboard', 'Skip a step, then "Run again"'],
  Component: TerminalInit,
});

export const Dock = concept(8, {
  name: 'Floating dock',
  thesis:
    'Setup that never blocks the feed. A launcher in the corner opens over the page, minimizes to a progress pill and stays while you read. "Remind me tomorrow" instead of a dead end.',
  basedOn:
    'Intercom and Appcues checklist launchers. Apple "Finish setting up": skipped steps wait, they do not vanish.',
  tryThis: ['Minimize it and reopen from the pill', 'The ring fills as you go'],
  Component: FloatingDock,
  placement: 'dock',
});

export const Deck = concept(9, {
  name: 'The deck',
  thesis:
    'A stack of cards with one decision on top: do it, or send it to the back. Each card shows what you get. Drag left to defer; deferred cards come back with a "Saved for later" tag.',
  basedOn:
    'Hick’s law: one prominent next action beats a list of six. Card stacks are the native one-decision shape on a phone.',
  tryThis: ['Drag the top card to the left', 'Switch device to mobile'],
  Component: SwipeDeck,
});

export const Assemble = concept(10, {
  name: 'Your daily.dev, assembled',
  thesis:
    'Progress is not a bar, it is the product. A small daily.dev sits in the popup with a dashed outline where each missing piece goes. Every quest fills its piece in, so the payoff is visible before you start.',
  basedOn:
    'Shopify and Notion: show what it looks like with data. Zeigarnik: visible gaps pull people to close them.',
  tryThis: [
    'Click any dashed outline to jump to that step',
    'Turn on notifications and watch the bell and toast appear',
  ],
  Component: Assembled,
});
