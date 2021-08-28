import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import useDebounce from './useDebounce';

it('should call the callback only once', async () => {
  const mock = jest.fn();
  const { result } = renderHook(() => useDebounce(mock, 10));
  result.current();
  result.current();
  await waitFor(() => expect(mock).toBeCalledTimes(1));
});

it('should call the callback again after the cooldown period', async () => {
  const mock = jest.fn();
  const { result } = renderHook(() => useDebounce(mock, 10));
  result.current();
  await waitFor(() => expect(mock).toBeCalledTimes(1));
  result.current();
  await waitFor(() => expect(mock).toBeCalledTimes(2));
});
