import React, { ReactElement, useEffect, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { useBookmarkFolder } from '@dailydotdev/shared/src/hooks/bookmark/useBookmarkFolder';
import { useRouter } from 'next/router';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import {
  getBookmarkFeedLayout,
  bookmarkFeedLayoutProps,
} from '../../components/layouts/BookmarkFeedPage';

const seo: NextSeoProps = {
  title: `Your daily.dev bookmarks`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const BookmarksPage = (): ReactElement => {
  const router = useRouter();
  const id = `${router.query.folderId}`;
  const {
    query: { folder, isPending, isReady },
  } = useBookmarkFolder({ id });
  const props = useMemo(() => {
    return {
      ...bookmarkFeedLayoutProps,
      ...(folder && {
        folder,
        title: [folder.icon, folder.name].filter(Boolean).join(' '),
      }),
    };
  }, [folder]);

  const layout = getBookmarkFeedLayout(null, { seo }, props);

  useEffect(() => {
    if (isReady && !isPending) {
      router.replace('/bookmarks');
    }
  }, [isPending, isReady, router]);

  if (!folder) {
    return null;
  }

  return <>{layout}</>;
};

export default BookmarksPage;
