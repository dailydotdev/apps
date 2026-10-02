import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import * as readerEligibility from '@dailydotdev/shared/src/components/post/reader/hooks/useReaderModalEligibility';
import * as layoutVariant from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import AppearanceSettingsPage from '../pages/settings/appearance';

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(readerEligibility, 'useReaderModalEligibility').mockReturnValue({
    isEligible: false,
    isReaderEnabled: false,
    canShowReaderInstallPrompt: false,
  });
  jest
    .spyOn(layoutVariant, 'useLayoutVariant')
    .mockReturnValue({ isV2: false, isLoading: false });
});

const renderPage = ({
  showFeedbackButton = true,
  toggleShowFeedbackButton = jest.fn(),
  logEvent = jest.fn(),
}: {
  showFeedbackButton?: boolean;
  toggleShowFeedbackButton?: jest.Mock;
  logEvent?: jest.Mock;
} = {}) => {
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, isAuthReady: true }}
      settings={{ showFeedbackButton, toggleShowFeedbackButton }}
      log={{ logEvent }}
    >
      <AppearanceSettingsPage />
    </TestBootProvider>,
  );

  return { logEvent, toggleShowFeedbackButton };
};

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
