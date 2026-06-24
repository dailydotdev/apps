import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackActionSubmissionModal } from '@dailydotdev/shared/src/features/giveback/components/GivebackActionSubmissionModal';
import type { ContributionAction } from '@dailydotdev/shared/src/features/giveback/types';
import { withGiveback } from './giveback.mocks';

// The proof-submission modal opened from an action card. The form adapts to the
// action's `evidence`: a link field, a screenshot upload, and/or a note. Love
// actions skip the reward and just say thanks.
const meta: Meta<typeof GivebackActionSubmissionModal> = {
  title: 'Features/Giveback/Submission modal',
  component: GivebackActionSubmissionModal,
  args: { onClose: () => undefined },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The pop-up that collects proof for an action. Variants show the link-only, screenshot, full (link + screenshot + note), and the love-action (no reward) layouts.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj<typeof GivebackActionSubmissionModal>;

const makeAction = (
  overrides: Partial<ContributionAction>,
): ContributionAction => ({
  id: 'a-modal',
  categoryId: 'cat-content',
  title: 'Post about daily.dev on X',
  description: 'A quick post about what you like helps more developers find us.',
  points: 120,
  evidence: { url: { required: true } },
  metadata: {
    platform: 'x',
    instructions:
      'Write a short post about what you like in daily.dev.\nInclude a link to daily.dev so people can find it.\nCopy the link to your post and paste it below.',
    externalUrl: 'https://x.com/compose/post',
    isLoveAction: false,
  },
  cooldownSeconds: null,
  maxPerUser: null,
  userCooldownEndsAt: null,
  userCompletions: 0,
  latestUserSubmission: null,
  ...overrides,
});

export const LinkOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Branded action: platform logo, the ask, the reward, a numbered how-to, and a "Go to X" button — then the proof link field.',
      },
    },
  },
  args: { action: makeAction({}) },
};

export const Screenshot: Story = {
  args: {
    action: makeAction({
      title: 'Host a daily.dev meetup',
      description: 'Bring developers together in person around daily.dev.',
      points: 250,
      evidence: { screenshot: { required: true } },
      metadata: {
        platform: 'event',
        instructions: 'Upload a photo from the meetup.',
        externalUrl: null,
        isLoveAction: false,
      },
    }),
  },
};

export const FullProof: Story = {
  args: {
    action: makeAction({
      title: 'Speak about daily.dev at an event',
      points: 200,
      evidence: {
        url: { required: true },
        screenshot: { required: false },
        note: { required: false },
      },
    }),
  },
};

export const LoveAction: Story = {
  parameters: {
    docs: { description: { story: 'A voluntary thank-you — no reward attached.' } },
  },
  args: {
    action: makeAction({
      title: 'Leave us a kind word',
      points: 0,
      evidence: { note: { required: true } },
      metadata: {
        platform: null,
        instructions: null,
        externalUrl: null,
        isLoveAction: true,
      },
    }),
  },
};
