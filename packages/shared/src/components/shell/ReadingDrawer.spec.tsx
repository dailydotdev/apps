import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { openDuration, ReadingDrawer } from './ReadingDrawer';
import { queueReadingOpen, ReadingEvent, setReadingOpen } from './readingStore';
import { closeTopLayer } from '../../hooks/useNativeBridge';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';

const mockRouter = {
  beforePopState: jest.fn(),
  events: { on: jest.fn(), off: jest.fn() },
  push: jest.fn(),
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('../../hooks/useSettingsBooleanFlag', () => ({
  useSettingsBooleanFlag: () => ({ value: false }),
}));

jest.mock('../../hooks/useCopy', () => ({
  useCopyLink: () => [false, jest.fn()],
}));

const mockLogEvent = jest.fn();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const post = {
  id: 'p1',
  type: PostType.Article,
  title: 'Announcing Rust 1.90.0',
  permalink: 'https://api.daily.dev/r/p1',
  source: { handle: 'rust', image: 'https://media.daily.dev/rust.png' },
} as unknown as Post;

type BridgeGlobal = typeof globalThis & { webkit?: unknown };

const postMessage = jest.fn();

const withReadingBridge = () => {
  (globalThis as BridgeGlobal).webkit = {
    messageHandlers: { reading: { postMessage } },
  };
  document.documentElement.classList.add('ios');
};

const renderPostPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <a href={post.permalink}>Read post</a>
      <main>
        <a href="https://blog.example.com/deep-dive">A link in the body</a>
        <a href="https://twitter.com/intent/tweet?text=hi">Share on X</a>
      </main>
      <ReadingDrawer post={post} />
    </QueryClientProvider>,
  );

const readingMessages = () =>
  postMessage.mock.calls.map(([payload]) => payload.action);

beforeEach(() => {
  mockRouter.beforePopState.mockClear();
  postMessage.mockClear();
  mockLogEvent.mockClear();
  window.scrollTo = jest.fn();
});

afterEach(() => {
  act(() => setReadingOpen(false));
  delete (globalThis as BridgeGlobal).webkit;
  document.documentElement.classList.remove('ios', 'reading');
});

describe('ReadingDrawer', () => {
  it('leaves Read a plain link outside a wrapper that can show the article', () => {
    renderPostPage();

    fireEvent.click(screen.getByText('Read post'));

    expect(postMessage).not.toHaveBeenCalled();
    expect(document.documentElement).not.toHaveClass('reading');
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    expect(mockRouter.beforePopState).not.toHaveBeenCalled();
  });

  it('keeps the router from routing the pop that closes it', () => {
    withReadingBridge();
    renderPostPage();
    expect(mockRouter.beforePopState).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Read post'));

    const [guard] = mockRouter.beforePopState.mock.calls.at(-1);
    expect(guard(window.history.state)).toBe(false);
  });

  it('opens a link from the post body behind the post, not a share hand-off', () => {
    withReadingBridge();
    renderPostPage();

    fireEvent.click(screen.getByText('Share on X'));
    expect(postMessage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('A link in the body'));

    expect(postMessage).toHaveBeenCalledWith({
      action: 'open',
      url: 'https://blog.example.com/deep-dive',
      postId: post.id,
    });
    expect(document.documentElement).toHaveClass('reading');
  });

  it('opens on arrival when Read was tapped on a feed card', () => {
    withReadingBridge();
    queueReadingOpen(post, post.permalink as string);

    renderPostPage();

    expect(postMessage).toHaveBeenCalledWith({
      action: 'open',
      url: post.permalink,
      postId: post.id,
    });
    expect(document.documentElement).toHaveClass('reading');
  });

  it('opens the article behind the post instead of following the link', () => {
    withReadingBridge();
    renderPostPage();

    fireEvent.click(screen.getByText('Read post'));

    expect(postMessage).toHaveBeenCalledWith({
      action: 'open',
      url: post.permalink,
      postId: post.id,
    });
    expect(document.documentElement).toHaveClass('reading');
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
    expect(screen.getByText(post.title as string)).toBeInTheDocument();
  });

  it('shows the page the wrapper reports', () => {
    withReadingBridge();
    renderPostPage();
    fireEvent.click(screen.getByText('Read post'));

    act(() => {
      window.dispatchEvent(
        new CustomEvent(ReadingEvent.State, {
          detail: { url: 'https://www.rust-lang.org/blog', secure: true },
        }),
      );
    });

    expect(screen.getByLabelText('Page options')).toHaveTextContent(
      'rust-lang.org',
    );
  });

  it('closes on back before the post itself is left', () => {
    jest.useFakeTimers();
    withReadingBridge();
    renderPostPage();
    fireEvent.click(screen.getByText('Read post'));
    expect(readingMessages()).toEqual(['open']);
    act(() => {
      jest.advanceTimersByTime(openDuration);
    });
    expect(readingMessages()).toEqual(['open', 'touch']);
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    act(() => {
      expect(closeTopLayer()).toBe(true);
    });

    expect(back).toHaveBeenCalledTimes(1);
    expect(mockLogEvent.mock.calls.map(([event]) => event.event_name)).toEqual([
      'open reading drawer',
      'close reading drawer',
    ]);
    expect(JSON.parse(mockLogEvent.mock.calls[0][0].extra)).toEqual({
      origin: 'post',
    });
    expect(JSON.parse(mockLogEvent.mock.calls[1][0].extra)).toMatchObject({
      closed_by: 'back',
    });
    expect(readingMessages()).toEqual(['open', 'touch', 'close']);
    expect(document.documentElement).not.toHaveClass('reading');
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    expect(closeTopLayer()).toBe(false);
    back.mockRestore();
    jest.useRealTimers();
  });

  it('leaves a sideways swipe to the page, and lifts on a vertical one', () => {
    withReadingBridge();
    renderPostPage();
    fireEvent.click(screen.getByText('Read post'));

    const swipe = (to: { clientX: number; clientY: number }) => {
      fireEvent.touchStart(window, {
        touches: [{ clientX: 100, clientY: 500 }],
      });
      const allowed = fireEvent.touchMove(window, { touches: [to] });
      fireEvent.touchEnd(window, { touches: [] });
      return allowed;
    };

    expect(swipe({ clientX: 160, clientY: 490 })).toBe(true);
    expect(swipe({ clientX: 102, clientY: 450 })).toBe(false);
  });
});
