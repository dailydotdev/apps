import { renderHook, act } from '@testing-library/react';
import { useEffectEvent } from './useEffectEvent';

describe('useEffectEvent', () => {
  it('should return a stable function reference', () => {
    const handler = jest.fn();
    const { result, rerender } = renderHook(() => useEffectEvent(handler));

    // Capture the initial stable handler reference
    const stableHandlerRef = result.current;

    // Re-render without changing the handler
    rerender();

    // The stable handler reference should remain the same across renders
    expect(result.current).toBe(stableHandlerRef);
  });

  it('should call the latest handler provided', () => {
    const initialHandler = jest.fn();
    const { result, rerender } = renderHook(
      (props) => useEffectEvent(props.handler),
      { initialProps: { handler: initialHandler } },
    );

    // Call the stable handler
    act(() => {
      result.current();
    });
    expect(initialHandler).toHaveBeenCalledTimes(1);

    // Update to a new handler and verify the previous reference is updated
    const newHandler = jest.fn();
    rerender({ handler: newHandler });

    // Call the stable handler again
    act(() => {
      result.current();
    });

    // Check that the new handler is called instead of the old one
    expect(initialHandler).toHaveBeenCalledTimes(1); // No additional calls
    expect(newHandler).toHaveBeenCalledTimes(1); // New handler should have been called
  });

  it('should pass arguments correctly to the latest handler', () => {
    const handler = jest.fn();
    const { result, rerender } = renderHook(
      (props) => useEffectEvent(props.handler),
      { initialProps: { handler } },
    );

    const args = [1, 'test', { key: 'value' }];

    // Call the stable handler with arguments
    act(() => {
      result.current(...args);
    });

    expect(handler).toHaveBeenCalledWith(...args);

    // Change the handler and test that it receives arguments correctly
    const newHandler = jest.fn();
    rerender({ handler: newHandler });

    act(() => {
      result.current(...args);
    });

    expect(newHandler).toHaveBeenCalledWith(...args);
  });
});
