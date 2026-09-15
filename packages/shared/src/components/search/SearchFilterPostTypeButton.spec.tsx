import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { SearchFilterPostTypeList } from './SearchFilterOptions';
import {
  SearchProvider,
  useSearchContextProvider,
} from '../../contexts/search/SearchContext';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../hooks/useFeedSettings', () => ({
  __esModule: true,
  default: () => ({
    advancedSettings: [
      {
        id: 1,
        title: 'Videos',
        description: '',
        defaultEnabledState: true,
        group: 'content_types',
        options: { type: 'video:youtube' },
      },
      {
        id: 2,
        title: 'Article',
        description: '',
        defaultEnabledState: true,
        group: 'content_types',
        options: { type: 'article' },
      },
      {
        id: 3,
        title: 'Polls',
        description: '',
        defaultEnabledState: true,
        group: 'content_types',
        options: { type: 'poll' },
      },
    ],
  }),
}));

const replace = jest.fn();

const mockRouter = (query: Record<string, string> = {}) =>
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/search',
        query: { q: 'react', ...query },
        replace,
        isReady: true,
      } as unknown as NextRouter),
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockRouter();
});

const renderWithSearchProvider = (children: React.ReactNode) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SearchProvider>{children}</SearchProvider>
    </QueryClientProvider>,
  );

it('writes the selected content type to the URL', async () => {
  renderWithSearchProvider(<SearchFilterPostTypeList />);

  await userEvent.click(screen.getByLabelText('Videos'));

  expect(replace).toHaveBeenCalledWith(
    {
      pathname: '/search',
      query: { q: 'react', type: 'video' },
    },
    undefined,
    { shallow: true },
  );
  expect(screen.queryByText('Polls')).not.toBeInTheDocument();
});

const SelectedPostTypes = () => {
  const { postTypesFilter } = useSearchContextProvider();

  return <div>{postTypesFilter.join(',')}</div>;
};

it('hydrates selected content types from the URL', async () => {
  mockRouter({ type: 'video,article' });

  renderWithSearchProvider(<SelectedPostTypes />);

  await waitFor(() =>
    expect(screen.getByText('video:youtube,article')).toBeInTheDocument(),
  );
});
