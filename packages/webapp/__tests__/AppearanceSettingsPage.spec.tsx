import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import * as readerEligibility from '@dailydotdev/shared/src/components/post/reader/hooks/useReaderModalEligibility';
import * as laptopLayout from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import type { SettingsContextData } from '@dailydotdev/shared/src/contexts/SettingsContext';
import type { SettingsFlags } from '@dailydotdev/shared/src/graphql/settings';
import AppearanceSettingsPage from '../pages/settings/appearance';

type BridgeGlobal = typeof globalThis & { webkit?: unknown };

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(readerEligibility, 'useReaderModalEligibility').mockReturnValue({
    isEligible: false,
    isReaderEnabled: false,
    canShowReaderInstallPrompt: false,
  });
  jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(false);
});

const renderPage = ({
  showFeedbackButton = true,
  toggleShowFeedbackButton = jest.fn(),
  logEvent = jest.fn(),
  settings = {},
}: {
  showFeedbackButton?: boolean;
  toggleShowFeedbackButton?: jest.Mock;
  logEvent?: jest.Mock;
  settings?: Partial<SettingsContextData>;
} = {}) => {
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, isAuthReady: true }}
      settings={{ showFeedbackButton, toggleShowFeedbackButton, ...settings }}
      log={{ logEvent }}
    >
      <AppearanceSettingsPage />
    </TestBootProvider>,
  );

  return { logEvent, toggleShowFeedbackButton };
};

it('offers a new tab or this tab for links in a browser', () => {
  const toggleOpenNewTab = jest.fn();
  renderPage({ settings: { openNewTab: true, toggleOpenNewTab } });

  expect(
    screen.queryByLabelText('Open links in new tab'),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('radio', { name: /A new tab/ })).toBeChecked();

  fireEvent.click(screen.getByRole('radio', { name: /This tab/ }));

  expect(toggleOpenNewTab).toHaveBeenCalledTimes(1);
});

const withReadingBridge = () => {
  (globalThis as BridgeGlobal).webkit = {
    messageHandlers: { reading: { postMessage: jest.fn() } },
  };
  document.documentElement.classList.add('ios');
};

afterEach(() => {
  delete (globalThis as BridgeGlobal).webkit;
  document.documentElement.classList.remove('ios');
});

it('offers daily.dev or Safari for links inside the iOS app', () => {
  withReadingBridge();
  const updateFlag = jest.fn();
  renderPage({ settings: { updateFlag } });

  expect(screen.getByRole('radio', { name: /In daily.dev/ })).toBeChecked();

  fireEvent.click(screen.getByRole('radio', { name: /In Safari/ }));

  expect(updateFlag).toHaveBeenCalledWith('openLinksInAppOptOut', true);
});

it('shows Safari as the choice once links were turned off in the app', () => {
  withReadingBridge();
  const updateFlag = jest.fn();
  renderPage({
    settings: {
      updateFlag,
      flags: {
        openLinksInAppOptOut: true,
      } as Partial<SettingsFlags> as SettingsFlags,
    },
  });

  expect(screen.getByRole('radio', { name: /In Safari/ })).toBeChecked();

  fireEvent.click(screen.getByRole('radio', { name: /In daily.dev/ }));

  expect(updateFlag).toHaveBeenCalledWith('openLinksInAppOptOut', false);
});

it('reflects the feedback button setting on the Appearance page', () => {
  renderPage({ showFeedbackButton: false });

  expect(screen.getByLabelText('Show feedback button')).not.toBeChecked();
});

it('toggles the feedback button setting and logs the shared analytics event', () => {
  const toggleShowFeedbackButton = jest.fn();
  const logEvent = jest.fn();
  renderPage({ toggleShowFeedbackButton, logEvent });

  fireEvent.click(screen.getByLabelText('Show feedback button'));

  expect(toggleShowFeedbackButton).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ChangeSettings,
    target_type: TargetType.FeedbackButton,
    target_id: 'hide',
  });
});

it('logs a show event when re-enabling the feedback button setting', () => {
  const toggleShowFeedbackButton = jest.fn();
  const logEvent = jest.fn();
  renderPage({ showFeedbackButton: false, toggleShowFeedbackButton, logEvent });

  fireEvent.click(screen.getByLabelText('Show feedback button'));

  expect(toggleShowFeedbackButton).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ChangeSettings,
    target_type: TargetType.FeedbackButton,
    target_id: 'show',
  });
});
