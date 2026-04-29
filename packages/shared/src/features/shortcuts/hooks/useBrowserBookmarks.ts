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

const flattenBar = (bar: Bookmarks.BookmarkTreeNode): BrowserBookmark[] => {
  const bookmarks: BrowserBookmark[] = [];

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
      }
    });
  };

  walk(bar.children ?? [], 0);
  return bookmarks;
};

export interface UseBrowserBookmarks {
  bookmarks: BrowserBookmark[] | undefined;
  hasCheckedPermission: boolean;
  askBookmarksPermission: () => Promise<boolean>;
  revokeBookmarksPermission: () => Promise<void>;
}

export const useBrowserBookmarks = (): UseBrowserBookmarks => {
  const [browser, setBrowser] = useState<Browser>();
  const [bookmarks, setBookmarks] = useState<BrowserBookmark[] | undefined>();
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  const getBookmarks = useCallback(async (): Promise<void> => {
    if (!browser?.bookmarks) {
      setBookmarks(undefined);
      setHasCheckedPermission(true);
      return;
    }

    try {
      const tree = await browser.bookmarks.getTree();
      const bar = findBookmarksBar(tree);
      if (!bar) {
        setBookmarks([]);
      } else {
        setBookmarks(flattenBar(bar));
      }
    } catch (_) {
      setBookmarks(undefined);
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
      hasCheckedPermission,
      askBookmarksPermission,
      revokeBookmarksPermission,
    }),
    [
      bookmarks,
      hasCheckedPermission,
      askBookmarksPermission,
      revokeBookmarksPermission,
    ],
  );
};
