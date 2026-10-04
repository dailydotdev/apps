import type { ReactNode } from 'react';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import type { AuthContextData } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useToastNotification } from '../../hooks/useToastNotification';
import { labels } from '../../lib/labels';
import useReportComment from '../../hooks/useReportComment';
import { ReportReason } from '../../report';
import type { Comment } from '../../graphql/comments';
import type { Post } from '../../graphql/posts';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { FilteredComments } from './FilteredComments';

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

const mockPage = (ids: string[], endCursor?: string) => ({
  edges: ids.map((id) => ({ node: { id } })),
  pageInfo: { hasNextPage: !!endCursor, endCursor },
});

let mockFetchList: (pageParam: string) => Promise<ReturnType<typeof mockPage>>;

jest.mock('../../graphql/filteredComments', () => ({
  filteredCommentsCountQueryOptions: () => ({
    queryKey: ['filtered_comments', 'count'],
    queryFn: async () => 2,
  }),
  filteredCommentsQueryOptions: () => ({
    queryKey: ['filtered_comments', 'list'],
    queryFn: ({ pageParam }: { pageParam: string }) => mockFetchList(pageParam),
    initialPageParam: '',
    getNextPageParam: (last: ReturnType<typeof mockPage>) =>
      last.pageInfo.hasNextPage ? last.pageInfo.endCursor : null,
  }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

const displayToast = jest.fn();

const reportComment = jest.fn(async () => ({ successful: true }));

jest.mock('../../hooks/useReportComment', () => ({
  __esModule: true,
  default: jest.fn(),
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
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
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
  jest.mocked(useReportComment).mockReturnValue({ reportComment });
  jest.mocked(useToastNotification).mockReturnValue({
    displayToast,
  } as unknown as ReturnType<typeof useToastNotification>);
  mockFetchList = async () => mockPage(['f1', 'f2']);
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
  expect(reportComment).toHaveBeenCalledWith({
    commentId: 'f1',
    reason: ReportReason.NotSpam,
  });
});

it('collapses with an error toast when the list fails to load', async () => {
  setFlag(true);
  mockFetchList = async () => {
    throw new Error('unauthenticated');
  };
  renderComponent(true);

  fireEvent.click(await screen.findByText('View 2 filtered comments'));

  expect(
    await screen.findByText('View 2 filtered comments'),
  ).toBeInTheDocument();
  expect(displayToast).toHaveBeenCalledWith(labels.error.generic);
  expect(screen.queryByTestId('filtered-comment')).not.toBeInTheDocument();
});

it('loads the next page when there are more filtered comments', async () => {
  setFlag(true);
  mockFetchList = async (pageParam) =>
    pageParam === 'c1' ? mockPage(['f2']) : mockPage(['f1'], 'c1');
  renderComponent(true);

  fireEvent.click(await screen.findByText('View 2 filtered comments'));

  expect(await screen.findAllByTestId('filtered-comment')).toHaveLength(1);
  fireEvent.click(screen.getByText('View 1 more'));

  await waitFor(() =>
    expect(screen.getAllByTestId('filtered-comment')).toHaveLength(2),
  );
  expect(screen.queryByText('View 1 more')).not.toBeInTheDocument();
});
