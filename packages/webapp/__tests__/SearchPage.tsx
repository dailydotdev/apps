import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { TestBootProvider } from '../../shared/__tests__/helpers/boot';
import SearchPage from '../pages/search/posts';
import SearchPageV1 from '../pages/search/chat';
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

const renderComponent = (
  layout = getLayout,
  searchExperiment: SearchExperiment,
): RenderResult => {
  const client = new QueryClient();
  const user = defaultUser;
  const PageComponent =
    searchExperiment === SearchExperiment.V1 ? SearchPageV1 : SearchPage;

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      {layout(<PageComponent />, {}, {})}
    </TestBootProvider>,
  );
};

it('should render the search page control', async () => {
  feature.search.defaultValue = SearchExperiment.Control;
  renderComponent(getMainFeedLayout, SearchExperiment.Control);
  const text = screen.queryByTestId('search-panel');
  expect(text).not.toBeInTheDocument();
});

it('should render the search page v1', async () => {
  feature.search.defaultValue = SearchExperiment.V1;
  renderComponent(undefined, SearchExperiment.V1);
  const text = screen.queryByTestId('search-panel');
  expect(text).toBeInTheDocument();
});
