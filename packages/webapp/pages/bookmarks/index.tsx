import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  getBookmarkFeedLayout,
  bookmarkFeedLayoutProps,
} from '../../components/layouts/BookmarkFeedPage';
import { defaultOpenGraph, defaultSeo, noindexSeoProps } from '../../next-seo';

const seo: NextSeoProps = {
  title: `Your daily.dev bookmarks`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  ...noindexSeoProps,
};

const BookmarksPage = (): ReactElement => <></>;

BookmarksPage.getLayout = getBookmarkFeedLayout;
BookmarksPage.layoutProps = { ...bookmarkFeedLayoutProps, seo };

export default BookmarksPage;
