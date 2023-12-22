import { renderHook } from '@testing-library/react-hooks';
import { usePrevious } from '.';

const setUp = () =>
  renderHook(({ state }) => usePrevious(state), {
    initialProps: { state: 'a' },
  });

it('should return undefined on initial render', () => {
  const { result } = setUp();

  expect(result.current).toBeUndefined();
});

it('should always return previous state after each update', () => {
  const { result, rerender } = setUp();

  rerender({ state: 'b' });
  expect(result.current).toBe('a');

  rerender({ state: 'c' });
  expect(result.current).toBe('b');

  rerender({ state: 'd' });
  expect(result.current).toBe('c');
});
