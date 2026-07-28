import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { PostHighlightFeed } from '../../graphql/highlights';
import { HighlightItem } from './HighlightItem';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { useViewSize } from '../../hooks/useViewSize';
import type { ToastNotification } from '../../hooks/useToastNotification';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';

jest.mock('../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

const useViewSizeMock = useViewSize as jest.Mock;
const scrollIntoView = jest.fn();
const summary = 'A concise summary for the expanded highlight item.';
const SHARE_LABEL = 'Share this highlight';

const highlight: PostHighlightFeed = {
  id: 'highlight-1',
  channel: 'agents',
  headline: 'The first highlight',
  highlightedAt: '2026-04-05T09:00:00.000Z',
  post: {
    id: 'post-1',
    type: 'article',
    commentsPermalink: '/posts/post-1',
    summary,
  },
};

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  useViewSizeMock.mockReturnValue(true); // default: laptop
});

describe('HighlightItem', () => {
  it('should expand when the route-driven default changes after mount', () => {
    const { rerender } = render(<HighlightItem highlight={highlight} />);

    expect(screen.queryByText(summary)).not.toBeInTheDocument();

    rerender(<HighlightItem highlight={highlight} defaultExpanded />);

    expect(screen.getByText(summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read more/i })).toHaveAttribute(
      'href',
      '/posts/post-1',
    );
    expect(scrollIntoView).toHaveBeenCalled();
  });
});

let client: QueryClient;

const renderWithShare = (showShare: boolean) => {
  client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <HighlightItem
        highlight={highlight}
        defaultExpanded
        showShare={showShare}
      />
    </TestBootProvider>,
  );
};

describe('HighlightItem share control', () => {
  it('should not render a share control when the flag is off', () => {
    renderWithShare(false);

    expect(
      screen.getByRole('link', { name: /read more/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(SHARE_LABEL)).not.toBeInTheDocument();
  });

  it('should render exactly one share control per highlight when enabled', () => {
    renderWithShare(true);

    expect(screen.getAllByLabelText(SHARE_LABEL)).toHaveLength(1);
    expect(
      screen.getByRole('link', { name: /read more/i }),
    ).toBeInTheDocument();
  });

  it('should copy the post link and show a toast on desktop', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderWithShare(true);

    await act(async () => {
      fireEvent.click(screen.getByLabelText(SHARE_LABEL));
    });
    await act(async () => {
      fireEvent.click(await screen.findByText('Copy link'));
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('/posts/post-1'),
    );
    await waitFor(() =>
      expect(
        client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY)?.message,
      ).toEqual('✅ Copied link to clipboard'),
    );
  });

  it('should open the native share sheet on a single tap on mobile', async () => {
    useViewSizeMock.mockReturnValue(false);
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share, maxTouchPoints: 2 });

    renderWithShare(true);

    await act(async () => {
      fireEvent.click(screen.getByLabelText(SHARE_LABEL));
    });

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        text: `${highlight.headline}\n/posts/post-1`,
      }),
    );
  });
});
