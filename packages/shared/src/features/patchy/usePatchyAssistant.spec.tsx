import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { emitPatchyEvent } from './patchyEvents';
import { isPatchyOfferOpen, readPatchyOfferMemory } from './patchyAssistant';
import { usePatchyAssistant } from './usePatchyAssistant';

const mockFollowTags = jest.fn(() => Promise.resolve({ successful: true }));
const mockUpvote = jest.fn();
const mockBookmark = jest.fn();
const mockToast = jest.fn();
const mockLogEvent = jest.fn();
const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1' } }),
}));
jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));
jest.mock('../../hooks/useFeedSettings', () => ({
  __esModule: true,
  default: () => ({
    feedSettings: { includeTags: ['webdev'], blockedTags: [] },
  }),
}));
jest.mock('../../hooks/useTagAndSource', () => ({
  __esModule: true,
  default: () => ({ onFollowTags: mockFollowTags }),
}));
jest.mock('../../hooks/useBookmarkPost', () => ({
  useBookmarkPost: () => ({ toggleBookmark: mockBookmark }),
}));
jest.mock('../../hooks/vote/useVotePost', () => ({
  useVotePost: () => ({ toggleUpvote: mockUpvote }),
}));
jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockToast }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

const render = () =>
  renderHook(
    () =>
      usePatchyAssistant({
        isEnabled: true,
        isStreakLoading: false,
        state: 'safe',
        hasReadToday: true,
        lastViewAt: new Date(),
      }),
    { wrapper },
  );

const open = (id: string, tags: string[], extra = {}) =>
  act(() => {
    emitPatchyEvent({
      type: 'post_open',
      tags,
      post: { id, tags, readTime: 4, ...extra },
    });
  });

describe('usePatchyAssistant', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('offers to follow a tag you opened three times, then follows it', async () => {
    const { result } = render();
    open('p1', ['rust']);
    open('p2', ['rust', 'webdev']);
    expect(result.current.offer).toBeNull();
    open('p3', ['rust']);

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(result.current.offer).toMatchObject({
      kind: 'follow_tag',
      primary: 'Follow #rust',
    });
    expect(isPatchyOfferOpen()).toBe(true);

    await act(async () => {
      result.current.onAnswer('accept', 'primary');
    });
    expect(mockFollowTags).toHaveBeenCalledWith({ tags: ['rust'] });
    expect(mockToast).toHaveBeenCalledWith('#rust added to your feed');
    expect(result.current.offer).toBeNull();
    expect(isPatchyOfferOpen()).toBe(false);
  });

  it('remembers a "not now" and logs the answer', () => {
    const { result } = render();
    ['p1', 'p2', 'p3'].forEach((id) => open(id, ['go']));
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    act(() => {
      result.current.onAnswer('dismiss', 'secondary');
    });
    expect(readPatchyOfferMemory('u1').dismissed.follow_tag).toBe(1);
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        target_type: 'patchy offer',
        target_id: 'follow_tag',
        extra: JSON.stringify({ action: 'dismiss', button: 'secondary' }),
      }),
    );
  });

  it('reads along: knows a post is open', () => {
    const { result } = render();
    open('long', ['k8s'], { readTime: 47, summary: 'Pods get IPs.' });
    expect(result.current.isReading).toBe(true);
  });
});
