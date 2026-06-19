import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import SearchFilterTimeButton from './SearchFilterTimeButton';
import {
  SearchProvider,
  useSearchContextProvider,
} from '../../contexts/search/SearchContext';
import type { SearchTimeKey } from '../../graphql/search';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
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

const renderComponent = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SearchProvider>
        <SearchFilterTimeButton />
      </SearchProvider>
    </QueryClientProvider>,
  );

it('should default to All Time when no time param is in the URL', async () => {
  renderComponent();

  expect(
    await screen.findByLabelText('Open time filter menu'),
  ).toHaveTextContent('All Time');
});

it('should hydrate the filter label from the time URL param', async () => {
  mockRouter({ time: '7d' });
  renderComponent();

  await waitFor(() =>
    expect(screen.getByLabelText('Open time filter menu')).toHaveTextContent(
      'Last 7 Days',
    ),
  );
});

const SetTimeButton = ({ value }: { value: SearchTimeKey }) => {
  const { setTime } = useSearchContextProvider();
  return (
    <button type="button" onClick={() => setTime(value)}>
      set
    </button>
  );
};

const renderSetter = (value: SearchTimeKey) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SearchProvider>
        <SetTimeButton value={value} />
      </SearchProvider>
    </QueryClientProvider>,
  );

it('should write the selected time frame to the URL', async () => {
  renderSetter('LastSevenDays');

  await userEvent.click(screen.getByText('set'));

  expect(replace).toHaveBeenCalledWith(
    {
      pathname: '/search',
      query: { q: 'react', time: '7d' },
    },
    undefined,
    { shallow: true },
  );
});

it('should remove the time param when selecting All Time', async () => {
  mockRouter({ time: '7d' });
  renderSetter('AllTime');

  await userEvent.click(screen.getByText('set'));

  expect(replace).toHaveBeenCalledWith(
    {
      pathname: '/search',
      query: { q: 'react' },
    },
    undefined,
    { shallow: true },
  );
});
