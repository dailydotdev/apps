import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { Features } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { TestBootProvider } from '../../shared/__tests__/helpers/boot';
import SearchPage from '../pages/search';
import { getLayout } from '../components/layouts/MainLayout';
import { getMainFeedLayout } from '../components/layouts/MainFeedPage';

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
      {layout(<SearchPage />, {}, {})}
    </TestBootProvider>,
  );
};

it('should render the search page control', async () => {
  Features.Search.defaultValue = SearchExperiment.Control;
  renderComponent(getMainFeedLayout);
  const text = screen.queryByTestId('searchBar');
  expect(text).not.toBeInTheDocument();
});

it('should render the search page v1', async () => {
  Features.Search.defaultValue = SearchExperiment.V1;
  renderComponent();
  const text = screen.queryByTestId('searchBar');
  expect(text).toBeInTheDocument();
});
