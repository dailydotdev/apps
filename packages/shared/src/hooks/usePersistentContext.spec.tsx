import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get } from 'idb-keyval';
import usePersistentContext from './usePersistentContext';

jest.mock('idb-keyval', () => ({
  ...jest.requireActual('idb-keyval'),
  get: jest.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('usePersistentContext', () => {
  it('keeps a value set while the first read is still in flight', async () => {
    let finishRead: (value: number) => void = () => undefined;
    jest.mocked(get).mockReturnValue(
      new Promise((resolve) => {
        finishRead = resolve;
      }),
    );

    const { result } = renderHook(() => usePersistentContext('sort', 0), {
      wrapper,
    });
    await waitFor(() => expect(get).toHaveBeenCalled());

    await act(async () => {
      const update = result.current[1](1);
      finishRead(0);
      await update;
    });

    await waitFor(() => expect(result.current[0]).toBe(1));
    // The read has nothing left to land: the value stays.
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    });
    expect(result.current[0]).toBe(1);
  });
});
