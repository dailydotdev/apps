import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostLiveChat } from './PostLiveChat';
import { useLiveChatEnabled } from '../hooks/useLiveChatEnabled';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePostCapsulePosition } from '../../../components/post/PostCapsule';
import type { ChatRoom } from '../graphql';
import { ChatRoomStatus, getPostChatRoom } from '../graphql';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { field } from '../../../components/shell/constants';

jest.mock('../hooks/useLiveChatEnabled', () => ({
  useLiveChatEnabled: jest.fn(),
}));
jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: () => false,
  useIsPhone: () => true,
}));
// jsdom drops any style with var() in it, so the capsule stands on plain
// pixels here; its own spec covers where it really stands.
jest.mock('../../../components/post/PostCapsule', () => ({
  ...jest.requireActual('../../../components/post/PostCapsule'),
  usePostCapsulePosition: jest.fn(),
}));
jest.mock('../graphql', () => ({
  ...jest.requireActual('../graphql'),
  getPostChatRoom: jest.fn(),
}));

const room: ChatRoom = {
  id: 'r1',
  status: ChatRoomStatus.Active,
  jid: 'r1@conference.chat.daily.dev',
  title: 'Bun 2.0',
  post: { id: 'p1' },
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  occupantCount: 23,
  createdAt: new Date().toISOString(),
};

const post = {
  id: 'p1',
  type: PostType.Article,
  trending: 12,
} as unknown as Post;

// The capsule at rest, one gap above the bar, and slid into the bar's slot
// at the compact size while reading.
const atRest = {
  p: 0,
  bottom: '72px',
  translateY: 0,
  height: field.rest,
};
const whileReading = {
  p: 1,
  bottom: '72px',
  translateY: 64,
  height: field.compact,
};

const renderPill = (isPostPage?: boolean) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PostLiveChat
        post={post}
        origin="post"
        placement="mobile"
        isPostPage={isPostPage}
      />
    </QueryClientProvider>,
  );

const pill = () => screen.findByRole('button', { name: /Live chat/ });

describe('PostLiveChat on a phone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLiveChatEnabled).mockReturnValue({ isEnabled: true });
    jest.mocked(useAuthContext).mockReturnValue({
      user: { id: 'u1' },
      isAuthReady: true,
    } as unknown as ReturnType<typeof useAuthContext>);
    jest.mocked(getPostChatRoom).mockResolvedValue(room);
    jest.mocked(usePostCapsulePosition).mockReturnValue(atRest);
  });

  it('stands one gap above the action capsule on the post page', async () => {
    renderPill(true);

    expect(await pill()).toHaveStyle({
      bottom: `calc(72px + ${field.rest + field.gap}px)`,
      transform: 'translateY(0px)',
    });
  });

  it('takes the capsule’s slot in a post modal, where there is no capsule', async () => {
    renderPill();

    expect(await pill()).toHaveStyle({
      bottom: 'calc(72px + 0px)',
      transform: 'translateY(0px)',
    });
  });

  it('slides with the capsule while reading, carrying its shrink on the transform', async () => {
    jest.mocked(usePostCapsulePosition).mockReturnValue(whileReading);
    renderPill(true);

    expect(await pill()).toHaveStyle({
      bottom: `calc(72px + ${field.rest + field.gap}px)`,
      transform: `translateY(${64 + (field.rest - field.compact)}px)`,
    });
  });

  it('slides into the bar’s slot in a post modal without the capsule’s shrink', async () => {
    jest.mocked(usePostCapsulePosition).mockReturnValue(whileReading);
    renderPill();

    expect(await pill()).toHaveStyle({
      bottom: 'calc(72px + 0px)',
      transform: 'translateY(64px)',
    });
  });
});
