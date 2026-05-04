import { act, renderHook } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useExitConfirmation } from './useExitConfirmation';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('useExitConfirmation', () => {
  let mockRouter: NextRouter;
  let routerEventHandlers: Record<string, () => void>;
  let windowEventHandlers: Map<string, EventListener>;

  beforeEach(() => {
    routerEventHandlers = {};
    windowEventHandlers = new Map();

    jest.spyOn(window, 'addEventListener').mockImplementation(((
      event: string,
      handler: EventListenerOrEventListenerObject,
    ) => {
      if (typeof handler === 'function') {
        windowEventHandlers.set(event, handler);
      }
    }) as typeof window.addEventListener);

    jest.spyOn(window, 'removeEventListener').mockImplementation(((
      event: string,
    ) => {
      windowEventHandlers.delete(event);
    }) as typeof window.removeEventListener);

    mockRouter = {
      isReady: true,
      events: {
        on: jest.fn((event: string, handler: () => void) => {
          routerEventHandlers[event] = handler;
        }),
        off: jest.fn((event: string) => {
          delete routerEventHandlers[event];
        }),
        emit: jest.fn(),
      },
    } as unknown as NextRouter;

    jest.mocked(useRouter).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not register confirmation handlers when disabled', () => {
    renderHook(() =>
      useExitConfirmation({
        enabled: false,
        onValidateAction: () => false,
      }),
    );

    expect(window.addEventListener).not.toHaveBeenCalled();
    expect(mockRouter.events.on).not.toHaveBeenCalled();
  });

  it('prevents page unload when confirmation is enabled and validation fails', () => {
    renderHook(() =>
      useExitConfirmation({
        onValidateAction: () => false,
      }),
    );

    const event = {
      preventDefault: jest.fn(),
      returnValue: undefined as string | undefined,
    } as unknown as BeforeUnloadEvent;

    act(() => {
      windowEventHandlers.get('beforeunload')?.(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe(
      'You have unsaved changes that will be lost if you leave the page',
    );
  });

  it('aborts route navigation when the user rejects confirmation', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    renderHook(() =>
      useExitConfirmation({
        message: 'Leave the page?',
        onValidateAction: () => false,
      }),
    );

    expect(() => {
      act(() => {
        routerEventHandlers.routeChangeStart();
      });
    }).toThrow(
      'Route change aborted by useExitConfirmation. Please ignore this error.',
    );

    expect(window.confirm).toHaveBeenCalledWith('Leave the page?');
    expect(mockRouter.events.emit).toHaveBeenCalledWith('routeChangeError');
  });
});
