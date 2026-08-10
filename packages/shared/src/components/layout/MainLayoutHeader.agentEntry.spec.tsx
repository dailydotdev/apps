import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { laptopQuery, mockMatchMedia } from '../../../__tests__/helpers/media';
import * as feedName from '../../contexts/ActiveFeedNameContext';
import { SpotlightContext } from '../spotlight/SpotlightContext';
import { featureInterestAgent } from '../../lib/featureManagement';
import { OtherFeedPage } from '../../lib/query';
import type { AllFeedPages } from '../../lib/query';
import { SharedFeedPage } from '../utilities';
import MainLayoutHeader from './MainLayoutHeader';

jest.mock('next/dynamic', () => (loader: () => Promise<unknown>) => {
  const name = String(loader).includes('spotlightTrigger')
    ? 'spotlight-trigger'
    : 'dynamic-component';

  const Stub = () => <div data-testid={name} />;

  Stub.displayName = name;

  return Stub;
});

const tabletQuery = '(min-width: 656px)';

const renderHeader = ({
  feed = OtherFeedPage.Explore,
  hasAgent = true,
}: { feed?: AllFeedPages; hasAgent?: boolean } = {}) => {
  const gb = new GrowthBook();
  gb.setFeatures({ [featureInterestAgent.id]: { defaultValue: hasAgent } });

  jest
    .spyOn(feedName, 'useActiveFeedNameContext')
    .mockReturnValue({ feedName: feed } as never);

  return render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: defaultUser }}
      gb={gb}
    >
      <SpotlightContext.Provider value={{ open: jest.fn() } as never}>
        {/* The desktop header only draws once the sidebar has reported in. */}
        <MainLayoutHeader sidebarRendered />
      </SpotlightContext.Provider>
    </TestBootProvider>,
  );
};

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

describe('the agent entry in the header', () => {
  it('takes the place of the search field on a phone', async () => {
    mockMatchMedia(() => false);
    renderHeader();

    await waitFor(() =>
      expect(screen.getByLabelText('Your agents')).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Open search')).toBeInTheDocument();
    expect(screen.queryByTestId('spotlight-trigger')).not.toBeInTheDocument();
  });

  it('leaves the field alone on a desktop, where the docked bar is the entry', async () => {
    mockMatchMedia((query) => query === tabletQuery || query === laptopQuery);
    renderHeader();

    await waitFor(() =>
      expect(screen.getByTestId('spotlight-trigger')).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText('Your agents')).not.toBeInTheDocument();
  });

  it('leaves the field alone with the flag off', async () => {
    mockMatchMedia(() => false);
    renderHeader({ hasAgent: false });

    await waitFor(() =>
      expect(screen.getByTestId('spotlight-trigger')).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText('Your agents')).not.toBeInTheDocument();
  });

  it('stays off the search page, where you are already searching', async () => {
    mockMatchMedia(() => false);
    renderHeader({ feed: SharedFeedPage.Search });

    await waitFor(() =>
      expect(screen.getByTestId('spotlight-trigger')).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText('Your agents')).not.toBeInTheDocument();
  });
});
