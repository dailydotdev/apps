import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  laptopQuery,
  mockMatchMedia,
} from '../../../../__tests__/helpers/media';
import { SpotlightContext } from '../../../components/spotlight/SpotlightContext';
import { featureInterestAgent } from '../../../lib/featureManagement';
import type { UserInterest } from '../../../graphql/interests';
import { UserInterestStatus } from '../../../graphql/interests';
import { interestsQueryOptions } from '../queries';
import { AgentExploreEntry } from './AgentExploreEntry';

const user = { id: 'u1' };

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const openSearch = jest.fn();

const renderEntry = ({
  enabled = true,
  withSpotlight = true,
  interests = [],
}: {
  enabled?: boolean;
  withSpotlight?: boolean;
  interests?: UserInterest[];
} = {}) => {
  const gb = new GrowthBook();
  gb.setFeatures({ [featureInterestAgent.id]: { defaultValue: enabled } });

  const client = new QueryClient();
  // Seeded rather than fetched: the entry only reads the count, and the query
  // itself belongs to the feed bar's tests.
  client.setQueryData(interestsQueryOptions(user as never).queryKey, interests);

  const entry = <AgentExploreEntry />;

  return render(
    <TestBootProvider client={client} auth={{ user: user as never }} gb={gb}>
      {withSpotlight ? (
        <SpotlightContext.Provider value={{ open: openSearch } as never}>
          {entry}
        </SpotlightContext.Provider>
      ) : (
        entry
      )}
    </TestBootProvider>,
  );
};

const tabletQuery = '(min-width: 656px)';

beforeEach(() => {
  jest.clearAllMocks();
  // A phone unless a test says otherwise: this control is a phone's.
  mockMatchMedia(() => false);
});

describe('AgentExploreEntry', () => {
  it('offers both ways of looking for something, in one control', () => {
    renderEntry();

    expect(screen.getByLabelText('Your agents')).toHaveAttribute(
      'href',
      expect.stringContaining('agent'),
    );
    expect(screen.getByLabelText('Open search')).toBeInTheDocument();
  });

  it('opens search on the search half', () => {
    renderEntry();

    fireEvent.click(screen.getByLabelText('Open search'));

    expect(openSearch).toHaveBeenCalled();
  });

  // The pair and the bar docked over the feed are the same door, so only one
  // of them is ever on screen.
  it('stands aside from tablet up, where the feed carries the bar instead', () => {
    mockMatchMedia((query) => query === tabletQuery);
    const { container } = renderEntry();

    expect(container).toBeEmptyDOMElement();
  });

  it('stands aside on a desktop too', () => {
    mockMatchMedia((query) => query === tabletQuery || query === laptopQuery);
    const { container } = renderEntry();

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing at all with the flag off', () => {
    const { container } = renderEntry({ enabled: false });

    expect(container).toBeEmptyDOMElement();
  });

  // Half a paired control is worse than none, and `useSpotlight` throws off
  // the app shell — the extension's new tab renders this layout too.
  it('stands down rather than throwing where there is no search to pair with', () => {
    const { container } = renderEntry({ withSpotlight: false });

    expect(container).toBeEmptyDOMElement();
  });

  it('counts the agents that came back while you were elsewhere', () => {
    renderEntry({
      interests: [
        {
          id: 'i1',
          query: 'zig',
          status: UserInterestStatus.Active,
          lastRunAt: hoursAgo(1),
          lastRunSummary: 'kept 6',
        },
        {
          id: 'i2',
          query: 'rust',
          status: UserInterestStatus.Active,
          lastRunAt: hoursAgo(1),
          lastRunSummary: 'kept 2',
        },
      ] as UserInterest[],
    });

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('says nothing when nothing is waiting, rather than showing a zero', () => {
    renderEntry({
      interests: [
        {
          id: 'i1',
          query: 'zig',
          status: UserInterestStatus.Active,
          lastRunAt: hoursAgo(40),
          lastRunSummary: 'kept 6',
        },
      ] as UserInterest[],
    });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
