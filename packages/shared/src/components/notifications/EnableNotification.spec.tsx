import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import EnableNotification from './EnableNotification';
import { NotificationPromptSource } from '../../lib/log';

const mockUseEnableNotification = jest.fn();
const mockUseNotificationCtaExperiment = jest.fn();

jest.mock('../../hooks/notifications', () => ({
  useEnableNotification: (args: unknown) => mockUseEnableNotification(args),
}));

jest.mock('../../hooks/notifications/useNotificationCtaExperiment', () => ({
  useNotificationCtaExperiment: () => mockUseNotificationCtaExperiment(),
}));

jest.mock('../../lib/constants', () => ({
  webappUrl: 'http://localhost/',
}));

describe('EnableNotification', () => {
  const onDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEnableNotification.mockReturnValue({
      shouldShowCta: true,
      acceptedJustNow: false,
      onEnable: jest.fn(),
      onDismiss,
    });
    mockUseNotificationCtaExperiment.mockReturnValue({ isEnabled: false });
  });

  it.each([false, true])(
    'should keep the notifications page banner overflow visible in cta variant %s',
    (isExperimentEnabled) => {
      mockUseNotificationCtaExperiment.mockReturnValue({
        isEnabled: isExperimentEnabled,
      });

      const { container } = render(
        <EnableNotification
          source={NotificationPromptSource.NotificationsPage}
        />,
      );

      expect(container.firstChild).not.toHaveClass('overflow-hidden');

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toHaveAttribute('type', 'button');

      fireEvent.click(closeButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    },
  );

  it.each([false, true])(
    'should preserve overflow clipping for non notifications-page banners in cta variant %s',
    (isExperimentEnabled) => {
      mockUseNotificationCtaExperiment.mockReturnValue({
        isEnabled: isExperimentEnabled,
      });

      const { container } = render(
        <EnableNotification
          source={NotificationPromptSource.SourceSubscribe}
        />,
      );

      expect(container.firstChild).toHaveClass('overflow-hidden');
    },
  );
});
