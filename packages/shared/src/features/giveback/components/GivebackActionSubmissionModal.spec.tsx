import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GivebackActionSubmissionModal } from './GivebackActionSubmissionModal';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
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
  useReferralCampaign: () => ({ url: 'https://dly.to/abc' }),
}));

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
