import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { GetAppButton } from './GetAppButton';
import { useViewSize } from '../../../hooks';
import { appStoreUrl, playStoreUrl } from '../../../lib/constants';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: jest.fn(),
}));

const mockUseViewSize = useViewSize as jest.Mock;

// TestBootProvider defaults to a logged-in session; this surface is for
// anonymous visitors, so the tests start logged out and opt in explicitly.
const renderComponent = (props = {}, auth = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ isLoggedIn: false, ...auth }}
    >
      <GetAppButton {...props} />
    </TestBootProvider>,
  );

const triggerName = /get the daily\.dev mobile app/i;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(true);
});

describe('GetAppButton', () => {
  it('should render the trigger for anonymous desktop visitors', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: triggerName }),
    ).toBeInTheDocument();
  });

  it('should render nothing for logged-in users', () => {
    renderComponent({}, { isLoggedIn: true });

    expect(
      screen.queryByRole('button', { name: triggerName }),
    ).not.toBeInTheDocument();
  });

  it('should render nothing below laptop, where the app is already at hand', () => {
    mockUseViewSize.mockReturnValue(false);
    renderComponent();

    expect(
      screen.queryByRole('button', { name: triggerName }),
    ).not.toBeInTheDocument();
  });

  // The Android wrapper has no isIOSNative()-style runtime bridge and is
  // flagged through boot data instead. A tablet/desktop-mode viewport can
  // satisfy the laptop breakpoint from inside the app, so the boot signal must
  // veto the viewport gate.
  it('should render nothing inside the Android app even at laptop width', () => {
    renderComponent({}, { isAndroidApp: true });

    expect(
      screen.queryByRole('button', { name: triggerName }),
    ).not.toBeInTheDocument();
  });

  it('should show the QR code and both store links once opened', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: triggerName }));

    expect(
      await screen.findByRole('img', { name: /qr code/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'App Store' })).toHaveAttribute(
      'href',
      appStoreUrl,
    );
    expect(screen.getByRole('link', { name: 'Google Play' })).toHaveAttribute(
      'href',
      playStoreUrl,
    );
  });

  it('should render the label instead of the tooltip when asked', () => {
    renderComponent({ showLabel: true });

    expect(screen.getByText('Get the app')).toBeInTheDocument();
  });
});
