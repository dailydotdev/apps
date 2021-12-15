import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getBookmarkFeedLayout,
  bookmarkFeedLayoutProps,
} from '../components/layouts/BookmarkFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: `Your daily.dev bookmarks`,
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const BookmarksPage = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

BookmarksPage.getLayout = getBookmarkFeedLayout;
BookmarksPage.layoutProps = bookmarkFeedLayoutProps;

export default BookmarksPage;
