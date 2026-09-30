import type { ReactNode } from 'react';
import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { ReferralLadder } from '../../graphql/users';
import { REFERRAL_LADDER_QUERY } from '../../graphql/users';
import { LazyModal } from '../../components/modals/common/types';
import { useReferralReminderModal } from './useReferralReminderModal';

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

const renderReminderHook = ({
  enabled = true,
  isReferralLadderEligible = true,
}: {
  enabled?: boolean;
  isReferralLadderEligible?: boolean;
} = {}) => {
  const client = new QueryClient();
  const user = { ...defaultUser, isReferralLadderEligible };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider client={client} auth={{ user }}>
      {children}
    </TestBootProvider>
  );

  return renderHook(() => useReferralReminderModal({ enabled }), { wrapper });
};

beforeEach(() => {
  nock.cleanAll();
});

it('should show the ladder promo once an eligible user has steps left', async () => {
  mockLadder(getLadder(1));
  const { result } = renderReminderHook();

  expect(result.current).toBeUndefined();
  await waitFor(() =>
    expect(result.current).toEqual(LazyModal.ReferralLadderPromo),
  );
});

it('should show the generic popup to users outside the ladder', () => {
  const { result } = renderReminderHook({ isReferralLadderEligible: false });

  expect(result.current).toEqual(LazyModal.GenericReferral);
});

it('should show the generic popup once the ladder is completed', async () => {
  mockLadder(getLadder(3));
  const { result } = renderReminderHook();

  await waitFor(() =>
    expect(result.current).toEqual(LazyModal.GenericReferral),
  );
});

it('should show nothing when the reminder is not due', () => {
  const { result } = renderReminderHook({ enabled: false });

  expect(result.current).toBeUndefined();
});
