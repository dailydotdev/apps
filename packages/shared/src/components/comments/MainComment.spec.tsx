import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderResult, screen } from '@testing-library/react';
import React from 'react';

import comment from '../../../__tests__/fixture/comment';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import post from '../../../__tests__/fixture/post';
import AuthContext from '../../contexts/AuthContext';
import { useViewSize } from '../../hooks';
import { Origin } from '../../lib/log';
import { LoggedUser } from '../../lib/user';
import MainComment, { MainCommentProps } from './MainComment';

const onDelete = jest.fn();
const mockUseViewSize = useViewSize as jest.MockedFunction<typeof useViewSize>;

jest.mock('../../hooks', () => {
  const originalModule = jest.requireActual('../../hooks');
  return {
    ...originalModule,
    useViewSize: jest.fn(),
  };
});

const date = new Date(2024, 6, 6, 12, 30, 30);

beforeEach(() => {
  jest.useFakeTimers('modern').setSystemTime(date);
  jest.clearAllMocks();
  mockUseViewSize.mockImplementation(() => true);
});

const renderLayout = (
  props: Partial<MainCommentProps> = {},
  user: LoggedUser = null,
): RenderResult => {
  const defaultProps: MainCommentProps = {
    post,
    comment,
    onDelete,
    postAuthorId: null,
    postScoutId: null,
    onShare: jest.fn(),
    onShowUpvotes: jest.fn(),
    origin: Origin.PostCommentButton,
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
        <MainComment {...defaultProps} {...props} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show author profile image', async () => {
  renderLayout();
  const el = await screen.findByAltText(`${comment.author.username}'s profile`);
  expect(el).toHaveAttribute('src', comment.author.image);
});

it('should show author name', async () => {
  renderLayout();
  await screen.findByText(comment.author.name);
});

it('should show formatted comment date', async () => {
  renderLayout();
  await screen.findByText('7 years ago');
});

it('should show last updated comment date', async () => {
  renderLayout({
    comment: {
      ...comment,
      lastUpdatedAt: new Date(2017, 2, 10, 0, 0).toISOString(),
    },
  });
  await screen.findByText('Modified 7 years ago');
});

it('should show comment content', async () => {
  renderLayout();
  await screen.findByText('my comment');
});

it('should have no subcomments', async () => {
  renderLayout();
  expect(screen.queryAllByTestId('subcomment').length).toEqual(0);
});

it('should have subcomments', async () => {
  renderLayout({
    comment: {
      ...comment,
      children: {
        pageInfo: {},
        edges: [
          {
            node: {
              ...comment,
              id: 'c2',
            },
            cursor: '',
          },
        ],
      },
    },
  });
  expect(screen.queryAllByTestId('subcomment').length).toEqual(1);
});

it('should render the comment box', async () => {
  renderLayout({}, loggedUser);
  const el = await screen.findByLabelText('Reply');
  el.click();
  const [commentBox] = await screen.findAllByRole('textbox');
  expect(commentBox).toBeInTheDocument();
});

it('should call onDelete callback', async () => {
  renderLayout({}, loggedUser);
  const el = await screen.findByLabelText('Options');
  el.click();
  const [, remove] = await screen.findAllByRole('menuitem');
  remove.click();
  expect(onDelete).toBeCalledWith(comment, 'c1');
});

it('should show creator badge', async () => {
  renderLayout({ postAuthorId: 'u1' }, loggedUser);
  const el = await screen.findByText('Creator');
  expect(el).toBeInTheDocument();
});
