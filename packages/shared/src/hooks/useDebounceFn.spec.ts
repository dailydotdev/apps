import { renderHook, waitFor } from '@testing-library/react';
import useDebounceFn from './useDebounceFn';

it('should call the callback only once', async () => {
  const mock = jest.fn();
  const { result } = renderHook(() => useDebounceFn(mock, 10));
  const [callback] = result.current as ReturnType<typeof useDebounceFn>;
  callback();
  callback();
  await waitFor(() => expect(mock).toBeCalledTimes(1));
});

it('should call the callback again after the cooldown period', async () => {
  const mock = jest.fn();
  const { result } = renderHook(() => useDebounceFn(mock, 10));
  const [callback] = result.current as ReturnType<typeof useDebounceFn>;
  callback();
  await waitFor(() => expect(mock).toBeCalledTimes(1));
  callback();
  await waitFor(() => expect(mock).toBeCalledTimes(2));
});
