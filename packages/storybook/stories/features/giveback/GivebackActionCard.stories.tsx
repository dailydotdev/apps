import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackActionCard } from '@dailydotdev/shared/src/features/giveback/components/GivebackActionCard';
import type { ContributionAction } from '@dailydotdev/shared/src/features/giveback/types';
import { ContributionSubmissionStatus } from '@dailydotdev/shared/src/features/giveback/types';

const makeAction = (
  overrides: Partial<ContributionAction> = {},
): ContributionAction => ({
  id: 'a1',
  categoryId: 'cat1',
  title: 'Post about daily.dev on X',
  description: null,
  points: 25,
  evidence: { url: { required: true } },
  metadata: {
    platform: 'x',
    instructions: null,
    externalUrl: null,
    isLoveAction: false,
  },
  cooldownSeconds: null,
  maxPerUser: null,
  userCooldownEndsAt: null,
  userCompletions: 0,
  latestUserSubmission: null,
  ...overrides,
});

const inThreeHours = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

const states: { label: string; action: ContributionAction }[] = [
  { label: 'Actionable', action: makeAction() },
  {
    label: 'With description',
    action: makeAction({
      title: 'Write a blog post',
      points: 100,
      description: 'Publish an article mentioning daily.dev.',
      metadata: {
        platform: 'blog',
        instructions: null,
        externalUrl: null,
        isLoveAction: false,
      },
    }),
  },
  {
    label: 'Repeatable (runs left)',
    action: makeAction({
      title: 'Refer a friend',
      points: 40,
      maxPerUser: 3,
      userCompletions: 1,
      metadata: {
        platform: 'daily_dev',
        instructions: null,
        externalUrl: null,
        isLoveAction: false,
      },
    }),
  },
  {
    label: 'Cooldown',
    action: makeAction({
      title: 'Share on LinkedIn',
      points: 30,
      maxPerUser: 3,
      userCompletions: 1,
      userCooldownEndsAt: inThreeHours,
      metadata: {
        platform: 'linkedin',
        instructions: null,
        externalUrl: null,
        isLoveAction: false,
      },
    }),
  },
  {
    label: 'In review',
    action: makeAction({
      title: 'Leave a G2 review',
      points: 70,
      metadata: {
        platform: 'g2',
        instructions: null,
        externalUrl: null,
        isLoveAction: false,
      },
      latestUserSubmission: {
        id: 's1',
        actionId: 'a1',
        status: ContributionSubmissionStatus.Flagged,
        awardedPoints: 0,
        createdAt: '2026-01-01',
        reviewedAt: null,
      },
    }),
  },
  {
    label: 'Done (approved)',
    action: makeAction({
      title: 'Star our GitHub repo',
      points: 15,
      metadata: {
        platform: 'github',
        instructions: null,
        externalUrl: null,
        isLoveAction: false,
      },
      latestUserSubmission: {
        id: 's2',
        actionId: 'a1',
        status: ContributionSubmissionStatus.Approved,
        awardedPoints: 15,
        createdAt: '2026-01-01',
        reviewedAt: '2026-01-02',
      },
    }),
  },
  {
    label: 'Done (cap reached)',
    action: makeAction({
      title: 'Review the Edge add-on',
      points: 50,
      maxPerUser: 1,
      userCompletions: 1,
      metadata: {
        platform: 'edge_addons',
        instructions: null,
        externalUrl: null,
        isLoveAction: false,
      },
    }),
  },
  {
    label: 'Just for love',
    action: makeAction({
      title: 'Follow daily.dev on X',
      points: 0,
      evidence: {},
      metadata: {
        platform: 'x',
        instructions: null,
        externalUrl: null,
        isLoveAction: true,
      },
    }),
  },
];

const meta: Meta<typeof GivebackActionCard> = {
  title: 'Features/Giveback/ActionCard',
  component: GivebackActionCard,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof GivebackActionCard>;

// Every card state side by side: actionable, repeatable, cooldown, in-review,
// done (approved / cap reached) and just-for-love.
export const AllStates: Story = {
  render: () => (
    <div className="min-h-screen bg-background-default p-6">
      <div className="grid max-w-5xl gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {states.map(({ label, action }) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
              {label}
            </span>
            <GivebackActionCard action={action} onSubmit={() => undefined} />
          </div>
        ))}
      </div>
    </div>
  ),
};
