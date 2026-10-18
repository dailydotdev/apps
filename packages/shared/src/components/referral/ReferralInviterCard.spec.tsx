import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { ReferralInviterCard } from './ReferralInviterCard';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { referringUserQueryOptions } from '../../graphql/users';
import type { UserShortProfile } from '../../lib/user';
import { LogEvent, TargetType } from '../../lib/log';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const inviter = {
  id: 'inviter-1',
  name: 'Sam Porter',
  username: 'samp',
  image: 'https://daily.dev/sam.png',
} as UserShortProfile;

const logEvent = jest.fn();

const renderCard = (query: Record<string, string>) => {
  jest.mocked(useRouter).mockReturnValue({ query } as never);
  const client = new QueryClient();
  client.setQueryData(referringUserQueryOptions(inviter.id).queryKey, inviter);

  return render(
    <TestBootProvider client={client} log={{ logEvent }}>
      <ReferralInviterCard />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  logEvent.mockReset();
});

it('should show who invited the visitor and log the impression once', () => {
  renderCard({ cid: 'generic', userid: inviter.id });

  expect(screen.getByText('Sam Porter')).toBeInTheDocument();
  expect(screen.getByText('invited you')).toBeInTheDocument();
  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Impression,
    target_type: TargetType.ReferralInviterCard,
    target_id: inviter.id,
    extra: JSON.stringify({ campaign: 'generic' }),
  });
});

it('should render nothing without an inviter in the link', () => {
  const { container } = renderCard({ cid: 'generic' });

  expect(container).toBeEmptyDOMElement();
  expect(logEvent).not.toHaveBeenCalled();
});

it('should render nothing for an unknown campaign', () => {
  const { container } = renderCard({ cid: 'unknown', userid: inviter.id });

  expect(container).toBeEmptyDOMElement();
});
