import post from '../../../../__tests__/fixture/post';
import type { LiveRoomPost } from '../../../graphql/liveRooms';
import { LiveRoomMode, LiveRoomStatus } from '../../../graphql/liveRooms';
import { PostType } from '../../../graphql/posts';
import type { Post } from '../../../graphql/posts';
import { getLiveRoomPostRoom, getLiveRoomPostTitle } from './common';

const createRoom = (room: Partial<LiveRoomPost> = {}): LiveRoomPost => ({
  id: 'room-1',
  topic: 'Weekly product standup',
  mode: LiveRoomMode.Moderated,
  status: LiveRoomStatus.Created,
  scheduledStart: '2026-05-20T10:00:00.000Z',
  subscribed: false,
  ...room,
});

const createLiveRoomPost = (room: Partial<LiveRoomPost> = {}): Post => ({
  ...post,
  id: 'post-1',
  type: PostType.LiveRoom,
  liveRoom: createRoom(room),
});

it('returns the room topic for scheduled rooms', () => {
  expect(getLiveRoomPostTitle(createLiveRoomPost())).toBe(
    'Weekly product standup',
  );
});

it('returns the room topic for live rooms', () => {
  expect(
    getLiveRoomPostTitle(
      createLiveRoomPost({
        status: LiveRoomStatus.Live,
        scheduledStart: '2026-05-20T10:00:00.000Z',
      }),
    ),
  ).toBe('Weekly product standup');
});

it('returns the room topic for ended rooms', () => {
  expect(
    getLiveRoomPostTitle(
      createLiveRoomPost({
        status: LiveRoomStatus.Ended,
        scheduledStart: '2026-05-20T10:00:00.000Z',
      }),
    ),
  ).toBe('Weekly product standup');
});

it('returns the room topic when the room has no scheduled start', () => {
  expect(
    getLiveRoomPostTitle(
      createLiveRoomPost({
        scheduledStart: null,
      }),
    ),
  ).toBe('Weekly product standup');
});

it('fails fast when a live room post is missing its live room relation', () => {
  expect(() =>
    getLiveRoomPostRoom({
      ...post,
      id: 'post-without-room',
      type: PostType.LiveRoom,
      liveRoom: null,
    }),
  ).toThrow('Live room post post-without-room is missing liveRoom');
});
