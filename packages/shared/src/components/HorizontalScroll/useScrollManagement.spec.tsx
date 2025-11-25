import { act, renderHook } from '@testing-library/react';
import { useScrollManagement } from './useScrollManagement';
import useDebounceFn from '../../hooks/useDebounceFn';

jest.mock('../../hooks/useDebounceFn');

describe('useScrollManagement', () => {
  let mockElement: HTMLElement;
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

    mockElement = document.createElement('div');

    Object.defineProperty(mockElement, 'scrollWidth', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(mockElement, 'clientWidth', {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(mockElement, 'scrollLeft', {
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
      useScrollManagement(mockElement, onScrollMock),
    );

    mockElement.scrollLeft = 0;
    mockElement.dispatchEvent(new Event('scroll'));

    expect(result.current.isAtStart).toBe(true);
    expect(result.current.isAtEnd).toBe(false);
  });

  it('should set isAtEnd to true when scrolled to the end', () => {
    const { result } = renderHook(() =>
      useScrollManagement(mockElement, onScrollMock),
    );

    act(() => {
      // Simulate scrolling to the end
      mockElement.scrollLeft = 500;
      mockElement.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isAtEnd).toBe(true);
    expect(result.current.isAtStart).toBe(false);
  });

  it('should call onScroll when scrolled', () => {
    renderHook(() => useScrollManagement(mockElement, onScrollMock));

    mockElement.dispatchEvent(new Event('scroll'));

    expect(onScrollMock).toHaveBeenCalledWith(mockElement);
  });

  it('should debounce the scroll event', () => {
    const debouncedFunction = jest.fn();
    (useDebounceFn as jest.Mock).mockImplementation(() => [debouncedFunction]);

    renderHook(() => useScrollManagement(mockElement, onScrollMock));

    mockElement.dispatchEvent(new Event('scroll'));

    expect(debouncedFunction).toHaveBeenCalled();
  });
});
