import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import defaultUser from '../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { laptopQuery, mockMatchMedia } from '../../__tests__/helpers/media';
import * as feedName from '../contexts/ActiveFeedNameContext';
import { SearchProvider } from '../contexts/search/SearchContext';
import { SpotlightContext } from './spotlight/SpotlightContext';
import {
  featureInterestAgent,
  featureLayoutV2,
} from '../lib/featureManagement';
import { OtherFeedPage } from '../lib/query';
import MainFeedLayout from './MainFeedLayout';

jest.mock('../hooks/useScrollRestoration', () => ({
  useScrollRestoration: jest.fn(),
}));

// The global mock resolves a dynamic import a tick after the first render, and
// the mobile explore header is one — it throws on the paint this test cares
// about. Nothing dynamic is under test here: the pair is a static import.
jest.mock('next/dynamic', () => () => {
  const Stub = () => null;

  Stub.displayName = 'DynamicStub';

  return Stub;
});

const tabletQuery = '(min-width: 656px)';

/**
 * Where the Explore pair is mounted, rather than what it renders.
 *
 * It was first hung off the v2 page header, which is laptop-only by design — so
 * a control meant for phones sat in the one branch that can never draw on one.
 * Every unit test passed, because they all render the component directly.
 */
const renderExplore = () => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureInterestAgent.id]: { defaultValue: true },
    [featureLayoutV2.id]: { defaultValue: true },
  });

  return render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: defaultUser }}
      gb={gb}
    >
      <SpotlightContext.Provider value={{ open: jest.fn() } as never}>
        <SearchProvider>
          <MainFeedLayout feedName={OtherFeedPage.Explore} isSearchOn={false} />
        </SearchProvider>
      </SpotlightContext.Provider>
    </TestBootProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .spyOn(feedName, 'useActiveFeedNameContext')
    .mockReturnValue({ feedName: OtherFeedPage.Explore } as never);
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: `/${OtherFeedPage.Explore}`,
        asPath: `/${OtherFeedPage.Explore}`,
        query: {},
        push: jest.fn(),
        isReady: true,
      } as unknown as NextRouter),
  );
});

afterEach(() => jest.restoreAllMocks());

describe('the agent entry on Explore', () => {
  it('is on the page on a phone', async () => {
    mockMatchMedia(() => false);
    renderExplore();

    await waitFor(() =>
      expect(screen.getByLabelText('Your agents')).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Open search')).toBeInTheDocument();
  });

  it('is absent on a desktop, where the docked bar carries the entry', async () => {
    mockMatchMedia((query) => query === tabletQuery || query === laptopQuery);
    renderExplore();

    await waitFor(() =>
      expect(screen.getByRole('navigation')).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText('Your agents')).not.toBeInTheDocument();
  });
});
