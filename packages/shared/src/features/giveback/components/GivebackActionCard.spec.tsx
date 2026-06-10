import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackActionCard } from './GivebackActionCard';
import type { ContributionAction } from '../types';
import { ContributionSubmissionStatus } from '../types';

const makeAction = (
  overrides: Partial<ContributionAction> = {},
): ContributionAction => ({
  id: 'a1',
  categoryId: 'cat1',
  title: 'Post about us on X',
  description: null,
  points: 5,
  evidence: {},
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

const onSubmit = jest.fn();

beforeEach(() => jest.clearAllMocks());

it('renders an actionable card with the payout and platform, and submits', () => {
  render(<GivebackActionCard action={makeAction()} onSubmit={onSubmit} />);

  expect(screen.getByText('Post about us on X')).toBeInTheDocument();
  expect(screen.getByText('+$5')).toBeInTheDocument();
  expect(screen.getByText('X')).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', { name: 'Submit proof for Post about us on X' }),
  );
  expect(onSubmit).toHaveBeenCalledWith(makeAction());
});

it('locks an approved action into a non-interactive Done state', () => {
  render(
    <GivebackActionCard
      action={makeAction({
        latestUserSubmission: {
          id: 's1',
          actionId: 'a1',
          status: ContributionSubmissionStatus.Approved,
          awardedPoints: 5,
          createdAt: '2026-01-01',
          reviewedAt: '2026-01-02',
        },
      })}
      onSubmit={onSubmit}
    />,
  );

  expect(screen.getByText('Done')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('shows In review for a flagged submission and stays non-interactive', () => {
  render(
    <GivebackActionCard
      action={makeAction({
        latestUserSubmission: {
          id: 's1',
          actionId: 'a1',
          status: ContributionSubmissionStatus.Flagged,
          awardedPoints: 0,
          createdAt: '2026-01-01',
          reviewedAt: null,
        },
      })}
      onSubmit={onSubmit}
    />,
  );

  expect(screen.getByText('In review')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('treats reaching the per-user cap as Done', () => {
  render(
    <GivebackActionCard
      action={makeAction({ maxPerUser: 1, userCompletions: 1 })}
      onSubmit={onSubmit}
    />,
  );

  expect(screen.getByText('Done')).toBeInTheDocument();
});

it('keeps a rejected action submittable for a retry', () => {
  render(
    <GivebackActionCard
      action={makeAction({
        latestUserSubmission: {
          id: 's1',
          actionId: 'a1',
          status: ContributionSubmissionStatus.Rejected,
          awardedPoints: 0,
          createdAt: '2026-01-01',
          reviewedAt: '2026-01-02',
        },
      })}
      onSubmit={onSubmit}
    />,
  );

  expect(
    screen.getByRole('button', { name: 'Submit proof for Post about us on X' }),
  ).toBeInTheDocument();
});

it('shows the remaining runs for a repeatable action and stays actionable', () => {
  render(
    <GivebackActionCard
      action={makeAction({ maxPerUser: 3, userCompletions: 1 })}
      onSubmit={onSubmit}
    />,
  );

  expect(screen.getByText('2 left')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Submit proof for Post about us on X' }),
  ).toBeInTheDocument();
});

it('locks a cooling-down action with an availability label', () => {
  render(
    <GivebackActionCard
      action={makeAction({ userCooldownEndsAt: '2999-01-01T00:00:00.000Z' })}
      onSubmit={onSubmit}
    />,
  );

  expect(screen.getByText(/Available in/)).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('ignores an elapsed cooldown and stays actionable', () => {
  render(
    <GivebackActionCard
      action={makeAction({ userCooldownEndsAt: '2000-01-01T00:00:00.000Z' })}
      onSubmit={onSubmit}
    />,
  );

  expect(screen.queryByText(/Available in/)).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Submit proof for Post about us on X' }),
  ).toBeInTheDocument();
});

it('renders a love action with its appreciation tag instead of a payout', () => {
  render(
    <GivebackActionCard
      action={makeAction({
        title: 'Star us on GitHub',
        metadata: {
          platform: 'github',
          instructions: null,
          externalUrl: null,
          isLoveAction: true,
        },
      })}
      onSubmit={onSubmit}
    />,
  );

  expect(screen.getByText('Just for love')).toBeInTheDocument();
  expect(screen.queryByText('+$5')).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Show some love: Star us on GitHub' }),
  ).toBeInTheDocument();
});
