import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import post from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { LiveRoomPost } from '../../../graphql/liveRooms';
import { LiveRoomStatus } from '../../../graphql/liveRooms';
import { PostType } from '../../../graphql/posts';
import type { Post } from '../../../graphql/posts';
import type { PostCardProps } from '../common/common';
import { LiveRoomPostGrid } from './LiveRoomPostGrid';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const room: LiveRoomPost = {
  id: 'room-1',
  topic: 'Weekly product standup',
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
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <LiveRoomPostGrid {...defaultProps} {...props} />
    </TestBootProvider>,
  );

it('renders live room post title, scheduled time, and RSVP action', async () => {
  renderComponent();

  expect(await screen.findByText('Weekly product standup')).toBeInTheDocument();
  expect(screen.getByText(/May 20 at/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /RSVP/ })).toBeInTheDocument();
});

it('links the card to the standup route', async () => {
  renderComponent();

  const link = await screen.findByLabelText('Weekly product standup');
  expect(link).toHaveAttribute(
    'href',
    expect.stringContaining('/standups/room-1'),
  );
});
