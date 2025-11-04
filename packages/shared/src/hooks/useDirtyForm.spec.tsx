import { renderHook, act } from '@testing-library/react';
import type { UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { useDirtyForm } from './useDirtyForm';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));

describe('useDirtyForm', () => {
  let mockRouter: Partial<NextRouter>;
  let mockOpenModal: jest.Mock;
  let mockFormMethods: UseFormReturn;
  let mockOnSave: jest.Mock;
  let mockOnDiscard: jest.Mock;
  let routerEventHandlers: Record<string, (url: string) => void>;
  let windowEventHandlers: Map<string, EventListener>;

  beforeEach(() => {
    routerEventHandlers = {};
    windowEventHandlers = new Map();

    window.addEventListener = jest.fn(
      (event: string, handler: EventListener) => {
        windowEventHandlers.set(event, handler);
      },
    );

    window.removeEventListener = jest.fn((event: string) => {
      windowEventHandlers.delete(event);
    });

    mockRouter = {
      asPath: '/current-path',
      push: jest.fn(),
      events: {
        on: jest.fn((event: string, handler: (url: string) => void) => {
          routerEventHandlers[event] = handler;
        }),
        off: jest.fn((event: string) => {
          delete routerEventHandlers[event];
        }),
        emit: jest.fn(),
      },
    };

    mocked(useRouter).mockReturnValue(mockRouter as NextRouter);

    mockOpenModal = jest.fn();
    mocked(useLazyModal).mockReturnValue({
      openModal: mockOpenModal,
    } as ReturnType<typeof useLazyModal>);

    mockFormMethods = {
      formState: {
        isDirty: false,
      },
    } as unknown as UseFormReturn;

    mockOnSave = jest.fn();
    mockOnDiscard = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('navigation prevention', () => {
    it('should not prevent navigation when form is clean', () => {
      renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      act(() => {
        routerEventHandlers.routeChangeStart('/new-path');
      });

      expect(mockOpenModal).not.toHaveBeenCalled();
      expect(mockRouter.events.emit).not.toHaveBeenCalled();
    });

    it('should prevent navigation when form is dirty', () => {
      mockFormMethods.formState.isDirty = true;

      renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/new-path');
        });
      }).toThrow('Route change aborted.');

      expect(mockOpenModal).toHaveBeenCalledWith({
        type: LazyModal.DirtyForm,
        props: {
          onDiscard: expect.any(Function),
          onSave: mockOnSave,
        },
      });
      expect(mockRouter.events.emit).toHaveBeenCalledWith('routeChangeError');
    });

    it('should allow navigation when allowNavigation is called', () => {
      mockFormMethods.formState.isDirty = true;

      const { result } = renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      act(() => {
        result.current.allowNavigation();
      });

      act(() => {
        routerEventHandlers.routeChangeStart('/new-path');
      });

      expect(mockOpenModal).not.toHaveBeenCalled();
      expect(mockRouter.events.emit).not.toHaveBeenCalled();
    });
  });

  describe('pending navigation', () => {
    it('should store pending URL when navigation is prevented', () => {
      mockFormMethods.formState.isDirty = true;

      const { result } = renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/new-path');
        });
      }).toThrow('Route change aborted.');

      expect(result.current.hasPendingNavigation()).toBe(true);
    });

    it('should navigate to pending URL when navigateToPending is called', () => {
      mockFormMethods.formState.isDirty = true;

      const { result } = renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/new-path');
        });
      }).toThrow('Route change aborted.');

      act(() => {
        result.current.navigateToPending();
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/new-path');
      expect(result.current.hasPendingNavigation()).toBe(false);
    });
  });

  describe('discard functionality', () => {
    it('should call onDiscard when handleDiscard is invoked from modal', () => {
      mockFormMethods.formState.isDirty = true;

      renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/new-path');
        });
      }).toThrow('Route change aborted.');

      const modalProps = mockOpenModal.mock.calls[0][0].props;

      act(() => {
        modalProps.onDiscard();
      });

      expect(mockOnDiscard).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/new-path');
    });

    it('should navigate to pending URL after discard', () => {
      mockFormMethods.formState.isDirty = true;

      const { result } = renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/new-path');
        });
      }).toThrow('Route change aborted.');

      const modalProps = mockOpenModal.mock.calls[0][0].props;

      act(() => {
        modalProps.onDiscard();
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/new-path');
      expect(result.current.hasPendingNavigation()).toBe(false);
    });
  });

  describe('beforeunload event', () => {
    it('should prevent page unload when form is dirty', () => {
      mockFormMethods.formState.isDirty = true;

      renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
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
      expect(event.returnValue).toBe('');
    });

    it('should not prevent page unload when form is clean', () => {
      mockFormMethods.formState.isDirty = false;

      renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      const event = {
        preventDefault: jest.fn(),
        returnValue: undefined as string | undefined,
      } as unknown as BeforeUnloadEvent;

      act(() => {
        windowEventHandlers.get('beforeunload')?.(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.returnValue).toBeUndefined();
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      unmount();

      expect(mockRouter.events.off).toHaveBeenCalledWith(
        'routeChangeStart',
        expect.any(Function),
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid navigation attempts', () => {
      mockFormMethods.formState.isDirty = true;

      const { result } = renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/path1');
        });
      }).toThrow('Route change aborted.');

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/path2');
        });
      }).toThrow('Route change aborted.');

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/path3');
        });
      }).toThrow('Route change aborted.');

      act(() => {
        result.current.navigateToPending();
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/path3');
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
    });

    it('should handle onDiscard not being provided', () => {
      mockFormMethods.formState.isDirty = true;

      renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
        }),
      );

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/new-path');
        });
      }).toThrow('Route change aborted.');

      const modalProps = mockOpenModal.mock.calls[0][0].props;

      act(() => {
        modalProps.onDiscard();
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/new-path');
    });

    it('should handle form state changes during lifecycle', () => {
      const { rerender } = renderHook(() =>
        useDirtyForm(mockFormMethods, {
          onSave: mockOnSave,
          onDiscard: mockOnDiscard,
        }),
      );

      act(() => {
        routerEventHandlers.routeChangeStart('/new-path');
      });
      expect(mockOpenModal).not.toHaveBeenCalled();

      mockFormMethods.formState.isDirty = true;
      rerender();

      expect(() => {
        act(() => {
          routerEventHandlers.routeChangeStart('/another-path');
        });
      }).toThrow('Route change aborted.');
      expect(mockOpenModal).toHaveBeenCalled();

      mockFormMethods.formState.isDirty = false;
      rerender();

      act(() => {
        routerEventHandlers.routeChangeStart('/final-path');
      });
      expect(mockOpenModal).toHaveBeenCalledTimes(1);
    });
  });
});
