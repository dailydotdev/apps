import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { addDays, addHours, nextMonday, set } from 'date-fns';
import { ReminderPreference, useBookmarkReminder } from './useBookmarkReminder';
import { setBookmarkReminder } from '../../graphql/bookmarks';
import post from '../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

jest.mock('../../graphql/bookmarks', () => ({
  ...(jest.requireActual('../../graphql/bookmarks') as Iterable<unknown>),
  setBookmarkReminder: jest.fn(),
}));

const client = new QueryClient();
let mockedNow: Date;
const logEvent = jest.fn();

const Wrapper = ({ children }) => (
  <TestBootProvider client={client} log={{ logEvent }}>
    {children}
  </TestBootProvider>
);

describe('useBookmarkReminder hook', () => {
  beforeEach(() => {
    mockedNow = new Date(2024, 6, 14, 15, 23, 0); // Sun Jul 14 2024 15:23:00
    client.clear();
    jest.useFakeTimers('modern').setSystemTime(mockedNow);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should properly add one hour from now', async () => {
    const { result } = renderHook(() => useBookmarkReminder({ post }), {
      wrapper: Wrapper,
    });

    await result.current.onBookmarkReminder({
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

    expect(logEvent).toHaveBeenCalledWith({
      event_name: 'set bookmark reminder',
      extra: '{"remind_in":"In 1 hour"}',
      // important parts are the props above this line
      feed_grid_columns: undefined,
      feed_item_grid_column: undefined,
      feed_item_grid_row: undefined,
      feed_item_image:
        'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
      feed_item_meta: undefined,
      feed_item_target_url:
        'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
      feed_item_title: 'The Prosecutor’s Fallacy',
      post_author_id: 'u1',
      post_comments_count: undefined,
      post_created_at: '2018-06-13T01:20:42.000Z',
      post_read_time: 8,
      post_scout_id: undefined,
      post_source_id: 'tds',
      post_source_type: undefined,
      post_tags: ['webdev', 'javascript'],
      post_trending_value: undefined,
      post_type: 'article',
      post_upvotes_count: undefined,
      target_id: 'e3fd75b62cadd02073a31ee3444975cc',
      target_type: 'post',
    });
  });

  it('should properly set 19:00 today', async () => {
    const { result } = renderHook(() => useBookmarkReminder({ post }), {
      wrapper: Wrapper,
    });

    await result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.LaterToday,
    });

    const laterToday = new Date(set(mockedNow, { hours: 19, minutes: 0 }));
    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: laterToday,
      });
    });

    expect(logEvent).toHaveBeenCalledWith({
      event_name: 'set bookmark reminder',
      extra: '{"remind_in":"Later today"}',
      // important parts are the props above this line
      feed_grid_columns: undefined,
      feed_item_grid_column: undefined,
      feed_item_grid_row: undefined,
      feed_item_image:
        'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
      feed_item_meta: undefined,
      feed_item_target_url:
        'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
      feed_item_title: 'The Prosecutor’s Fallacy',
      post_author_id: 'u1',
      post_comments_count: undefined,
      post_created_at: '2018-06-13T01:20:42.000Z',
      post_read_time: 8,
      post_scout_id: undefined,
      post_source_id: 'tds',
      post_source_type: undefined,
      post_tags: ['webdev', 'javascript'],
      post_trending_value: undefined,
      post_type: 'article',
      post_upvotes_count: undefined,
      target_id: 'e3fd75b62cadd02073a31ee3444975cc',
      target_type: 'post',
    });
  });

  it('should throw error if we set later today and it is past 19:00', async () => {
    mockedNow = new Date(2024, 6, 14, 19, 0, 0); // Sun Jul 14 2024 19:00:00
    jest.useFakeTimers('modern').setSystemTime(mockedNow);
    const { result } = renderHook(() => useBookmarkReminder({ post }), {
      wrapper: Wrapper,
    });

    try {
      await result.current.onBookmarkReminder({
        postId: 'p1',
        preference: ReminderPreference.LaterToday,
      });
    } catch (err) {
      expect(err).toEqual(new Error('Invalid preference'));
    }

    expect(logEvent).not.toHaveBeenCalled();
    expect(setBookmarkReminder).not.toHaveBeenCalled();
  });

  it('should properly set tomorrow at 09:00', async () => {
    const { result } = renderHook(() => useBookmarkReminder({ post }), {
      wrapper: Wrapper,
    });

    await result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.Tomorrow,
    });

    const tomorrow = addDays(set(mockedNow, { hours: 9, minutes: 0 }), 1);
    const differenceInDays = tomorrow.getDate() - mockedNow.getDate();
    expect(differenceInDays).toBe(1);
    expect(tomorrow.getHours()).toBe(9);
    expect(tomorrow.getMinutes()).toBe(0);
    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: tomorrow,
      });
    });

    expect(logEvent).toHaveBeenCalledWith({
      event_name: 'set bookmark reminder',
      extra: '{"remind_in":"Tomorrow"}',
      // important parts are the props above this line
      feed_grid_columns: undefined,
      feed_item_grid_column: undefined,
      feed_item_grid_row: undefined,
      feed_item_image:
        'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
      feed_item_meta: undefined,
      feed_item_target_url:
        'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
      feed_item_title: 'The Prosecutor’s Fallacy',
      post_author_id: 'u1',
      post_comments_count: undefined,
      post_created_at: '2018-06-13T01:20:42.000Z',
      post_read_time: 8,
      post_scout_id: undefined,
      post_source_id: 'tds',
      post_source_type: undefined,
      post_tags: ['webdev', 'javascript'],
      post_trending_value: undefined,
      post_type: 'article',
      post_upvotes_count: undefined,
      target_id: 'e3fd75b62cadd02073a31ee3444975cc',
      target_type: 'post',
    });
  });

  it('should properly set two days from now at 09:00', async () => {
    const { result } = renderHook(() => useBookmarkReminder({ post }), {
      wrapper: Wrapper,
    });

    await result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.TwoDays,
    });

    const twoDays = addDays(set(mockedNow, { hours: 9, minutes: 0 }), 2);
    const differenceInDays = twoDays.getDate() - mockedNow.getDate();
    expect(differenceInDays).toBe(2);
    expect(twoDays.getHours()).toBe(9);
    expect(twoDays.getMinutes()).toBe(0);

    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: twoDays,
      });
    });

    expect(logEvent).toHaveBeenCalledWith({
      event_name: 'set bookmark reminder',
      extra: '{"remind_in":"In 2 days"}',
      // important parts are the props above this line
      feed_grid_columns: undefined,
      feed_item_grid_column: undefined,
      feed_item_grid_row: undefined,
      feed_item_image:
        'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
      feed_item_meta: undefined,
      feed_item_target_url:
        'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
      feed_item_title: 'The Prosecutor’s Fallacy',
      post_author_id: 'u1',
      post_comments_count: undefined,
      post_created_at: '2018-06-13T01:20:42.000Z',
      post_read_time: 8,
      post_scout_id: undefined,
      post_source_id: 'tds',
      post_source_type: undefined,
      post_tags: ['webdev', 'javascript'],
      post_trending_value: undefined,
      post_type: 'article',
      post_upvotes_count: undefined,
      target_id: 'e3fd75b62cadd02073a31ee3444975cc',
      target_type: 'post',
    });
  });

  it('should properly set to next Monday', async () => {
    const { result } = renderHook(() => useBookmarkReminder({ post }), {
      wrapper: Wrapper,
    });

    await result.current.onBookmarkReminder({
      postId: 'p1',
      preference: ReminderPreference.NextWeek,
    });

    const nextMondayReminder = nextMonday(
      set(mockedNow, {
        hours: 9,
        minutes: 0,
      }),
    );
    expect(nextMondayReminder.getDay()).toBe(1); // Monday
    expect(nextMondayReminder.getDate()).toBe(15); // 15th
    expect(nextMondayReminder.getHours()).toBe(9); // 15th
    expect(nextMondayReminder.getMinutes()).toBe(0); // 15th
    jest.useRealTimers();
    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: nextMondayReminder,
      });
    });

    expect(logEvent).toHaveBeenCalledWith({
      event_name: 'set bookmark reminder',
      extra: '{"remind_in":"Next week"}',
      // important parts are the props above this line
      feed_grid_columns: undefined,
      feed_item_grid_column: undefined,
      feed_item_grid_row: undefined,
      feed_item_image:
        'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
      feed_item_meta: undefined,
      feed_item_target_url:
        'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
      feed_item_title: 'The Prosecutor’s Fallacy',
      post_author_id: 'u1',
      post_comments_count: undefined,
      post_created_at: '2018-06-13T01:20:42.000Z',
      post_read_time: 8,
      post_scout_id: undefined,
      post_source_id: 'tds',
      post_source_type: undefined,
      post_tags: ['webdev', 'javascript'],
      post_trending_value: undefined,
      post_type: 'article',
      post_upvotes_count: undefined,
      target_id: 'e3fd75b62cadd02073a31ee3444975cc',
      target_type: 'post',
    });
  });

  it('should properly remove bookmark reminder', async () => {
    const { result } = renderHook(() => useBookmarkReminder({ post }), {
      wrapper: Wrapper,
    });

    await result.current.onRemoveReminder('p1');

    jest.useRealTimers();

    await waitFor(() => {
      expect(setBookmarkReminder).toHaveBeenCalledWith({
        postId: 'p1',
        remindAt: null,
      });
    });

    expect(logEvent).toHaveBeenCalledWith({
      event_name: 'remove bookmark reminder',
      // important parts are the props above this line
      feed_grid_columns: undefined,
      feed_item_grid_column: undefined,
      feed_item_grid_row: undefined,
      feed_item_image:
        'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
      feed_item_meta: undefined,
      feed_item_target_url:
        'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
      feed_item_title: 'The Prosecutor’s Fallacy',
      post_author_id: 'u1',
      post_comments_count: undefined,
      post_created_at: '2018-06-13T01:20:42.000Z',
      post_read_time: 8,
      post_scout_id: undefined,
      post_source_id: 'tds',
      post_source_type: undefined,
      post_tags: ['webdev', 'javascript'],
      post_trending_value: undefined,
      post_type: 'article',
      post_upvotes_count: undefined,
      target_id: 'e3fd75b62cadd02073a31ee3444975cc',
      target_type: 'post',
    });
  });
});
