import React from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { useMarkThreadRead } from './useMarkThreadRead';
import { markDmConversationRead } from '../queries';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'me' } }),
}));

jest.mock('../queries', () => ({
  markDmConversationRead: jest.fn(),
}));

let visibility: DocumentVisibilityState = 'visible';

const setVisibility = (state: DocumentVisibilityState) => {
  visibility = state;
  document.dispatchEvent(new Event('visibilitychange'));
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

const render = (lastIncomingId?: string) =>
  renderHook(
    (props: { lastIncomingId?: string }) =>
      useMarkThreadRead({ peerId: 'peer', isLoaded: true, ...props }),
    { wrapper, initialProps: { lastIncomingId } },
  );

beforeAll(() => {
  jest
    .spyOn(document, 'visibilityState', 'get')
    .mockImplementation(() => visibility);
});

beforeEach(() => {
  jest.useFakeTimers();
  visibility = 'visible';
  jest.mocked(markDmConversationRead).mockReset().mockResolvedValue();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useMarkThreadRead', () => {
  it('marks a burst of incoming messages read once', () => {
    const { rerender } = render('m1');
    rerender({ lastIncomingId: 'm2' });
    rerender({ lastIncomingId: 'm3' });

    act(() => jest.advanceTimersByTime(1500));

    expect(markDmConversationRead).toHaveBeenCalledTimes(1);
    expect(markDmConversationRead).toHaveBeenCalledWith(
      expect.anything(),
      { id: 'me' },
      'peer',
    );
  });

  it('waits for a hidden page to come back', () => {
    visibility = 'hidden';
    render('m1');

    act(() => jest.advanceTimersByTime(5000));
    expect(markDmConversationRead).not.toHaveBeenCalled();

    act(() => setVisibility('visible'));
    act(() => jest.advanceTimersByTime(1500));
    expect(markDmConversationRead).toHaveBeenCalledTimes(1);
  });

  it('reads what was on screen when the thread closes', () => {
    const { unmount } = render('m1');

    unmount();

    expect(markDmConversationRead).toHaveBeenCalledTimes(1);
  });
});
