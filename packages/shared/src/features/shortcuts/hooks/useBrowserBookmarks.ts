import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Browser, Bookmarks } from 'webextension-polyfill';
import { checkIsExtension } from '../../../lib/func';

export type BrowserBookmark = {
  title: string;
  url: string;
};

// Cross-browser bookmarks-bar folder ids:
// Chrome / Edge / Opera = "1"; Firefox = "toolbar_____" (5 underscores).
const KNOWN_BOOKMARKS_BAR_IDS = ['1', 'toolbar_____'];
const FALLBACK_BAR_TITLES = ['Bookmarks bar', 'Bookmarks Toolbar'];

const isBookmarksBarNode = (node: Bookmarks.BookmarkTreeNode): boolean => {
  if (KNOWN_BOOKMARKS_BAR_IDS.includes(node.id)) {
    return true;
  }
  return !!node.title && FALLBACK_BAR_TITLES.includes(node.title);
};

const findBookmarksBar = (
  nodes: Bookmarks.BookmarkTreeNode[] | undefined,
): Bookmarks.BookmarkTreeNode | null => {
  if (!nodes) {
    return null;
  }
  return nodes.reduce<Bookmarks.BookmarkTreeNode | null>((found, node) => {
    if (found) {
      return found;
    }
    if (isBookmarksBarNode(node)) {
      return node;
    }
    return findBookmarksBar(node.children);
  }, null);
};

type FlattenResult = { bookmarks: BrowserBookmark[]; skippedNested: number };

const flattenBar = (bar: Bookmarks.BookmarkTreeNode): FlattenResult => {
  const bookmarks: BrowserBookmark[] = [];
  let skippedNested = 0;

  const walk = (nodes: Bookmarks.BookmarkTreeNode[], depth: number) => {
    nodes.forEach((node) => {
      if (node.url) {
        bookmarks.push({
          title: node.title || node.url,
          url: node.url,
        });
        return;
      }
      if (depth === 0) {
        if (node.children?.length) {
          walk(node.children, depth + 1);
        }
      } else if (node.children) {
        skippedNested += node.children.filter((c) => c.url).length;
      }
    });
  };

  walk(bar.children ?? [], 0);
  return { bookmarks, skippedNested };
};

export interface UseBrowserBookmarks {
  bookmarks: BrowserBookmark[] | undefined;
  skippedNested: number;
  hasCheckedPermission: boolean;
  askBookmarksPermission: () => Promise<boolean>;
  revokeBookmarksPermission: () => Promise<void>;
}

export const useBrowserBookmarks = (): UseBrowserBookmarks => {
  const [browser, setBrowser] = useState<Browser>();
  const [bookmarks, setBookmarks] = useState<BrowserBookmark[] | undefined>();
  const [skippedNested, setSkippedNested] = useState(0);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  const getBookmarks = useCallback(async (): Promise<void> => {
    if (!browser?.bookmarks) {
      setBookmarks(undefined);
      setSkippedNested(0);
      setHasCheckedPermission(true);
      return;
    }

    try {
      const tree = await browser.bookmarks.getTree();
      const bar = findBookmarksBar(tree);
      if (!bar) {
        setBookmarks([]);
        setSkippedNested(0);
      } else {
        const { bookmarks: flat, skippedNested: skipped } = flattenBar(bar);
        setBookmarks(flat);
        setSkippedNested(skipped);
      }
    } catch (_) {
      setBookmarks(undefined);
      setSkippedNested(0);
    }

    setHasCheckedPermission(true);
  }, [browser]);

  const askBookmarksPermission = useCallback(async (): Promise<boolean> => {
    if (!browser) {
      return false;
    }

    const granted = await browser.permissions.request({
      permissions: ['bookmarks'],
    });
    if (granted) {
      await getBookmarks();
    }
    return granted;
  }, [browser, getBookmarks]);

  const revokeBookmarksPermission = useCallback(async (): Promise<void> => {
    if (!browser) {
      return;
    }

    await browser.permissions.remove({ permissions: ['bookmarks'] });
    setBookmarks(undefined);
    setSkippedNested(0);
  }, [browser]);

  useEffect(() => {
    if (!checkIsExtension()) {
      return;
    }
    if (!browser) {
      import('webextension-polyfill').then((mod) => setBrowser(mod.default));
    } else {
      getBookmarks();
    }
  }, [browser, getBookmarks]);

  return useMemo(
    () => ({
      bookmarks,
      skippedNested,
      hasCheckedPermission,
      askBookmarksPermission,
      revokeBookmarksPermission,
    }),
    [
      bookmarks,
      skippedNested,
      hasCheckedPermission,
      askBookmarksPermission,
      revokeBookmarksPermission,
    ],
  );
};
