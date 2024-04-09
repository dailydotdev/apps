import { renderHook } from '@testing-library/react-hooks';
import { useRouter } from 'next/router';
import { useRouterOnChange } from './useRouterOnChange';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockedRouter = useRouter as jest.Mock;

describe('useRouterOnChange', () => {
  let mockRouter = null;

  beforeEach(() => {
    mockRouter = {
      isReady: true,
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
    };

    mockedRouter.mockReturnValue(mockRouter);
  });

  it('should subscribe to route changes when enabled', () => {
    const onChange = jest.fn();
    renderHook(() => useRouterOnChange({ onChange, enabled: true }));

    expect(mockRouter.events.on).toHaveBeenCalledWith(
      'routeChangeStart',
      onChange,
    );
  });

  it('should not subscribe to route changes when not enabled', () => {
    const onChange = jest.fn();
    renderHook(() => useRouterOnChange({ onChange, enabled: false }));

    expect(mockRouter.events.on).not.toHaveBeenCalled();
  });

  it('should unsubscribe from route changes when enabled is set to false', () => {
    const onChange = jest.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useRouterOnChange({ onChange, enabled }),
      {
        initialProps: { enabled: true },
      },
    );

    expect(mockRouter.events.on).toHaveBeenCalledWith(
      'routeChangeStart',
      onChange,
    );

    rerender({ enabled: false });

    expect(mockRouter.events.off).toHaveBeenCalledWith(
      'routeChangeStart',
      onChange,
    );
  });

  it('should not subscribe or unsubscribe if router is not ready', () => {
    mockRouter.isReady = false;
    const onChange = jest.fn();
    renderHook(() => useRouterOnChange({ onChange, enabled: true }));

    expect(mockRouter.events.on).not.toHaveBeenCalled();
    expect(mockRouter.events.off).not.toHaveBeenCalled();
  });
});
