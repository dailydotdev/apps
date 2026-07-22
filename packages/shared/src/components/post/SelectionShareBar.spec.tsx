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

jest.mock('../../hooks/useTextSelectionShare', () => ({
  __esModule: true,
  useTextSelectionShare: jest.fn(),
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

const enabledGrowthBook = () =>
  new GrowthBook({
    features: {
      sharing_visibility: { defaultValue: true },
      share_text_selection: { defaultValue: true },
    },
  });

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

const renderComponent = (
  gb = enabledGrowthBook(),
): RenderResult & { client: QueryClient } => {
  const client = new QueryClient();
  const containerRef = { current: document.createElement('div') };
  document.body.appendChild(containerRef.current);

  return {
    client,
    ...render(
      <TestBootProvider client={client} gb={gb}>
        <SelectionShareBar containerRef={containerRef} post={post} />
      </TestBootProvider>,
    ),
  };
};

describe('SelectionShareBar flag gate', () => {
  it('renders nothing and attaches no selection listeners when off', () => {
    renderComponent(new GrowthBook());

    expect(screen.queryByTestId('selectionShareBar')).not.toBeInTheDocument();
    expect(useTextSelectionShareMock).not.toHaveBeenCalled();
  });

  it('renders nothing when only the per-surface flag is on', () => {
    renderComponent(
      new GrowthBook({
        features: { share_text_selection: { defaultValue: true } },
      }),
    );

    expect(screen.queryByTestId('selectionShareBar')).not.toBeInTheDocument();
    expect(useTextSelectionShareMock).not.toHaveBeenCalled();
  });
});

describe('SelectionShareBar actions', () => {
  it('renders the three share actions for a selection', () => {
    renderComponent();

    expect(screen.getByTestId('selectionShareBar')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy link to this post')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy selected text')).toBeInTheDocument();
    expect(screen.getByLabelText('Generate quote image')).toBeInTheDocument();
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

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(selection));
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

  it('opens the quote image generator with the selection', async () => {
    const open = jest.fn();
    Object.assign(window, { open });
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Generate quote image'));
    });

    const [url] = open.mock.calls[0];
    expect(url).toContain(`image-generator/quote/${post.id}`);
    expect(url).toContain(encodeURIComponent(selection));
    expect(clear).toHaveBeenCalled();
  });

  it('dismisses on a click outside the bar', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(document.body);
    });

    expect(clear).toHaveBeenCalled();
  });
});
