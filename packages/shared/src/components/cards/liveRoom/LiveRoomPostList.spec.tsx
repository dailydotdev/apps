import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import post from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { LiveRoomPost } from '../../../graphql/liveRooms';
import {
  LiveRoomActivityStatus,
  LiveRoomMode,
  LiveRoomStatus,
} from '../../../graphql/liveRooms';
import { PostType } from '../../../graphql/posts';
import type { Post } from '../../../graphql/posts';
import type { PostCardProps } from '../common/common';
import { LiveRoomPostList } from './LiveRoomPostList';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const room: LiveRoomPost = {
  id: 'room-1',
  topic: 'Weekly product standup',
  mode: LiveRoomMode.Moderated,
  status: LiveRoomStatus.Created,
  scheduledStart: '2026-05-20T10:00:00.000Z',
  subscribed: false,
};

const liveRoomPost: Post = {
  ...post,
  id: 'post-1',
  title: 'Fallback title',
  type: PostType.LiveRoom,
  liveRoom: room,
};

const defaultProps: PostCardProps = {
  post: liveRoomPost,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

afterEach(() => {
  jest.useRealTimers();
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <LiveRoomPostList {...defaultProps} {...props} />
    </TestBootProvider>,
  );

it('renders live room post list content and standup route link', async () => {
  renderComponent();

  expect(await screen.findByText('Weekly product standup')).toBeInTheDocument();
  expect(screen.getByText(/May 20 at/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /RSVP/ })).toBeInTheDocument();
  expect(screen.getByTitle('Weekly product standup')).toHaveAttribute(
    'href',
    '/standups/room-1',
  );
});

it('shows community-moderated durable-created rooms as live when activity is live', async () => {
  renderComponent({
    post: {
      ...liveRoomPost,
      liveRoom: {
        ...room,
        mode: LiveRoomMode.CommunityModerated,
        status: LiveRoomStatus.Created,
        activityStatus: LiveRoomActivityStatus.Live,
      },
    },
  });

  expect(await screen.findByText('Live')).toBeInTheDocument();
  expect(screen.queryByText(/May 20 at/)).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /RSVP/ }),
  ).not.toBeInTheDocument();
});
