import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { PopularHotTakes } from './PopularHotTakesList';
import { PopularHotTakesList } from './PopularHotTakesList';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { useHotTakeShareEnabled } from '../../../hooks/useHotTakeShareEnabled';

jest.mock('../../../hooks/useHotTakeShareEnabled', () => ({
  useHotTakeShareEnabled: jest.fn(),
}));

const shareEnabledMock = useHotTakeShareEnabled as jest.Mock;
const shareLabel = 'Share the hot takes leaderboard';

const items: PopularHotTakes[] = [
  {
    score: 1,
    hotTake: {
      id: 'p-1',
      title: 'Strict mode everywhere',
      subtitle: null,
      emoji: '🧨',
    },
    user: { username: 'spicydev' },
  },
];

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  shareEnabledMock.mockReturnValue(false);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

const renderList = (): RenderResult =>
  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <PopularHotTakesList
        containerProps={{ title: 'Most popular hot takes' }}
        items={items}
        isLoading={false}
      />
    </TestBootProvider>,
  );

describe('PopularHotTakesList', () => {
  it('keeps the stock heading markup when the flag is off', () => {
    renderList();

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveClass('mb-2');
    // No wrapper row: the heading still sits directly above the list.
    expect(heading.nextElementSibling?.tagName).toBe('OL');
    expect(screen.queryByLabelText(shareLabel)).not.toBeInTheDocument();
  });

  it('renders exactly one header share when the flag is on', () => {
    shareEnabledMock.mockReturnValue(true);
    renderList();

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).not.toHaveClass('mb-2');
    expect(heading.parentElement).toHaveClass('justify-between');
    expect(screen.getAllByLabelText(shareLabel)).toHaveLength(1);
  });

  it('keeps rows deep-linking to the hot-takes section of the owner profile', () => {
    shareEnabledMock.mockReturnValue(true);
    renderList();

    expect(
      screen.getByRole('link', { name: /Strict mode everywhere/ }),
    ).toHaveAttribute('href', '/spicydev#hot-takes');
  });
});
