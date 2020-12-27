import React from 'react';
import { render, RenderResult } from '@testing-library/preact';
import AuthContext from '../components/AuthContext';
import { LoggedUser } from '../lib/user';
import SubComment, { Props } from '../components/comments/SubComment';
import { QueryClient, QueryClientProvider } from 'react-query';

const baseComment = {
  id: 'c2',
  content: 'my comment',
  author: {
    image: 'https://daily.dev/ido.png',
    id: 'u1',
    name: 'Ido',
    permalink: 'https://daily.dev/ido',
  },
  createdAt: new Date(2017, 1, 10, 0, 0).toISOString(),
  upvoted: false,
  permalink: 'https://daily.dev',
  numUpvotes: 0,
};

const loggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '',
};

const onComment = jest.fn();
const onDelete = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const renderLayout = (
  props: Partial<Props> = {},
  user: LoggedUser = null,
): RenderResult => {
  const defaultProps: Props = {
    comment: baseComment,
    firstComment: false,
    lastComment: false,
    parentId: 'c1',
    onComment,
    onDelete,
    postAuthorId: null,
  };

  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
        }}
      >
        <SubComment {...defaultProps} {...props} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show author profile image', async () => {
  const res = renderLayout();
  const el = await res.findByAltText(`Ido's profile image`);
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
});

it('should show author name', async () => {
  const res = renderLayout();
  await res.findByText('Ido');
});

it('should show formatted comment date', async () => {
  const res = renderLayout();
  await res.findByText('Feb 10, 2017');
});

it('should show comment content', async () => {
  const res = renderLayout();
  await res.findByText('my comment');
});

it('should move timeline above profile picture when not first comment', async () => {
  const res = renderLayout();
  const el = await res.findByTestId('timeline');
  expect(el).toHaveStyleRule('top', '-1rem');
});

it('should move timeline to profile picture when first comment', async () => {
  const res = renderLayout({ firstComment: true });
  const el = await res.findByTestId('timeline');
  expect(el).toHaveStyleRule('top', '0');
});

it('should call onComment callback', async () => {
  const res = renderLayout();
  const el = await res.findByTitle('Comment');
  el.click();
  expect(onComment).toBeCalledWith(baseComment, 'c1');
});

it('should call onDelete callback', async () => {
  const res = renderLayout({}, loggedUser);
  const el = await res.findByTitle('Delete');
  el.click();
  expect(onDelete).toBeCalledWith(baseComment, 'c1');
});

it('should show author badge', async () => {
  const res = renderLayout({ postAuthorId: 'u1' }, loggedUser);
  const el = await res.findByText('Author');
  expect(el).toBeInTheDocument();
});
