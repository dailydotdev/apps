import { NextSeo } from 'next-seo';
import { NextSeoProps } from 'next-seo/lib/types';
import React, { ReactElement } from 'react';

import {
  bookmarkFeedLayoutProps,
  getBookmarkFeedLayout,
} from '../components/layouts/BookmarkFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: `Your daily.dev bookmarks`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const BookmarksPage = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} nofollow noindex />
    </>
  );
};

BookmarksPage.getLayout = getBookmarkFeedLayout;
BookmarksPage.layoutProps = bookmarkFeedLayoutProps;

export default BookmarksPage;
