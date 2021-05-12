import React from 'react';
import { screen, render, RenderResult, waitFor } from '@testing-library/preact';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
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
const onEdit = jest.fn();

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
    onEdit,
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
  renderLayout();
  const el = await screen.findByAltText(`Ido's profile image`);
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
});

it('should show author name', async () => {
  renderLayout();
  await screen.findByText('Ido');
});

it('should show formatted comment date', async () => {
  renderLayout();
  await screen.findByText('Feb 10, 2017');
});

it('should show last updated comment date', async () => {
  renderLayout({
    comment: {
      ...baseComment,
      lastUpdatedAt: new Date(2017, 2, 10, 0, 0).toISOString(),
    },
  });
  await screen.findByText('Modified Mar 10, 2017');
});

it('should show comment content', async () => {
  renderLayout();
  await screen.findByText('my comment');
});

it('should move timeline above profile picture when not first comment', async () => {
  renderLayout();
  const el = await screen.findByTestId('timeline');
  expect(el).toHaveClass('-top-4');
});

it('should move timeline to profile picture when first comment', async () => {
  renderLayout({ firstComment: true });
  const el = await screen.findByTestId('timeline');
  await waitFor(() => expect(el).toHaveClass('top-0'));
});

it('should call onComment callback', async () => {
  renderLayout();
  const el = await screen.findByLabelText('Comment');
  el.click();
  expect(onComment).toBeCalledWith(baseComment, 'c1');
});

it('should call onDelete callback', async () => {
  renderLayout({}, loggedUser);
  const el = await screen.findByLabelText('Delete');
  el.click();
  expect(onDelete).toBeCalledWith(baseComment, 'c1');
});

it('should show author badge', async () => {
  renderLayout({ postAuthorId: 'u1' }, loggedUser);
  const el = await screen.findByText('Author');
  expect(el).toBeInTheDocument();
});
