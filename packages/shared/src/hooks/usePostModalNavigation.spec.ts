import { act, renderHook } from '@testing-library/react';
import type { ParsedUrlQuery } from 'querystring';
import post from '../../__tests__/fixture/post';
import { FeedItemType } from '../components/cards/common/common';
import type { UseRouterMemory } from './useRouterMemory';
import { usePostModalNavigation } from './usePostModalNavigation';

const mockRouter = {
  asPath: '/',
  pathname: '/',
  query: {} as ParsedUrlQuery,
  push: jest.fn<
    ReturnType<UseRouterMemory['push']>,
    Parameters<UseRouterMemory['push']>
  >(),
};

jest.mock('next/router', () => ({ useRouter: () => mockRouter }));
jest.mock('../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));
jest.mock('../lib/feed', () => ({ postLogEvent: jest.fn() }));
jest.mock('./useFeed', () => ({ isBoostedPostAd: () => false }));
jest.mock('./useKeyboardNavigation', () => ({
  useKeyboardNavigation: jest.fn(),
}));

let historyKey = 0;

const setScrollY = (value: number): void => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value });
};

const getHistoryEntry = () => ({
  key: window.history.state.key as string,
  asPath: mockRouter.asPath,
  pathname: mockRouter.pathname,
  query: mockRouter.query,
});

const restoreHistoryEntry = (entry: ReturnType<typeof getHistoryEntry>) => {
  window.history.replaceState({ key: entry.key }, '', entry.asPath);
  mockRouter.asPath = entry.asPath;
  mockRouter.pathname = entry.pathname;
  mockRouter.query = entry.query;
};

const renderNavigation = () =>
  renderHook(() =>
    usePostModalNavigation({
      items: [post, { ...post, id: 'second-post' }].map((item, index) => ({
        type: FeedItemType.Post,
        post: item,
        page: 0,
        index,
        dataUpdatedAt: 0,
      })),
      fetchPage: jest.fn(),
      updatePost: jest.fn(),
      canFetchMore: false,
      feedName: 'main',
    }),
  );

beforeEach(() => {
  historyKey += 1;
  restoreHistoryEntry({
    key: `${historyKey}`,
    asPath: '/',
    pathname: '/',
    query: {},
  });
  mockRouter.push.mockReset();
  mockRouter.push.mockImplementation(async (url, as) => {
    const parsed = new URL(url, window.location.origin);
    historyKey += 1;
    restoreHistoryEntry({
      key: `${historyKey}`,
      asPath: as ?? url,
      pathname: parsed.pathname,
      query: Object.fromEntries(parsed.searchParams.entries()),
    });
    return true;
  });
  setScrollY(0);
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: jest.fn((_x: number, y: number) => setScrollY(y)),
  });
});

it('restores the feed when browser Back reopens a closed post', async () => {
  const { result, rerender } = renderNavigation();
  setScrollY(5000);
  await act(async () => result.current.onOpenModal(0));
  rerender();
  const postEntry = getHistoryEntry();
  setScrollY(0);

  await act(async () => result.current.onCloseModal());
  rerender();
  expect(window.scrollY).toBe(5000);

  restoreHistoryEntry(postEntry);
  rerender();
  expect(result.current.selectedPost?.id).toBe(post.id);
  setScrollY(0);
  await act(async () => result.current.onCloseModal());

  expect(window.scrollY).toBe(5000);
});

it('keeps separate positions for earlier modal history entries after a remount', async () => {
  const view = renderNavigation();
  setScrollY(5000);
  await act(async () => view.result.current.onOpenModal(0));
  view.rerender();
  const firstEntry = getHistoryEntry();
  await act(async () => view.result.current.onCloseModal());
  view.rerender();

  setScrollY(9000);
  await act(async () => view.result.current.onOpenModal(0));
  view.rerender();
  const secondEntry = getHistoryEntry();
  view.unmount();

  restoreHistoryEntry(firstEntry);
  setScrollY(0);
  const utils = renderNavigation();
  await act(async () => utils.result.current.onCloseModal());
  expect(window.scrollY).toBe(5000);

  restoreHistoryEntry(secondEntry);
  setScrollY(0);
  utils.rerender();
  await act(async () => utils.result.current.onCloseModal());
  expect(window.scrollY).toBe(9000);
});

it('carries the original feed position through next-post navigation after a remount', async () => {
  const view = renderNavigation();
  setScrollY(5000);
  await act(async () => view.result.current.onOpenModal(0));
  view.unmount();
  setScrollY(0);

  const utils = renderNavigation();
  await act(async () => utils.result.current.onNext());
  utils.rerender();
  expect(utils.result.current.selectedPost?.id).toBe('second-post');
  await act(async () => utils.result.current.onCloseModal());

  expect(window.scrollY).toBe(5000);
});

it('does not reset the scroll when a modal has no saved position', async () => {
  mockRouter.query = { pmid: post.id, pmcid: 'main', pmp: '/', pmap: '/' };
  const { result } = renderNavigation();
  setScrollY(1200);
  await act(async () => result.current.onCloseModal());

  expect(window.scrollTo).not.toHaveBeenCalled();
});

it('does not restore the feed when closing navigation is cancelled', async () => {
  const { result, rerender } = renderNavigation();
  setScrollY(5000);
  await act(async () => result.current.onOpenModal(0));
  rerender();
  setScrollY(0);
  mockRouter.push.mockResolvedValueOnce(false);
  await act(async () => result.current.onCloseModal());

  expect(window.scrollTo).not.toHaveBeenCalled();
});
