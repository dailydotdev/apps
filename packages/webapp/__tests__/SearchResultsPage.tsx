import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import * as hooks from '@dailydotdev/shared/src/hooks/useViewSize';
import * as contexts from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities';
import { TestBootProvider } from '../../shared/__tests__/helpers/boot';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useScrollRestoration', () => ({
  useScrollRestoration: jest.fn(),
}));

jest
  .spyOn(contexts, 'useActiveFeedNameContext')
  .mockReturnValue({ feedName: SharedFeedPage.Search });

const DEFAULT_QUERY = 'react';

beforeEach(() => {
  jest.spyOn(hooks, 'useViewSize').mockReset();

  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/search',
        query: { q: DEFAULT_QUERY, provider: 'posts' },
        push: jest.fn(),
        isReady: true,
      } as unknown as NextRouter),
  );
});

const renderComponent = (): RenderResult => {
  const client = new QueryClient();
  const user = defaultUser;

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      <MainFeedLayout
        feedName="search"
        isSearchOn
        searchQuery={DEFAULT_QUERY}
      />
    </TestBootProvider>,
  );
};

const simulateIsLaptop = () =>
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);

it('should render the search results layout on desktop', async () => {
  simulateIsLaptop();

  renderComponent();
  const text = screen.queryByText('Related posts');
  expect(text).toBeInTheDocument();
});

it('should not render the search results layout on mobile', async () => {
  renderComponent();
  const text = screen.queryByText('Related posts');
  expect(text).not.toBeInTheDocument();
});

it('should render the related tags widget', async () => {
  simulateIsLaptop();
  renderComponent();
  const text = screen.queryByTestId('related-tags');
  expect(text).toBeInTheDocument();
});

it('should render the related sources widget', async () => {
  simulateIsLaptop();
  renderComponent();
  const text = screen.queryByTestId('related-sources');
  expect(text).toBeInTheDocument();
});
