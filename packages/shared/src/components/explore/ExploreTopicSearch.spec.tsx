import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { SEARCH_TAGS_QUERY } from '../../graphql/feedSettings';
import { ExploreTopicSearch } from './ExploreTopicSearch';

beforeEach(() => {
  nock.cleanAll();
});

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ExploreTopicSearch
        followedTags={new Set()}
        recommendedTags={['javascript', 'react']}
      />
    </TestBootProvider>,
  );

const typeQuery = (value: string) => {
  const input = screen.getByPlaceholderText('Search all topics');
  fireEvent.input(input, { target: { value } });
};

it('should show recommended topics before searching', () => {
  renderComponent();

  expect(screen.getByText('Recommended:')).toBeInTheDocument();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

it('should not search below the 3 character threshold', async () => {
  renderComponent();
  typeQuery('re');

  // Give the debounce time to (not) fire.
  await new Promise((resolve) => {
    setTimeout(resolve, 350);
  });
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

it('should render search results once the query is long enough', async () => {
  mockGraphQL({
    request: { query: SEARCH_TAGS_QUERY, variables: { query: 'rea' } },
    result: {
      data: { searchTags: { query: 'rea', tags: [{ name: 'react' }] } },
    },
  });
  renderComponent();
  typeQuery('rea');

  const result = await screen.findByText('#react');
  expect(result).toBeInTheDocument();
  expect(screen.getByRole('listbox')).toBeInTheDocument();
});

it('should suggest popular topics on a zero-result search', async () => {
  mockGraphQL({
    request: { query: SEARCH_TAGS_QUERY, variables: { query: 'zzz' } },
    result: { data: { searchTags: { query: 'zzz', tags: [] } } },
  });
  renderComponent();
  typeQuery('zzz');

  await waitFor(() =>
    expect(screen.getByText(/No topics match/)).toBeInTheDocument(),
  );
  expect(screen.getByText('Try a popular topic:')).toBeInTheDocument();
});
