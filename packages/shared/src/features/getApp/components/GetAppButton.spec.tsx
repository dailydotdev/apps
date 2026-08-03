import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { GetAppButton } from './GetAppButton';
import { isIOSNative } from '../../../lib/func';
import { appStoreUrl, playStoreUrl } from '../../../lib/constants';

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  isIOSNative: jest.fn(),
}));

const mockIsIOSNative = isIOSNative as jest.Mock;

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
  mockIsIOSNative.mockReturnValue(false);
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

  // The desktop-only half of the gate is CSS, not JS, so the SSR HTML already
  // contains the pill and hydration doesn't reflow Log in / Sign up. jsdom
  // applies no stylesheets, so the assertable contract is the classes.
  it('should gate the desktop breakpoint in CSS to avoid a hydration reflow', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: triggerName })).toHaveClass(
      'hidden',
      'laptop:flex',
    );
  });

  // The wrappers render this same webapp shell and a tablet/desktop-mode
  // viewport can satisfy the laptop breakpoint from inside the app, so both
  // need a JS veto the CSS gate can't provide. iOS is detected through its
  // WebKit runtime bridge.
  it('should render nothing inside the iOS app even at laptop width', () => {
    mockIsIOSNative.mockReturnValue(true);
    renderComponent();

    expect(
      screen.queryByRole('button', { name: triggerName }),
    ).not.toBeInTheDocument();
  });

  // Android has no isIOSNative()-style runtime bridge and is flagged through
  // boot data instead.
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
