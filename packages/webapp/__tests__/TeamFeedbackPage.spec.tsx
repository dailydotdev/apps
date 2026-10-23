import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { useFeedbackList } from '@dailydotdev/shared/src/graphql/feedback';
import TeamFeedbackPage from '../pages/team/feedback';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

jest.mock('@dailydotdev/shared/src/graphql/feedback', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/graphql/feedback'),
  useFeedbackList: jest.fn(),
}));

beforeEach(() => {
  jest.mocked(useRouter).mockReturnValue({
    pathname: '/team/feedback',
    query: {},
    isReady: true,
    replace: jest.fn(),
    push: jest.fn(),
  } as unknown as NextRouter);
  jest.mocked(useFeedbackList).mockReturnValue({
    data: { pages: [], pageParams: [] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  } as unknown as ReturnType<typeof useFeedbackList>);
});

it('labels the spam status filter as spam for the team', async () => {
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: { ...loggedUser, isTeamMember: true }, isAuthReady: true }}
    >
      <TeamFeedbackPage />
    </TestBootProvider>,
  );

  fireEvent.click(screen.getAllByRole('button', { name: /Open/ })[0]);
  const labels = (await screen.findAllByRole('menuitem')).map(
    (item) => item.textContent,
  );

  expect(labels).toContain('Spam');
  expect(new Set(labels).size).toBe(labels.length);
});
