import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as func from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import CallbackPage from '../callback';

/**
 * Extend Jest matchers
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeNull(): R;
    }
  }
}

const mockLogEvent = jest.fn();

jest.mock('@dailydotdev/shared/src/contexts/LogContext', () => ({
  __esModule: true,
  default: {
    Consumer: jest.fn(),
    Provider: jest.fn(),
  },
  LogContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Create mock context
const MockLogContext = React.createContext({ logEvent: mockLogEvent });

// Mock the window location and opener
const mockReplace = jest.fn();
const mockClose = jest.fn();

describe('CallbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup window mocks
    delete (window as any).location;
    (window as any).location = { replace: mockReplace, search: '' };
    (window as any).close = mockClose;
    delete (window as any).opener;
  });

  const renderCallback = (search = ''): RenderResult => {
    window.location.search = search;
    return render(
      <MockLogContext.Provider value={{ logEvent: mockLogEvent }}>
        <CallbackPage />
      </MockLogContext.Provider>,
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
    window.opener = { postMessage: jest.fn() };
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
    window.opener = { postMessage: jest.fn() };
    Object.defineProperty(document, 'referrer', {
      value: 'https://www.facebook.com/',
      configurable: true,
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
    window.opener = { postMessage: null };
    process.env.NEXT_PUBLIC_WEBAPP_URL = 'https://app.daily.dev';

    renderCallback(search);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'registration callback',
      extra: JSON.stringify({ error: 'true' }),
    });
    expect(mockReplace).toHaveBeenCalledWith(
      'https://app.daily.dev?error=true',
    );
  });

  it('should render nothing', () => {
    const { container } = renderCallback();
    // Using a basic assertion that doesn't require custom matchers
    expect(container).toBeEmptyDOMElement();
  });
});
