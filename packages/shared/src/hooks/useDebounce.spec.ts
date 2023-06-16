import { renderHook } from '@testing-library/preact-hooks';
import { waitFor } from '@testing-library/preact';
import useDebounce from './useDebounce';

it('should call the callback only once', async () => {
  const mock = jest.fn();
  const { result } = renderHook(() => useDebounce(mock, 10));
  const [callback] = result.current as ReturnType<typeof useDebounce>;
  callback();
  callback();
  await waitFor(() => expect(mock).toBeCalledTimes(1));
});

it('should call the callback again after the cooldown period', async () => {
  const mock = jest.fn();
  const { result } = renderHook(() => useDebounce(mock, 10));
  const [callback] = result.current as ReturnType<typeof useDebounce>;
  callback();
  await waitFor(() => expect(mock).toBeCalledTimes(1));
  callback();
  await waitFor(() => expect(mock).toBeCalledTimes(2));
});
