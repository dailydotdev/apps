import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultQueryClientTestingConfig } from '../../../../../__tests__/helpers/tanstack-query';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import type { FeedSettingsEditContextValue } from '../types';
import { FeedSettingsFiltersSection } from './FeedSettingsFiltersSection';

const renderComponent = (
  overrides: Partial<FeedSettingsEditContextValue> = {},
) => {
  const contextValue: FeedSettingsEditContextValue = {
    feed: { flags: {} } as FeedSettingsEditContextValue['feed'],
    data: {
      name: 'My feed',
      orderBy: undefined,
      minDayRange: 7,
      minUpvotes: undefined,
      minViews: undefined,
      disableEngagementFilter: false,
    },
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
    ...overrides,
  };

  return {
    ...render(
      <QueryClientProvider
        client={new QueryClient(defaultQueryClientTestingConfig)}
      >
        <FeedSettingsEditContext.Provider value={contextValue}>
          <FeedSettingsFiltersSection />
        </FeedSettingsEditContext.Provider>
      </QueryClientProvider>,
    ),
    contextValue,
  };
};

describe('FeedSettingsFiltersSection', () => {
  it('should reset the time range to all time', async () => {
    const { contextValue } = renderComponent();

    await userEvent.click(screen.getByRole('radio', { name: 'All time' }));

    expect(contextValue.setData).toHaveBeenCalledWith({
      minDayRange: undefined,
    });
  });

  it('should select all time when no min day range is set', () => {
    renderComponent({
      data: {
        name: 'My feed',
        orderBy: undefined,
        minDayRange: undefined,
        minUpvotes: undefined,
        minViews: undefined,
        disableEngagementFilter: false,
      },
    });

    expect(screen.getByRole('radio', { name: 'All time' })).toBeChecked();
  });
});
