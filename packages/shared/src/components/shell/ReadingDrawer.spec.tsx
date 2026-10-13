import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingDrawer } from './ReadingDrawer';
import { ReadingEvent, setReadingOpen } from './readingStore';
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
      <ReadingDrawer post={post} />
    </QueryClientProvider>,
  );

const readingMessages = () =>
  postMessage.mock.calls.map(([payload]) => payload.action);

beforeEach(() => {
  postMessage.mockClear();
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
    withReadingBridge();
    renderPostPage();
    fireEvent.click(screen.getByText('Read post'));
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    act(() => {
      expect(closeTopLayer()).toBe(true);
    });

    expect(back).toHaveBeenCalledTimes(1);
    expect(readingMessages()).toEqual(['open', 'touch', 'close']);
    expect(document.documentElement).not.toHaveClass('reading');
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    expect(closeTopLayer()).toBe(false);
    back.mockRestore();
  });
});
