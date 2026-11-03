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

const mockSetFlag = jest.fn();

jest.mock('../../hooks/useSettingsBooleanFlag', () => ({
  useSettingsBooleanFlag: () => ({ value: false, set: mockSetFlag }),
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
        <div data-feed-item>
          <a href="https://api.daily.dev/r/p2">Read another post</a>
        </div>
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
  mockSetFlag.mockClear();
  window.scrollTo = jest.fn();
});

afterEach(() => {
  act(() => setReadingOpen(false));
  delete (globalThis as BridgeGlobal).webkit;
  document.documentElement.classList.remove('ios', 'reading');
  document.querySelector('.shell-layout')?.remove();
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
    fireEvent.click(screen.getByText('Read another post'));
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

  it('owns no history entry from a feed card, so one back leaves the post', () => {
    jest.useFakeTimers();
    withReadingBridge();
    queueReadingOpen(post, post.permalink as string);
    renderPostPage();
    act(() => {
      jest.advanceTimersByTime(openDuration);
    });
    expect(document.documentElement).toHaveClass('reading');
    expect(mockRouter.beforePopState).not.toHaveBeenCalled();

    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    // The wrapper's press is not used: history moves, the post leaves.
    expect(closeTopLayer()).toBe(false);
    expect(back).not.toHaveBeenCalled();

    // The drawer's own close keeps the post page, with nothing popped.
    fireEvent.click(screen.getByLabelText('Close'));
    act(() => {
      jest.advanceTimersByTime(openDuration);
    });
    expect(back).not.toHaveBeenCalled();
    expect(document.documentElement).not.toHaveClass('reading');
    back.mockRestore();
    jest.useRealTimers();
  });

  it('leaves the scroll to the page it goes back to when back leaves a feed arrival', () => {
    jest.useFakeTimers();
    withReadingBridge();
    queueReadingOpen(post, post.permalink as string);
    renderPostPage();
    act(() => {
      jest.advanceTimersByTime(openDuration);
    });
    expect(document.documentElement).toHaveClass('reading');
    jest.mocked(window.scrollTo).mockClear();

    const onRouteChange = mockRouter.events.on.mock.calls
      .filter(([name]) => name === 'routeChangeStart')
      .map(([, handler]) => handler)
      .at(-1);
    act(() => onRouteChange());

    expect(document.documentElement).not.toHaveClass('reading');
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(mockLogEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        extra: expect.stringContaining('"closed_by":"leave"'),
      }),
    );
    jest.useRealTimers();
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

  it('says when the page failed to load, with reload and the menu still there', () => {
    withReadingBridge();
    renderPostPage();
    fireEvent.click(screen.getByText('Read post'));

    act(() => {
      window.dispatchEvent(
        new CustomEvent(ReadingEvent.State, {
          detail: {
            url: 'https://www.rust-lang.org/blog',
            loading: false,
            error: 'The Internet connection appears to be offline.',
          },
        }),
      );
    });

    expect(screen.getByLabelText('Page options')).toHaveTextContent(
      "rust-lang.org didn't load",
    );
    expect(screen.getByLabelText('Reload')).toBeInTheDocument();
  });

  it('names Safari in the page menu and remembers the choice from the Always switch', () => {
    withReadingBridge();
    renderPostPage();
    fireEvent.click(screen.getByText('Read post'));
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    fireEvent.click(screen.getByLabelText('Page options'));

    expect(screen.getByText('Open in Safari')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Close')).toHaveLength(1);

    fireEvent.click(screen.getByLabelText('Always open links in Safari'));

    expect(postMessage).toHaveBeenCalledWith({ action: 'external' });
    expect(back).toHaveBeenCalledTimes(1);
    expect(mockSetFlag).toHaveBeenCalledWith(true);
    expect(document.documentElement).not.toHaveClass('reading');
    back.mockRestore();
  });

  it('shares the page through the system share sheet', async () => {
    withReadingBridge();
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });
    renderPostPage();
    fireEvent.click(screen.getByText('Read post'));
    act(() => {
      window.dispatchEvent(
        new CustomEvent(ReadingEvent.State, {
          detail: { url: 'https://www.rust-lang.org/blog', title: 'Rust Blog' },
        }),
      );
    });

    fireEvent.click(screen.getByLabelText('Share the page'));
    await act(async () => {
      await Promise.resolve();
    });

    expect(share).toHaveBeenCalledWith({
      title: 'Rust Blog',
      url: 'https://www.rust-lang.org/blog',
    });
    delete (navigator as { share?: unknown }).share;
    delete (navigator as { maxTouchPoints?: unknown }).maxTouchPoints;
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

  const renderShellLayout = () => {
    const layout = document.createElement('div');
    layout.className = 'shell-layout';
    const main = document.createElement('main');
    const cluster = document.createElement('div');
    cluster.className = 'shell-cluster';
    const loading = document.createElement('div');
    main.append(loading, cluster);
    layout.appendChild(main);
    document.body.appendChild(layout);
    const arrive = () => {
      const arrived = document.createElement('article');
      arrived.textContent = 'The post, once its page has loaded';
      loading.remove();
      main.insertBefore(arrived, cluster);
      return arrived;
    };
    return { main, loading, arrive };
  };

  it('keeps moving the page after its content was swapped under the drawer', () => {
    withReadingBridge();
    renderPostPage();
    const { arrive } = renderShellLayout();
    fireEvent.click(screen.getByText('Read post'));

    const arrived = arrive();

    fireEvent.touchStart(window, { touches: [{ clientX: 100, clientY: 500 }] });
    fireEvent.touchMove(window, { touches: [{ clientX: 102, clientY: 420 }] });

    expect(arrived.style.transform).toMatch(/translateY\(-?\d+px\)/);
    fireEvent.touchEnd(window, { touches: [] });
  });

  it('moves the content that arrives in the middle of a drag, and lets go of what left', async () => {
    withReadingBridge();
    renderPostPage();
    const { loading, arrive } = renderShellLayout();
    fireEvent.click(screen.getByText('Read post'));
    fireEvent.touchStart(window, { touches: [{ clientX: 100, clientY: 500 }] });
    fireEvent.touchMove(window, { touches: [{ clientX: 102, clientY: 420 }] });
    const { transform } = loading.style;
    expect(transform).toMatch(/translateY\(-?\d+px\)/);

    const arrived = arrive();
    await act(async () => {
      await Promise.resolve();
    });

    expect(arrived.style.transform).toBe(transform);
    expect(loading).not.toHaveStyle({ transform });
    fireEvent.touchEnd(window, { touches: [] });
  });

  it('moves the pieces around something fixed that mounts in the middle of a drag', async () => {
    withReadingBridge();
    renderPostPage();
    const { loading } = renderShellLayout();
    const content = document.createElement('section');
    loading.appendChild(content);
    fireEvent.click(screen.getByText('Read post'));
    fireEvent.touchStart(window, { touches: [{ clientX: 100, clientY: 500 }] });
    fireEvent.touchMove(window, { touches: [{ clientX: 102, clientY: 420 }] });
    const { transform } = loading.style;
    expect(transform).toMatch(/translateY\(-?\d+px\)/);

    const pill = document.createElement('button');
    pill.className = 'fixed';
    loading.appendChild(pill);
    await act(async () => {
      await Promise.resolve();
    });

    expect(loading).not.toHaveStyle({ transform });
    expect(content.style.transform).toBe(transform);
    expect(pill).not.toHaveStyle({ transform });
    fireEvent.touchEnd(window, { touches: [] });
  });
});
