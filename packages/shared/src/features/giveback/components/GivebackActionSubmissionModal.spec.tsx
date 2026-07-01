import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GivebackActionSubmissionModal } from './GivebackActionSubmissionModal';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { useReferralCampaign } from '../../../hooks/referral/useReferralCampaign';
import { useContributionActionLinks } from '../hooks/useContributionActionLinks';
import type { ContributionAction } from '../types';
import { ContributionAssistType } from '../types';

jest.mock('../hooks/useSubmitContributionAction', () => ({
  useSubmitContributionAction: () => ({ submit: jest.fn(), isPending: false }),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../../hooks/useToastNotification'),
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  ...jest.requireActual('../../../contexts/LogContext'),
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('../../../hooks/referral/useReferralCampaign', () => ({
  ...jest.requireActual('../../../hooks/referral/useReferralCampaign'),
  useReferralCampaign: jest.fn(),
}));

jest.mock('../hooks/useContributionActionLinks', () => ({
  useContributionActionLinks: jest.fn(),
}));

const mockedUseReferralCampaign = useReferralCampaign as jest.Mock;
const mockedUseContributionActionLinks =
  useContributionActionLinks as jest.Mock;

beforeEach(() => {
  mockedUseReferralCampaign.mockReturnValue({
    url: 'https://dly.to/abc',
    isReady: true,
  });
  mockedUseContributionActionLinks.mockReturnValue({
    links: [],
    isPending: false,
    isFetching: false,
    shuffle: jest.fn(),
  });
});

const makeAction = (
  overrides: Partial<ContributionAction> = {},
): ContributionAction => ({
  id: 'a1',
  categoryId: 'cat1',
  title: 'Invite a friend to daily.dev',
  description: null,
  points: 150,
  evidence: {},
  metadata: {
    platform: null,
    instructions: null,
    externalUrl: null,
    isLoveAction: false,
    assistType: ContributionAssistType.ReferralLink,
  },
  cooldownSeconds: null,
  maxPerUser: null,
  userCooldownEndsAt: null,
  userCompletions: 0,
  latestUserSubmission: null,
  ...overrides,
});

const renderModal = (action: ContributionAction): ReturnType<typeof render> => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <GivebackActionSubmissionModal action={action} onClose={jest.fn()} />
    </TestBootProvider>,
  );
};

it('shows the copyable invite link and no proof submission for a referral action', () => {
  renderModal(makeAction());

  expect(screen.getByDisplayValue('https://dly.to/abc')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Submit for review' }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
});

it('surfaces how many invited friends have counted so far', () => {
  renderModal(makeAction({ userCompletions: 3 }));

  expect(screen.getByText(/3 credited so far/)).toBeInTheDocument();
});

it('shows a spinner instead of the fallback link while the invite link loads', () => {
  mockedUseReferralCampaign.mockReturnValue({ url: undefined, isReady: false });
  renderModal(makeAction());

  expect(
    screen.getByRole('status', { name: 'Loading your invite link' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByDisplayValue('https://daily.dev'),
  ).not.toBeInTheDocument();
});

const makeLinkPoolAction = (): ContributionAction =>
  makeAction({
    title: 'Mention daily.dev in a relevant Reddit discussion',
    evidence: { url: { required: true } },
    metadata: {
      platform: 'reddit',
      instructions: null,
      externalUrl: null,
      isLoveAction: false,
      assistType: ContributionAssistType.LinkPool,
    },
  });

it('surfaces suggested pool threads and still asks for proof for a link_pool action', () => {
  mockedUseContributionActionLinks.mockReturnValue({
    links: [
      {
        id: 'l1',
        url: 'https://reddit.com/r/webdev/comments/1',
        label: 'r/webdev: keep up with dev news',
      },
      { id: 'l2', url: 'https://reddit.com/r/x/comments/2', label: null },
    ],
    isPending: false,
    isFetching: false,
    shuffle: jest.fn(),
  });

  renderModal(makeLinkPoolAction());

  expect(screen.getByText('Suggested threads')).toBeInTheDocument();
  const firstThread = screen.getByText('r/webdev: keep up with dev news');
  expect(firstThread.closest('a')).toHaveAttribute(
    'href',
    'https://reddit.com/r/webdev/comments/1',
  );
  // A label-less link falls back to its URL.
  expect(
    screen.getByText('https://reddit.com/r/x/comments/2'),
  ).toBeInTheDocument();
  // link_pool keeps the proof flow (unlike referral).
  expect(
    screen.getByRole('button', { name: 'Submit for review' }),
  ).toBeInTheDocument();
});

it('shuffles the pool on request', () => {
  const shuffle = jest.fn();
  mockedUseContributionActionLinks.mockReturnValue({
    links: [
      { id: 'l1', url: 'https://reddit.com/r/webdev/comments/1', label: 'One' },
    ],
    isPending: false,
    isFetching: false,
    shuffle,
  });

  renderModal(makeLinkPoolAction());

  fireEvent.click(screen.getByRole('button', { name: /shuffle/i }));
  expect(shuffle).toHaveBeenCalled();
});

it('disables shuffle while a fresh set is loading', () => {
  mockedUseContributionActionLinks.mockReturnValue({
    links: [
      { id: 'l1', url: 'https://reddit.com/r/webdev/comments/1', label: 'One' },
    ],
    isPending: false,
    isFetching: true,
    shuffle: jest.fn(),
  });

  renderModal(makeLinkPoolAction());

  expect(screen.getByRole('button', { name: /shuffle/i })).toBeDisabled();
});
