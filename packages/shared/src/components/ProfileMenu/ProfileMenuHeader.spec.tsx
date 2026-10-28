import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { ReferralLadder } from '../../graphql/users';
import {
  REFERRAL_LADDER_QUERY,
  referralLadderQueryOptions,
} from '../../graphql/users';
import { ActionType } from '../../graphql/actions';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ProfileMenuHeader } from './ProfileMenuHeader';

const giftLabel = 'Invite friends, get Plus';

const getLadder = (referredCount: number): ReferralLadder => ({
  eligible: true,
  referredCount,
  steps: [
    { step: 1, invites: 1, months: 1 },
    { step: 2, invites: 2, months: 3 },
    { step: 3, invites: 3, months: 12 },
  ].map((step) => ({
    ...step,
    unlockedAt: step.invites <= referredCount ? '2026-09-20T00:00:00Z' : null,
  })),
  friends: [],
});

const mockLadder = (ladder: ReferralLadder) =>
  mockGraphQL({
    request: { query: REFERRAL_LADDER_QUERY },
    result: { data: { referralLadder: ladder } },
  });

let client: QueryClient;

const renderComponent = (
  isReferralLadderEligible: boolean,
  {
    showReferralLadderGift = true,
    shouldOpenProfile = false,
    completedActions = [],
  }: {
    showReferralLadderGift?: boolean;
    shouldOpenProfile?: boolean;
    completedActions?: ActionType[];
  } = {},
) => {
  client = new QueryClient();
  const user = { ...defaultUser, isReferralLadderEligible };
  client.setQueryData(generateQueryKey(RequestKey.Actions, user), {
    actions: completedActions.map((type) => ({
      userId: user.id,
      type,
      completedAt: new Date(),
    })),
    serverLoaded: true,
  });

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      <ProfileMenuHeader
        showReferralLadderGift={showReferralLadderGift}
        shouldOpenProfile={shouldOpenProfile}
      />
    </TestBootProvider>,
  );
};

const expectLadderNotFetched = () =>
  expect(
    client.getQueryState(referralLadderQueryOptions(defaultUser).queryKey),
  ).toMatchObject({
    fetchStatus: 'idle',
    dataUpdateCount: 0,
    errorUpdateCount: 0,
  });

beforeEach(() => {
  nock.cleanAll();
});

it('should keep the header unchanged and skip the query for ineligible users', async () => {
  renderComponent(false);

  expect(await screen.findByText(defaultUser.name)).toBeInTheDocument();
  expect(screen.queryByLabelText(giftLabel)).not.toBeInTheDocument();
  expectLadderNotFetched();
});

it('should leave the gift out of headers outside the profile menu', async () => {
  renderComponent(true, { showReferralLadderGift: false });

  expect(await screen.findByText(defaultUser.name)).toBeInTheDocument();
  expect(screen.queryByLabelText(giftLabel)).not.toBeInTheDocument();
  expectLadderNotFetched();
});

it('should shake the gift only the first time it is shown', async () => {
  mockLadder(getLadder(0));
  mockGraphQL(
    completeActionMock({ action: ActionType.ReferralLadderGiftShake }),
  );
  renderComponent(true);

  const gift = await screen.findByLabelText(giftLabel);
  expect(gift.querySelector('svg')).toHaveClass('animate-nudge-shake');
  await waitFor(() => expect(nock.isDone()).toBe(true));
});

it('should not shake the gift once it has shaken before', async () => {
  mockLadder(getLadder(0));
  renderComponent(true, {
    completedActions: [ActionType.ReferralLadderGiftShake],
  });

  const gift = await screen.findByLabelText(giftLabel);
  expect(gift.querySelector('svg')).not.toHaveClass('animate-nudge-shake');
});

it('should open the ladder popup from the gift button', async () => {
  mockLadder(getLadder(1));
  renderComponent(true);

  fireEvent.click(await screen.findByLabelText(giftLabel));

  expect(
    await screen.findByText('Invite 1 more friend to get 3 months of Plus'),
  ).toBeInTheDocument();
});

it('should hide the gift button once the ladder is completed', async () => {
  mockLadder(getLadder(3));
  renderComponent(true);

  await waitFor(() =>
    expect(
      client.getQueryState(referralLadderQueryOptions(defaultUser).queryKey)
        ?.status,
    ).toBe('success'),
  );
  expect(screen.queryByLabelText(giftLabel)).not.toBeInTheDocument();
});

it('should hide the gift button when the API says the user is not eligible', async () => {
  mockLadder({ ...getLadder(0), eligible: false });
  renderComponent(true);

  await waitFor(() =>
    expect(
      client.getQueryState(referralLadderQueryOptions(defaultUser).queryKey)
        ?.status,
    ).toBe('success'),
  );
  expect(screen.queryByLabelText(giftLabel)).not.toBeInTheDocument();
});

it('should link to the profile without wrapping the gift button', async () => {
  mockLadder(getLadder(1));
  renderComponent(true, { shouldOpenProfile: true });

  const gift = await screen.findByLabelText(giftLabel);
  const profileLink = screen.getByRole('link', { name: 'Open profile' });
  expect(profileLink).toHaveAttribute(
    'href',
    expect.stringContaining(defaultUser.username),
  );
  expect(profileLink).not.toContainElement(gift);
});
