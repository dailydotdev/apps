import type { ReactElement } from 'react';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { SettingsFlags } from '../../graphql/settings';
import { ButtonSize } from '../../components/buttons/common';
import { LogEvent } from '../../lib/log';
import type { InFeedWidgetsContextValue } from './InFeedWidgetsContext';
import {
  FeedWidgetsCustomizeButton,
  InFeedWidgetsProvider,
} from './InFeedWidgetsContext';
import { FEED_WIDGETS_INTRO_ID } from './types';

const setSettings = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();
const setIsEditing = jest.fn();

const renderButton = ({
  feedWidgets,
  isLoggedIn = true,
  isEnabled = true,
}: {
  feedWidgets?: unknown;
  isLoggedIn?: boolean;
  isEnabled?: boolean;
} = {}): void => {
  const value: InFeedWidgetsContextValue = {
    isEnabled,
    isEditing: false,
    setIsEditing,
    addingSlot: null,
    setAddingSlot: jest.fn(),
    setConfiguringId: jest.fn(),
    setFlashId: jest.fn(),
  };
  const Wrapper = (): ReactElement => (
    <TestBootProvider
      client={new QueryClient()}
      auth={{ isLoggedIn }}
      log={{ logEvent }}
      settings={{
        flags: { feedWidgets } as unknown as SettingsFlags,
        setSettings,
      }}
    >
      <InFeedWidgetsProvider value={value}>
        <FeedWidgetsCustomizeButton size={ButtonSize.Small} />
      </InFeedWidgetsProvider>
    </TestBootProvider>
  );
  render(<Wrapper />);
};

const loggedEvents = () =>
  logEvent.mock.calls.map(([event]) => event.event_name);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FeedWidgetsCustomizeButton intro', () => {
  it('introduces widgets in the feed the first time, and logs it once', async () => {
    renderButton();

    expect(await screen.findByText('Widgets, take two')).toBeInTheDocument();
    expect(loggedEvents()).toEqual([LogEvent.ImpressionFeedWidgetsIntro]);
  });

  it('takes the reader into Customize mode and remembers it was seen', async () => {
    renderButton();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Add a widget' }),
    );

    expect(setIsEditing).toHaveBeenCalledWith(true);
    expect(loggedEvents()).toContain(LogEvent.ClickFeedWidgetsIntro);
    expect(setSettings).toHaveBeenCalledWith({
      flags: {
        feedWidgets: expect.objectContaining({
          widgets: [],
          introSeen: FEED_WIDGETS_INTRO_ID,
        }),
      },
    });
    await waitFor(() =>
      expect(screen.queryByText('Widgets, take two')).not.toBeInTheDocument(),
    );
  });

  it('counts a click on the Widgets button as taking it up, not a dismissal', async () => {
    renderButton();
    await screen.findByText('Widgets, take two');

    const button = screen.getByRole('button', { name: 'Widgets' });
    fireEvent.pointerDown(button);
    fireEvent.click(button);

    expect(setIsEditing).toHaveBeenCalledWith(true);
    expect(loggedEvents()).not.toContain(LogEvent.DismissFeedWidgetsIntro);
    expect(setSettings).toHaveBeenCalledTimes(1);
  });

  it('closes for good on Not now, keeping the stored widgets', async () => {
    const stored = {
      version: 1,
      widgets: [{ id: 'old', kind: 'streak', size: 'small' }],
    };
    renderButton({ feedWidgets: stored });

    fireEvent.click(await screen.findByRole('button', { name: 'Not now' }));

    expect(setIsEditing).not.toHaveBeenCalled();
    expect(loggedEvents()).toContain(LogEvent.DismissFeedWidgetsIntro);
    expect(setSettings).toHaveBeenCalledWith({
      flags: {
        feedWidgets: { ...stored, introSeen: FEED_WIDGETS_INTRO_ID },
      },
    });
  });

  it.each([
    [
      'already seen',
      {
        feedWidgets: {
          version: 1,
          widgets: [],
          introSeen: FEED_WIDGETS_INTRO_ID,
        },
      },
    ],
    [
      'a widget already placed',
      {
        feedWidgets: {
          version: 1,
          widgets: [{ id: 'a', kind: 'streak', size: 'tall', slot: 2 }],
        },
      },
    ],
    ['signed out', { isLoggedIn: false }],
  ])('stays closed with %s', (_, options) => {
    renderButton(options);

    expect(screen.getByRole('button', { name: 'Widgets' })).toBeInTheDocument();
    expect(screen.queryByText('Widgets, take two')).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('renders nothing where the feed takes no widgets', () => {
    renderButton({ isEnabled: false });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalled();
  });
});
