import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as func from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import CallbackPage from '../callback';

const WEBAPP_URL = 'https://app.daily.dev';

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = { ...originalEnv, NEXT_PUBLIC_WEBAPP_URL: WEBAPP_URL };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock functions
const mockLogEvent = jest.fn();

// Mock context value
const mockContextValue = {
  logEvent: mockLogEvent,
  logEventStart: () => {},
  logEventEnd: () => {},
  sendBeacon: () => {},
};

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(public channelName: string) {}

  postMessage = jest.fn();

  close = jest.fn();
}

describe('CallbackPage', () => {
  // Mock window methods
  const mockReplace = jest.fn();
  const mockClose = jest.fn();
  let originalWindow: typeof window;

  beforeEach(() => {
    jest.clearAllMocks();

    // Store original window
    originalWindow = { ...window };

    // Mock window methods
    Object.defineProperty(window, 'close', {
      configurable: true,
      value: mockClose,
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { replace: mockReplace, search: '' },
    });

    // Reset window.opener
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: null,
    });

    // Mock BroadcastChannel
    // @ts-expect-error - we know BroadcastChannel exists
    global.BroadcastChannel = MockBroadcastChannel;
  });

  afterEach(() => {
    // Restore original window properties
    Object.defineProperty(window, 'close', {
      configurable: true,
      value: originalWindow.close,
    });
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: originalWindow.location,
    });
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: originalWindow.opener,
    });

    jest.restoreAllMocks();
  });

  const renderCallback = (search = ''): RenderResult => {
    window.location.search = search;
    return render(
      <LogContext.Provider value={mockContextValue}>
        <CallbackPage />
      </LogContext.Provider>,
    );
  };

  it('should handle reset password flow', () => {
    const search = '?flow=reset&settings=test';
    renderCallback(search);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'registration callback',
      extra: JSON.stringify({ flow: 'reset', settings: 'test' }),
    });
    expect(mockReplace).toHaveBeenCalledWith(
      '/reset-password?flow=reset&settings=test',
    );
  });

  it('should handle login flow with window opener', () => {
    const search = '?login=true&token=123';
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: { postMessage: jest.fn() },
    });
    jest.spyOn(func, 'postWindowMessage');

    renderCallback(search);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'registration callback',
      extra: JSON.stringify({ login: 'true', token: '123' }),
    });
    expect(func.postWindowMessage).toHaveBeenCalledWith(AuthEvent.Login, {
      login: 'true',
      token: '123',
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it('should handle social registration flow without window opener', () => {
    const search = '?registration=true&token=456';
    jest.spyOn(func, 'broadcastMessage');

    renderCallback(search);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'registration callback',
      extra: JSON.stringify({ registration: 'true', token: '456' }),
    });
    expect(func.broadcastMessage).toHaveBeenCalledWith({
      registration: 'true',
      token: '456',
      eventKey: AuthEvent.SocialRegistration,
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it('should handle Facebook referrer case', () => {
    const search = '?login=true&token=789';
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: { postMessage: jest.fn() },
    });
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://www.facebook.com/',
    });
    jest.spyOn(func, 'broadcastMessage');

    renderCallback(search);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'registration callback',
      extra: JSON.stringify({ login: 'true', token: '789' }),
    });
    expect(func.broadcastMessage).toHaveBeenCalledWith({
      login: 'true',
      token: '789',
      eventKey: AuthEvent.Login,
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it('should handle errors by redirecting to webapp URL', () => {
    const search = '?error=true';
    // Mock broadcastMessage to throw an error
    jest.spyOn(func, 'broadcastMessage').mockImplementation(() => {
      throw new Error('Failed to broadcast');
    });

    renderCallback(search);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'registration callback',
      extra: JSON.stringify({ error: 'true' }),
    });
    expect(mockReplace).toHaveBeenCalledWith(`${WEBAPP_URL}?error=true`);
  });

  it('should render nothing', () => {
    const { container } = renderCallback();
    expect(container).toBeEmptyDOMElement();
  });
});
