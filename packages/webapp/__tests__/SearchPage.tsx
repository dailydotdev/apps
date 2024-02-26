import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { TestBootProvider } from '../../shared/__tests__/helpers/boot';
import SearchPageV1 from '../pages/search/chat';
import { getLayout } from '../components/layouts/MainLayout';

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
      {layout(<SearchPageV1 />, {}, {})}
    </TestBootProvider>,
  );
};

it('should render the search page', async () => {
  renderComponent(undefined);
  const text = screen.queryByTestId('search-panel');
  expect(text).toBeInTheDocument();
});
