import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LfgMessagesTab } from './LfgMessagesTab';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { getLfgBoard, getLfgHelper, getMyLfgPost } from '../../graphql';
import type { LfgHelper, LfgPost } from '../../types';

jest.mock('../../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../hooks/useLfgModals', () => ({
  useLfgModals: () => ({ openReachOut: jest.fn(), openHelper: jest.fn() }),
}));
jest.mock('../LfgRow', () => ({
  LfgRow: ({ post }: { post: LfgPost }) => <p>{post.title}</p>,
}));
jest.mock('../../graphql', () => ({
  ...jest.requireActual('../../graphql'),
  getLfgBoard: jest.fn(),
  getLfgHelper: jest.fn(),
  getMyLfgPost: jest.fn(),
}));

const boardPost = (id: string, authorId: string) =>
  ({ id, title: `Post ${id}`, author: { id: authorId } } as LfgPost);

const renderTab = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <LfgMessagesTab />
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me' },
  } as ReturnType<typeof useAuthContext>);
  jest.mocked(getMyLfgPost).mockResolvedValue(null);
  jest.mocked(getLfgHelper).mockResolvedValue(null);
  jest.mocked(getLfgBoard).mockResolvedValue({
    edges: ['a', 'me', 'b', 'c', 'd'].map((id) => ({
      node: boardPost(id, id === 'me' ? 'me' : `author-${id}`),
    })),
    pageInfo: { hasNextPage: false, endCursor: null },
  } as unknown as Awaited<ReturnType<typeof getLfgBoard>>);
});

describe('LfgMessagesTab', () => {
  it('lists the three newest posts by other people', async () => {
    renderTab();

    expect(await screen.findByText('Post a')).toBeInTheDocument();
    expect(screen.getByText('Post b')).toBeInTheDocument();
    expect(screen.getByText('Post c')).toBeInTheDocument();
    expect(screen.queryByText('Post me')).not.toBeInTheDocument();
    expect(screen.queryByText('Post d')).not.toBeInTheDocument();
  });

  it('offers a new post until the reader has one', async () => {
    renderTab();

    expect(
      await screen.findByRole('link', { name: 'New post' }),
    ).toHaveAttribute('href', expect.stringMatching(/\/lfg\/new$/));
  });

  it("shows the reader's post with its waiting count", async () => {
    jest.mocked(getMyLfgPost).mockResolvedValue({
      id: 'post-1',
      pendingCount: 2,
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    } as LfgPost);

    renderTab();

    const link = await screen.findByRole('link', { name: /Your post/ });
    expect(link).toHaveAttribute(
      'href',
      expect.stringMatching(/\/lfg\/post-1$/),
    );
    expect(link).toHaveTextContent('2');
    expect(
      screen.queryByRole('link', { name: 'New post' }),
    ).not.toBeInTheDocument();
  });

  it('only says whether the reader helps once it is known', async () => {
    let resolveHelper: (helper: LfgHelper) => void = () => undefined;
    jest.mocked(getLfgHelper).mockReturnValue(
      new Promise((resolve) => {
        resolveHelper = resolve;
      }),
    );

    renderTab();

    const helperRow = screen.getByRole('button', { name: /Open to helping/ });
    expect(helperRow).not.toHaveTextContent(/On|Off/);

    resolveHelper({} as LfgHelper);

    expect(await screen.findByText('On')).toBeInTheDocument();
  });
});
