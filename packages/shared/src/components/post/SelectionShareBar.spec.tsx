import type { ComponentProps } from 'react';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { SelectionShareBar } from './SelectionShareBar';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { useTextSelectionShare } from '../../hooks/useTextSelectionShare';
import { shouldUseNativeShare } from '../../lib/func';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import type { Post } from '../../graphql/posts';
import type { Comment } from '../../graphql/comments';

jest.mock('../../hooks/useTextSelectionShare', () => ({
  __esModule: true,
  useTextSelectionShare: jest.fn(),
}));

const mockReplace = jest.fn();

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({
    replace: mockReplace,
    pathname: '/posts/[id]',
    query: {},
  }),
}));

jest.mock('../../lib/func', () => {
  const actual = jest.requireActual('../../lib/func');
  return { __esModule: true, ...actual, shouldUseNativeShare: jest.fn() };
});

const useTextSelectionShareMock = useTextSelectionShare as jest.Mock;
const shouldUseNativeShareMock = shouldUseNativeShare as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);
const share = jest.fn().mockResolvedValue(undefined);
const clear = jest.fn();
const selection = 'shrinking the distance between a decision and its effect';

const post = {
  id: 'post-1',
  title: 'How to ship fast',
  commentsPermalink: 'https://daily.dev/posts/how-to-ship-fast',
  permalink: 'https://daily.dev/r/how-to-ship-fast',
} as unknown as Post;

// The bar ships unflagged, so GrowthBook only has to exist for TestBootProvider.
const enabledGrowthBook = () => new GrowthBook();

beforeEach(() => {
  jest.clearAllMocks();
  shouldUseNativeShareMock.mockReturnValue(false);
  Object.assign(navigator, { clipboard: { writeText }, share });
  useTextSelectionShareMock.mockReturnValue({
    text: selection,
    rect: { top: 400, bottom: 420, left: 100, right: 300 },
    clear,
  });
});

const comment = {
  id: 'comment-1',
  permalink: 'https://daily.dev/posts/how-to-ship-fast#c-comment-1',
  author: { id: '2', username: 'ido' },
} as unknown as Comment;

const renderComponent = (
  gb = enabledGrowthBook(),
  props: Partial<ComponentProps<typeof SelectionShareBar>> = {},
): RenderResult & { client: QueryClient } => {
  const client = new QueryClient();
  const containerRef = { current: document.createElement('div') };
  document.body.appendChild(containerRef.current);

  return {
    client,
    ...render(
      <TestBootProvider client={client} gb={gb}>
        <SelectionShareBar
          containerRef={containerRef}
          post={post}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      </TestBootProvider>,
    ),
  };
};

describe('SelectionShareBar gating', () => {
  it('renders for every user, with no feature flag set', () => {
    renderComponent(new GrowthBook());

    expect(screen.getByTestId('selectionShareBar')).toBeInTheDocument();
  });

  it('renders nothing when there is no selection', () => {
    useTextSelectionShareMock.mockReturnValue({
      text: null,
      rect: null,
      clear,
    });

    renderComponent();

    expect(screen.queryByTestId('selectionShareBar')).not.toBeInTheDocument();
  });
});

describe('SelectionShareBar actions', () => {
  it('renders the share actions for a selection', () => {
    renderComponent();

    expect(screen.getByTestId('selectionShareBar')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy link to this post')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy selected text')).toBeInTheDocument();
  });

  it('does not offer the quote image until the service renders it', () => {
    renderComponent();

    expect(
      screen.queryByLabelText('Generate quote image'),
    ).not.toBeInTheDocument();
  });

  it('copies the post link and shows a toast', async () => {
    const { client } = renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy link to this post'));
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(post.commentsPermalink),
    );
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
      message: '✅ Copied link to clipboard',
    });
  });

  it('copies the selected text and shows a toast', async () => {
    const { client } = renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy selected text'));
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${selection}\n\n${post.commentsPermalink}`,
      ),
    );
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
      message: '✅ Copied text to clipboard',
    });
  });

  it('opens the native share sheet on mobile instead of copying', async () => {
    shouldUseNativeShareMock.mockReturnValue(true);
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy link to this post'));
    });

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share).toHaveBeenCalledWith({
      text: `${selection}\n${post.commentsPermalink}`,
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('dismisses on a click outside the bar', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(document.body);
    });

    expect(clear).toHaveBeenCalled();
  });
});

describe('SelectionShareBar on a comment', () => {
  it('copies the comment permalink, not the post link', async () => {
    renderComponent(undefined, { comment });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy link to this post'));
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(comment.permalink),
    );
  });

  it('appends the comment link to copied text, not the post link', async () => {
    renderComponent(undefined, { comment });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy selected text'));
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${selection}\n\n${comment.permalink}`,
      ),
    );
  });

  it('hands the quote to the reply composer', () => {
    const onQuote = jest.fn();
    renderComponent(undefined, { comment, onQuote });

    fireEvent.click(screen.getByLabelText('Quote in a comment'));

    expect(onQuote).toHaveBeenCalledWith(`> ${selection}\n\n`);
  });

  it('hides quote on a comment with no reply composer wired', () => {
    renderComponent(undefined, { comment });

    expect(screen.getByTestId('selectionShareBar')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Quote in a comment'),
    ).not.toBeInTheDocument();
  });

  it('never routes a comment quote through the post composer', () => {
    const onQuote = jest.fn();
    renderComponent(undefined, { comment, onQuote });

    fireEvent.click(screen.getByLabelText('Quote in a comment'));

    expect(onQuote).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('SelectionShareBar where nothing can be quoted', () => {
  it('hides quote when the surface has no comment composer', () => {
    renderComponent(undefined, { canQuote: false });

    expect(screen.getByTestId('selectionShareBar')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy selected text')).toBeInTheDocument();
    expect(screen.getByLabelText('Share')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Quote in a comment'),
    ).not.toBeInTheDocument();
  });
});
