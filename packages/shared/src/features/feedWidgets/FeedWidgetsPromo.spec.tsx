import type { ReactElement } from 'react';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
import { useFeedWidgetsPromo } from './feedState';
import { FEED_WIDGETS_INTRO_ID, FEED_WIDGETS_PROMO_MAX_VIEWS } from './types';

const setSettings = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();
const setIsEditing = jest.fn();
const setAddingSlot = jest.fn();
const setIsButtonTipOpen = jest.fn();

const contextValue = (
  overrides: Partial<InFeedWidgetsContextValue> = {},
): InFeedWidgetsContextValue => ({
  isEnabled: true,
  isEditing: false,
  setIsEditing,
  addingSlot: null,
  setAddingSlot,
  setConfiguringId: jest.fn(),
  setFlashId: jest.fn(),
  setIsButtonTipOpen,
  ...overrides,
});

const loggedEvents = () =>
  logEvent.mock.calls.map(([event]) => event.event_name);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FeedWidgetPromo', () => {
  const onView = jest.fn();
  const onDone = jest.fn();

  const renderPromo = (): void => {
    render(
      <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
        <InFeedWidgetsProvider value={contextValue()}>
          <FeedWidgetPromo slot={5} onView={onView} onDone={onDone} />
        </InFeedWidgetsProvider>
      </TestBootProvider>,
    );
  };

  it('counts the visit it was seen on', () => {
    renderPromo();

    expect(onView).toHaveBeenCalledTimes(1);
    expect(loggedEvents()).toEqual([LogEvent.ImpressionFeedWidgetsPromo]);
  });

  it('opens the gallery for its own card, ends, and points at the button', () => {
    renderPromo();

    fireEvent.click(screen.getByRole('button', { name: /Put a widget here/ }));

    expect(setAddingSlot).toHaveBeenCalledWith(5);
    expect(onDone).toHaveBeenCalled();
    expect(setIsButtonTipOpen).toHaveBeenCalledWith(true);
    expect(loggedEvents()).toContain(LogEvent.ClickFeedWidgetsPromo);
  });

  it('ends on Not now without opening anything', () => {
    renderPromo();

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));

    expect(onDone).toHaveBeenCalled();
    expect(setAddingSlot).not.toHaveBeenCalled();
    expect(setIsButtonTipOpen).not.toHaveBeenCalled();
    expect(loggedEvents()).toContain(LogEvent.DismissFeedWidgetsPromo);
  });
});

describe('useFeedWidgetsPromo', () => {
  let promo: ReturnType<typeof useFeedWidgetsPromo>;
  const Probe = (): ReactElement => {
    promo = useFeedWidgetsPromo();
    return <span>{promo.isOpen ? 'open' : 'closed'}</span>;
  };

  const renderHook = (feedWidgets?: unknown, isLoggedIn = true): void => {
    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn }}
        settings={{
          flags: { feedWidgets } as unknown as SettingsFlags,
          setSettings,
        }}
      >
        <Probe />
      </TestBootProvider>,
    );
  };

  it('counts a visit once per page load, keeping the stored widgets', async () => {
    const stored = { version: 1, widgets: [], promoViews: 2 };
    renderHook(stored);

    expect(screen.getByText('open')).toBeInTheDocument();
    await act(async () => {
      promo.countView();
      promo.countView();
    });

    expect(setSettings).toHaveBeenCalledTimes(1);
    expect(setSettings).toHaveBeenCalledWith({
      flags: { feedWidgets: { ...stored, promoViews: 3 } },
    });
  });

  it.each([
    [
      'after its last visit',
      { version: 1, widgets: [], promoViews: FEED_WIDGETS_PROMO_MAX_VIEWS + 1 },
    ],
    [
      'once acted on',
      { version: 1, widgets: [], promoSeen: FEED_WIDGETS_INTRO_ID },
    ],
    [
      'once a widget is placed',
      {
        version: 1,
        widgets: [{ id: 'a', kind: 'streak', size: 'tall', slot: 2 }],
      },
    ],
  ])('stays closed %s', (_, feedWidgets) => {
    renderHook(feedWidgets);

    expect(screen.getByText('closed')).toBeInTheDocument();
  });

  it('stays closed when signed out', () => {
    renderHook(undefined, false);

    expect(screen.getByText('closed')).toBeInTheDocument();
  });
});

describe('FeedWidgetsCustomizeButton tip', () => {
  const renderButton = (
    overrides: Partial<InFeedWidgetsContextValue> = {},
  ): void => {
    render(
      <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
        <InFeedWidgetsProvider value={contextValue(overrides)}>
          <FeedWidgetsCustomizeButton size={ButtonSize.Small} />
        </InFeedWidgetsProvider>
      </TestBootProvider>,
    );
  };
  const tip = /Your widgets live here/;

  it('shows where widgets live once the gallery closes', () => {
    renderButton({ isButtonTipOpen: true });

    expect(screen.getByText(tip)).toBeInTheDocument();
  });

  it('waits while the gallery is open', () => {
    renderButton({ isButtonTipOpen: true, addingSlot: 5 });

    expect(screen.queryByText(tip)).not.toBeInTheDocument();
  });

  it('closes when the reader uses the button', () => {
    renderButton({ isButtonTipOpen: true });

    fireEvent.click(screen.getByRole('button', { name: 'Widgets' }));

    expect(setIsButtonTipOpen).toHaveBeenCalledWith(false);
    expect(setIsEditing).toHaveBeenCalledWith(true);
  });

  it('renders nothing where the feed takes no widgets', () => {
    renderButton({ isEnabled: false });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
