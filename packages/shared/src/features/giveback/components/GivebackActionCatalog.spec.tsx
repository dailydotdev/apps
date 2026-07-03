import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackActionCatalog } from './GivebackActionCatalog';
import { useContributionActions } from '../hooks/useContributionActions';
import type { ContributionAction } from '../types';

jest.mock('../hooks/useContributionActions');
jest.mock('./GivebackActionSubmissionModal', () => ({
  GivebackActionSubmissionModal: ({
    action,
  }: {
    action: ContributionAction;
  }): JSX.Element => <div data-testid="submission-modal">{action.title}</div>,
}));

const mockUseActions = useContributionActions as jest.MockedFunction<
  typeof useContributionActions
>;

const makeAction = (
  overrides: Partial<ContributionAction> = {},
): ContributionAction => ({
  id: 'a1',
  categoryId: 'cat1',
  title: 'Action',
  description: null,
  points: 5,
  evidence: {},
  metadata: {
    platform: 'x',
    instructions: null,
    externalUrl: null,
    isLoveAction: false,
    assistType: null,
  },
  cooldownSeconds: null,
  maxPerUser: null,
  userCooldownEndsAt: null,
  userCompletions: 0,
  latestUserSubmission: null,
  ...overrides,
});

const categories = [
  { id: 'cat1', title: 'Social' },
  { id: 'cat2', title: 'Reviews' },
];

const mockReturn = (actions: ContributionAction[], isPending = false) =>
  mockUseActions.mockReturnValue({
    actions,
    categories,
    rewardTiers: [],
    claimedRewardIds: [],
    isPending,
  });

beforeEach(() => jest.clearAllMocks());

it('renders a skeleton while loading', () => {
  mockUseActions.mockReturnValue({
    actions: [],
    categories: [],
    rewardTiers: [],
    claimedRewardIds: [],
    isPending: true,
  });
  render(<GivebackActionCatalog />);

  expect(
    screen.getByRole('status', { name: 'Loading actions' }),
  ).toBeInTheDocument();
});

it('shows an empty message when there are no actions', () => {
  mockReturn([]);
  render(<GivebackActionCatalog />);

  expect(
    screen.getByText('No actions are available yet. Check back soon.'),
  ).toBeInTheDocument();
});

it('filters the grid by the selected category', () => {
  mockReturn([
    makeAction({ id: 'a1', title: 'Post on X', categoryId: 'cat1' }),
    makeAction({ id: 'a2', title: 'Leave a review', categoryId: 'cat2' }),
  ]);
  render(<GivebackActionCatalog />);

  expect(screen.getByText('Post on X')).toBeInTheDocument();
  expect(screen.getByText('Leave a review')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Reviews' }));

  expect(screen.queryByText('Post on X')).not.toBeInTheDocument();
  expect(screen.getByText('Leave a review')).toBeInTheDocument();
});

it('caps the initial grid and expands on show more', () => {
  const actions = Array.from({ length: 15 }, (_, index) =>
    makeAction({ id: `a${index}`, title: `Action ${index}` }),
  );
  mockReturn(actions);
  render(<GivebackActionCatalog />);

  expect(screen.queryByText('Action 12')).not.toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', { name: 'Show more actions (3)' }),
  );

  expect(screen.getByText('Action 12')).toBeInTheDocument();
});

it('renders love actions in their own group', () => {
  mockReturn([
    makeAction({ id: 'a1', title: 'Post on X' }),
    makeAction({
      id: 'a2',
      title: 'Star us on GitHub',
      metadata: {
        platform: 'github',
        instructions: null,
        externalUrl: null,
        isLoveAction: true,
        assistType: null,
      },
    }),
  ]);
  render(<GivebackActionCatalog />);

  // The group heading plus the love card's own tag both read "Just for love".
  expect(screen.getAllByText('Just for love')).toHaveLength(2);
  expect(screen.getByText('Star us on GitHub')).toBeInTheDocument();
});

it('opens the submission modal when a card is chosen', () => {
  mockReturn([makeAction({ id: 'a1', title: 'Post on X' })]);
  render(<GivebackActionCatalog />);

  fireEvent.click(
    screen.getByRole('button', { name: 'Submit proof for Post on X' }),
  );

  expect(screen.getByTestId('submission-modal')).toHaveTextContent('Post on X');
});
