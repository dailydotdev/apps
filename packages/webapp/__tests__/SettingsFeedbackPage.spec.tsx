import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import * as hooks from '@dailydotdev/shared/src/hooks/useViewSize';
import { useUserFeedback } from '@dailydotdev/shared/src/graphql/feedback';
import * as layoutVariant from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import AccountFeedbackPage from '../pages/settings/feedback';

jest.mock('@dailydotdev/shared/src/graphql/feedback', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/graphql/feedback'),
  useUserFeedback: jest.fn(),
}));

const mockUseUserFeedback = useUserFeedback as jest.MockedFunction<
  typeof useUserFeedback
>;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
  jest
    .spyOn(layoutVariant, 'useLayoutVariant')
    .mockReturnValue({ isV2: false, isLoading: false });
  mockUseUserFeedback.mockReturnValue({
    data: {
      pages: [
        {
          userFeedback: {
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
            edges: [],
          },
        },
      ],
      pageParams: [null],
    },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  } as unknown as ReturnType<typeof useUserFeedback>);
});

const renderPage = () =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, isAuthReady: true }}
    >
      <AccountFeedbackPage />
    </TestBootProvider>,
  );

it('keeps feedback settings on the document scroller with a safe-area sticky heading', () => {
  renderPage();

  const heading = screen.getByRole('heading', { name: /Your Feedback/ });
  const pageContent = heading.parentElement;
  const section = pageContent?.querySelector('section');

  expect(heading).toHaveClass(
    'sticky',
    'top-[var(--safe-area-top)]',
    'laptop:top-[var(--sticky-header-offset)]',
    'z-1',
  );
  expect(
    within(heading).getByRole('button', { name: 'Submit feedback' }),
  ).toBeInTheDocument();
  expect(section).toHaveClass('overflow-x-clip');
  expect(section).not.toHaveClass('overflow-y-scroll');
  expect(section?.className).not.toContain('100dvh');
});
