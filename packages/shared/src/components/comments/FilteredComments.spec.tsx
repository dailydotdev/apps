import type { ReactNode } from 'react';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import type { AuthContextData } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { reportNotSpam } from '../../graphql/filteredComments';
import type { Comment } from '../../graphql/comments';
import type { Post } from '../../graphql/posts';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { FilteredComments } from './FilteredComments';

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../graphql/filteredComments', () => ({
  filteredCommentsCountQueryOptions: () => ({
    queryKey: ['filtered_comments', 'count'],
    queryFn: async () => 2,
  }),
  filteredCommentsQueryOptions: () => ({
    queryKey: ['filtered_comments'],
    queryFn: async () => [{ id: 'f1' }, { id: 'f2' }],
  }),
  reportNotSpam: jest.fn(async () => ({ _: true })),
}));

jest.mock('./CommentContainer', () => ({
  __esModule: true,
  default: ({
    comment,
    badge,
    actions,
  }: {
    comment: Comment;
    badge: ReactNode;
    actions: ReactNode;
  }) => (
    <article data-testid="filtered-comment">
      {comment.id}
      {badge}
      {actions}
    </article>
  ),
}));

const mockFeature = jest.mocked(useConditionalFeature);
const showLogin = jest.fn();
const post = { id: 'p1' } as Post;

const renderComponent = (isLoggedIn: boolean) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider
        value={
          {
            user: isLoggedIn ? loggedUser : undefined,
            isLoggedIn,
            tokenRefreshed: true,
            showLogin,
          } as unknown as AuthContextData
        }
      >
        <FilteredComments post={post} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

const setFlag = (value: boolean) =>
  mockFeature.mockReturnValue({ value, isLoading: false } as ReturnType<
    typeof useConditionalFeature
  >);

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders nothing while the flag is off', () => {
  setFlag(false);
  const { container } = renderComponent(true);

  expect(container).toBeEmptyDOMElement();
});

it('asks logged-out readers to log in without revealing the comments', async () => {
  setFlag(true);
  renderComponent(false);

  expect(
    await screen.findByText('2 hidden by our spam filter'),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByText('Log in to view'));

  expect(showLogin).toHaveBeenCalled();
  expect(screen.queryByTestId('filtered-comment')).not.toBeInTheDocument();
});

it('expands for logged-in readers and reports a comment as not spam', async () => {
  setFlag(true);
  renderComponent(true);

  fireEvent.click(await screen.findByText('View 2 filtered comments'));

  expect(await screen.findAllByTestId('filtered-comment')).toHaveLength(2);
  expect(screen.getAllByText('Spam filter')).toHaveLength(2);
  expect(screen.getByText('Hide 2 filtered comments')).toBeInTheDocument();

  fireEvent.click(screen.getAllByText('Not spam? Report it')[0]);

  expect(
    await screen.findByText('Sent to our moderators. Thanks.'),
  ).toBeInTheDocument();
  expect(reportNotSpam).toHaveBeenCalledWith('f1');
});
