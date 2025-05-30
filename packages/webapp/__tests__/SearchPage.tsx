import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { mocked } from 'ts-jest/utils';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../shared/__tests__/helpers/boot';
import { getLayout } from '../components/layouts/MainLayout';
import SearchPostsPage from '../pages/search/posts';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/search',
        query: {},
        push: jest.fn(),
        isReady: true,
      } as unknown as NextRouter),
  );
});

const renderComponent = (layout = getLayout): RenderResult => {
  const client = new QueryClient();
  const user = defaultUser;

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      {layout(<SearchPostsPage />, {}, {})}
    </TestBootProvider>,
  );
};

it('should render the search page', async () => {
  renderComponent(undefined);
  const text = await screen.findByTestId('search-panel');
  expect(text).toBeInTheDocument();
});
