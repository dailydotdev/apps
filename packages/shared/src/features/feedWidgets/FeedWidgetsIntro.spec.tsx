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
  FeedWidgetPromo,
  FeedWidgetsCustomizeButton,
  InFeedWidgetsProvider,
} from './InFeedWidgetsContext';
import { useFeedWidgetsIntro } from './feedState';
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

describe('FeedWidgetPromo', () => {
  const setAddingSlot = jest.fn();
  const onDismiss = jest.fn();

  const renderPromo = (): void => {
    const value: InFeedWidgetsContextValue = {
      isEnabled: true,
      isEditing: false,
      setIsEditing,
      addingSlot: null,
      setAddingSlot,
      setConfiguringId: jest.fn(),
      setFlashId: jest.fn(),
    };
    render(
      <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
        <InFeedWidgetsProvider value={value}>
          <FeedWidgetPromo slot={5} onDismiss={onDismiss} />
        </InFeedWidgetsProvider>
      </TestBootProvider>,
    );
  };

  it('opens the gallery for its own card', () => {
    renderPromo();

    fireEvent.click(screen.getByRole('button', { name: /Put a widget here/ }));

    expect(setAddingSlot).toHaveBeenCalledWith(5);
    expect(loggedEvents()).toEqual([
      LogEvent.ImpressionFeedWidgetsPromo,
      LogEvent.ClickFeedWidgetsPromo,
    ]);
  });

  it('closes for good on Not now', () => {
    renderPromo();

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));

    expect(onDismiss).toHaveBeenCalled();
    expect(setAddingSlot).not.toHaveBeenCalled();
    expect(loggedEvents()).toContain(LogEvent.DismissFeedWidgetsPromo);
  });
});

describe('useFeedWidgetsIntro', () => {
  const Probe = ({ field }: { field: 'introSeen' | 'promoSeen' }) => {
    const { isOpen } = useFeedWidgetsIntro(field);
    return <span>{isOpen ? 'open' : 'closed'}</span>;
  };

  it('keeps the card open after the button intro was seen, and back', () => {
    const feedWidgets = {
      version: 1,
      widgets: [],
      introSeen: FEED_WIDGETS_INTRO_ID,
    };
    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn: true }}
        settings={{ flags: { feedWidgets } as unknown as SettingsFlags }}
      >
        <Probe field="introSeen" />
        <Probe field="promoSeen" />
      </TestBootProvider>,
    );

    expect(
      screen.getAllByText(/open|closed/).map((el) => el.textContent),
    ).toEqual(['closed', 'open']);
  });
});
