import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreTopicSearch } from './ExploreTopicSearch';

const onQueryChange = jest.fn();

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ExploreTopicSearch
        onQueryChange={onQueryChange}
        recommendedTags={['javascript', 'react']}
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

it('shows recommended topics before typing', () => {
  renderComponent();

  expect(screen.getByText('Recommended:')).toBeInTheDocument();
  expect(screen.getByText('javascript')).toBeInTheDocument();
});

it('reports the query live as the user types', async () => {
  renderComponent();

  fireEvent.input(screen.getByPlaceholderText('Search all tags'), {
    target: { value: 'rea' },
  });

  await waitFor(() => expect(onQueryChange).toHaveBeenCalledWith('rea'));
});
