import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  getBookmarkFeedLayout,
  bookmarkFeedLayoutProps,
} from '../../components/layouts/BookmarkFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: `Your daily.dev read it later bookmarks`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const BookmarksPage = (): ReactElement => <></>;

BookmarksPage.getLayout = getBookmarkFeedLayout;
BookmarksPage.layoutProps = {
  ...bookmarkFeedLayoutProps,
  isReminderOnly: true,
  seo,
};

export default BookmarksPage;
