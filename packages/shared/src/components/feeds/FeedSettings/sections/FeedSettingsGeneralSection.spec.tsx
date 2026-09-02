import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { defaultQueryClientTestingConfig } from '../../../../../__tests__/helpers/tanstack-query';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import type { FeedSettingsEditContextValue } from '../types';
import { FeedType } from '../../../../graphql/feed';
import { featureShareMyFeed } from '../../../../lib/featureManagement';
import { FeedSettingsGeneralSection } from './FeedSettingsGeneralSection';

jest.mock('../../../../hooks/useFeedSettings', () => ({
  __esModule: true,
  default: jest.fn(() => ({ isLoading: false })),
}));

const SHARE_HEADING = 'Share this feed';

const getGrowthBook = (shareMyFeed: boolean): GrowthBook => {
  const gb = new GrowthBook();
  gb.setFeatures({ [featureShareMyFeed.id]: { defaultValue: shareMyFeed } });

  return gb;
};

const renderComponent = ({
  type = FeedType.Custom,
  shareMyFeed = false,
}: { type?: FeedType; shareMyFeed?: boolean } = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient(defaultQueryClientTestingConfig)}
      auth={{ user: defaultUser }}
      gb={getGrowthBook(shareMyFeed)}
    >
      <FeedSettingsEditContext.Provider
        value={
          {
            feed: { id: 'f1', type, flags: { name: 'My feed' } },
            data: { name: 'My feed' },
            setData: jest.fn(),
            onSubmit: jest.fn(),
            isSubmitPending: false,
            onDelete: jest.fn(),
            deleteStatus: 'idle',
            onTagClick: jest.fn(),
            onDiscard: jest.fn(),
            isDirty: false,
            onBackToFeed: jest.fn(),
            editFeedSettings: jest.fn(),
            isNewFeed: false,
          } as unknown as FeedSettingsEditContextValue
        }
      >
        <FeedSettingsGeneralSection />
      </FeedSettingsEditContext.Provider>
    </TestBootProvider>,
  );

describe('FeedSettingsGeneralSection', () => {
  it('should not offer sharing while the flag is off', () => {
    renderComponent();

    expect(screen.queryByText(SHARE_HEADING)).not.toBeInTheDocument();
  });

  it('should offer sharing on a custom feed when the flag is on', async () => {
    renderComponent({ shareMyFeed: true });

    expect(await screen.findByText(SHARE_HEADING)).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Copy link' }),
    ).toBeInTheDocument();
  });

  it('should not offer sharing on the main feed, which nobody built', async () => {
    renderComponent({ type: FeedType.Main, shareMyFeed: true });

    // The default-feed block is main-feed only, so the section has rendered.
    expect(
      await screen.findByText('Set as your default feed'),
    ).toBeInTheDocument();
    expect(screen.queryByText(SHARE_HEADING)).not.toBeInTheDocument();
  });
});
