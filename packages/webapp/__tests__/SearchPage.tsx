import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import { QueryClient } from 'react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import SearchPage from '../pages/search';
import { TestBootProvider } from '../../shared/__tests__/helpers/boot';

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
  renderComponent();
  const text = screen.queryByText('Search component area');
  expect(text).toBeInTheDocument();
});
