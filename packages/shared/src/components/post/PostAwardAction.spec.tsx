import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostAwardAction from './PostAwardAction';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCanAwardUser } from '../../hooks/useCoresFeature';
import { useEngagementBarV2 } from '../../hooks/useEngagementBarV2';
import type { Post } from '../../graphql/posts';
import type { LoggedUser } from '../../lib/user';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../hooks/useCoresFeature', () => ({
  useCanAwardUser: jest.fn(),
}));

jest.mock('../../hooks/useEngagementBarV2', () => ({
  useEngagementBarV2: jest.fn(),
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: jest.fn() }),
}));

const post = {
  id: 'p1',
  numAwards: 0,
} as Post;

const mockAuth = (user: Partial<LoggedUser> | null) =>
  jest
    .mocked(useAuthContext)
    .mockReturnValue({ user, showLogin: jest.fn() } as never);

const renderComponent = (postProps: Partial<Post> = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PostAwardAction post={{ ...post, ...postProps } as Post} />
    </QueryClientProvider>,
  );

describe.each([false, true])('PostAwardAction (v2: %s)', (isV2) => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useEngagementBarV2).mockReturnValue(isV2);
    jest.mocked(useCanAwardUser).mockReturnValue(false);
  });

  it('stays hidden for a logged out user on a post without an author', () => {
    mockAuth(null);

    renderComponent();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // Owned by useCanAwardUser, which returns false without a sending user.
  it('stays hidden for a logged out user on an authored post', () => {
    mockAuth(null);

    renderComponent({ author: { id: 'u2' } as Post['author'] });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('stays hidden for a logged in user on a post without an author', () => {
    mockAuth({ id: 'u1' });

    renderComponent();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders on the logged in user own post', () => {
    mockAuth({ id: 'u1' });

    renderComponent({ author: { id: 'u1' } as Post['author'] });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders when the author can be awarded', () => {
    mockAuth({ id: 'u1' });
    jest.mocked(useCanAwardUser).mockReturnValue(true);

    renderComponent({ author: { id: 'u2' } as Post['author'] });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('sizes the button like the other feed actions', () => {
    mockAuth({ id: 'u1' });

    renderComponent({ author: { id: 'u1' } as Post['author'] });

    expect(screen.getByRole('button')).toHaveClass('h-6');
  });

  it('keeps the awarded image at the action icon size', () => {
    mockAuth({ id: 'u1' });

    renderComponent({
      author: { id: 'u1' } as Post['author'],
      userState: { awarded: true } as Post['userState'],
      featuredAward: {
        award: { image: 'https://media.daily.dev/award.png', name: 'Award' },
      } as Post['featuredAward'],
    });

    expect(screen.getByAltText('Award')).toHaveClass('size-4');
  });
});
