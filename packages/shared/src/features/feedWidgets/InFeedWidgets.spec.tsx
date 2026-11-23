import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { SettingsFlags } from '../../graphql/settings';
import { LogEvent } from '../../lib/log';
import type { InFeedWidgetsContextValue } from './InFeedWidgetsContext';
import { InFeedWidgetsProvider } from './InFeedWidgetsContext';
import { FeedWidgetCell } from './InFeedWidgets';
import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';

const logEvent = jest.fn();
const setIsEditing = jest.fn();

const widget: FeedWidget = {
  id: 'streak',
  kind: FeedWidgetKind.Streak,
  size: FeedWidgetSize.Tall,
  slot: 2,
};

const renderCell = (isEditing = false): void => {
  const value: InFeedWidgetsContextValue = {
    isEnabled: true,
    isEditing,
    setIsEditing,
    addingSlot: null,
    setAddingSlot: jest.fn(),
    setConfiguringId: jest.fn(),
    setFlashId: jest.fn(),
  };
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
      settings={{
        loadedSettings: true,
        flags: {
          feedWidgets: { version: 1, widgets: [widget] },
        } as unknown as SettingsFlags,
      }}
    >
      <InFeedWidgetsProvider value={value}>
        <FeedWidgetCell widget={widget} feedName="my-feed" />
      </InFeedWidgetsProvider>
    </TestBootProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FeedWidgetCell', () => {
  it('opens Customize mode from the widget itself', () => {
    renderCell();

    fireEvent.click(screen.getByRole('button', { name: 'Customize Streak' }));

    expect(setIsEditing).toHaveBeenCalledWith(true);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.CustomizeFeedWidgets,
        target_id: FeedWidgetKind.Streak,
      }),
    );
  });

  it('trades it for its own controls while customizing', () => {
    renderCell(true);

    expect(
      screen.queryByRole('button', { name: 'Customize Streak' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove Streak' }),
    ).toBeInTheDocument();
  });
});
