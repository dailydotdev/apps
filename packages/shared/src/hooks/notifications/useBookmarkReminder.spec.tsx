import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { addDays, addHours, nextMonday } from 'date-fns';
import { ReminderPreference, useBookmarkReminder } from './useBookmarkReminder';
import { setBookmarkReminder } from '../../graphql/bookmarks';

jest.mock('../../graphql/bookmarks', () => ({
  ...(jest.requireActual('../../graphql/bookmarks') as Iterable<unknown>),
  setBookmarkReminder: jest.fn(),
}));

const client = new QueryClient();
let mockedNow: Date;

const Wrapper = ({ children }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('useBookmarkReminder hook', () => {
  beforeEach(() => {
    process.env.TZ = 'UTC'; // unfortunately this doesn't work. the offset is still there
    mockedNow = new Date(2024, 6, 14, 15, 0, 0); // Sun Jul 14 2024 15:00:00
    client.clear();
    jest.useFakeTimers('modern').setSystemTime(mockedNow);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should properly add one hour from now', async () => {
    const { result } = renderHook(() => useBookmarkReminder(), {
      wrapper: Wrapper,
    });

    result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.OneHour,
    });

    const nextHour = addHours(mockedNow, 1);
    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: nextHour,
      });
    });
  });

  it('should properly set 19:00 today', async () => {
    const { result } = renderHook(() => useBookmarkReminder(), {
      wrapper: Wrapper,
    });

    result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.LaterToday,
    });

    const laterToday = new Date(mockedNow.setHours(19));
    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: laterToday,
      });
    });
  });

  it('should throw error if we set later today and it is past 19:00', async () => {
    mockedNow = new Date(2024, 6, 14, 19, 0, 0); // Sun Jul 14 2024 19:00:00
    const { result } = renderHook(() => useBookmarkReminder(), {
      wrapper: Wrapper,
    });

    result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.LaterToday,
    });

    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).not.toHaveBeenCalled();
    });
  });

  it('should properly set tomorrow at 09:00', async () => {
    const { result } = renderHook(() => useBookmarkReminder(), {
      wrapper: Wrapper,
    });

    result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.Tomorrow,
    });

    const tomorrow = addDays(mockedNow.setHours(9), 1);
    const differenceInDays = tomorrow.getDate() - mockedNow.getDate();
    expect(differenceInDays).toBe(1);
    expect(tomorrow.getHours()).toBe(9);
    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: tomorrow,
      });
    });
  });

  it('should properly set two days from now at 09:00', async () => {
    const { result } = renderHook(() => useBookmarkReminder(), {
      wrapper: Wrapper,
    });

    result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.TwoDays,
    });

    const twoDays = addDays(mockedNow.setHours(9), 2);
    const differenceInDays = twoDays.getDate() - mockedNow.getDate();
    expect(differenceInDays).toBe(2);
    expect(twoDays.getHours()).toBe(9);
    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: twoDays,
      });
    });
  });

  it('should properly set to next Monday', async () => {
    const { result } = renderHook(() => useBookmarkReminder(), {
      wrapper: Wrapper,
    });

    result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.NextWeek,
    });

    const nextMondayReminder = nextMonday(mockedNow.setHours(9));
    expect(nextMondayReminder.getDay()).toBe(1); // Monday
    expect(nextMondayReminder.getDate()).toBe(15); // 15th
    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: nextMondayReminder,
      });
    });
  });
});
