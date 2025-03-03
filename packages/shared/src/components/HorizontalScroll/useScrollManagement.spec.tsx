import { act, renderHook } from '@testing-library/react';
import { useScrollManagement } from './useScrollManagement';
import useDebounceFn from '../../hooks/useDebounceFn';

jest.mock('../../hooks/useDebounceFn');

describe('useScrollManagement', () => {
  let mockRef: { current: HTMLElement | null };
  let onScrollMock: jest.Mock;
  let mockResizeObserver: jest.Mock;
  let mockObserve: jest.Mock;
  let mockDisconnect: jest.Mock;

  beforeEach(() => {
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();

    mockResizeObserver = jest.fn().mockImplementation(() => {
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn(),
      };
    });

    global.ResizeObserver = mockResizeObserver;

    onScrollMock = jest.fn();

    mockRef = {
      current: document.createElement('div'),
    };

    Object.defineProperty(mockRef.current, 'scrollWidth', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(mockRef.current, 'clientWidth', {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(mockRef.current, 'scrollLeft', {
      value: 0,
      writable: true,
    });

    (useDebounceFn as jest.Mock).mockImplementation((fn) => [fn]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set isAtStart to true when scrolled to the start', () => {
    const { result } = renderHook(() =>
      useScrollManagement(mockRef, onScrollMock),
    );

    if (mockRef.current) {
      mockRef.current.scrollLeft = 0;
      mockRef.current.dispatchEvent(new Event('scroll'));
    }

    expect(result.current.isAtStart).toBe(true);
    expect(result.current.isAtEnd).toBe(false);
  });

  it('should set isAtEnd to true when scrolled to the end', () => {
    const { result } = renderHook(() =>
      useScrollManagement(mockRef, onScrollMock),
    );

    act(() => {
      if (mockRef.current) {
        // Simulate scrolling to the end
        mockRef.current.scrollLeft = 500;
        mockRef.current.dispatchEvent(new Event('scroll'));
      }
    });

    expect(result.current.isAtEnd).toBe(true);
    expect(result.current.isAtStart).toBe(false);
  });

  it('should call onScroll when scrolled', () => {
    renderHook(() => useScrollManagement(mockRef, onScrollMock));

    if (mockRef.current) {
      mockRef.current.dispatchEvent(new Event('scroll'));
    }

    expect(onScrollMock).toHaveBeenCalledWith(mockRef);
  });

  it('should debounce the scroll event', () => {
    const debouncedFunction = jest.fn();
    (useDebounceFn as jest.Mock).mockImplementation(() => [debouncedFunction]);

    renderHook(() => useScrollManagement(mockRef, onScrollMock));

    if (mockRef.current) {
      mockRef.current.dispatchEvent(new Event('scroll'));
    }

    expect(debouncedFunction).toHaveBeenCalled();
  });
});
