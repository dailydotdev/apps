import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import { QueryClient } from 'react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { Features } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { TestBootProvider } from '../../shared/__tests__/helpers/boot';
import SearchPage from '../pages/search';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/bookmarks',
        query: {},
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
      {SearchPage.getLayout(<SearchPage />, {}, SearchPage.layoutProps)}
    </TestBootProvider>,
  );
};

it('should render the search page', async () => {
  Features.Search.defaultValue = SearchExperiment.V1;
  renderComponent();
  const text = screen.queryByTestId('searchBar');
  expect(text).toBeInTheDocument();
});
