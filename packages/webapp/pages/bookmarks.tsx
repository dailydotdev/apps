import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { BOOKMARKS_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { headerHeight } from '@dailydotdev/shared/src/styles/sizes';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CustomFeedHeader,
  customFeedIcon,
  FeedPage,
} from '@dailydotdev/shared/src/components/utilities';
import { mainFeedLayoutProps } from '../components/layouts/MainFeedPage';
import { getLayout } from '../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import MagnifyingIcon from '@dailydotdev/shared/icons/magnifying.svg';
import dynamic from 'next/dynamic';
const PostsSearch = dynamic(
  () =>
    import(/* webpackChunkName: "search" */ '../components/RouterPostsSearch'),
  { ssr: false },
);

const BookmarksPage = (): ReactElement => {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showSearch, setShowSearch] = useState(false);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);

  if (!user && tokenRefreshed) {
    router.replace('/');
    return <></>;
  }

  const seo: NextSeoProps = {
    title: `Your daily.dev bookmarks`,
    titleTemplate: '%s',
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };

  if (showEmptyScreen) {
    return (
      <main
        className="fixed inset-0 flex flex-col items-center justify-center px-6 withNavBar text-theme-label-secondary"
        style={{ marginTop: headerHeight }}
      >
        <NextSeo {...seo} />
        <BookmarkIcon
          className="m-0 icon text-theme-label-tertiary"
          style={{ fontSize: sizeN(20) }}
        />
        <h1
          className="my-4 text-center text-theme-label-primary typo-title1"
          style={{ maxWidth: '32.5rem' }}
        >
          Your bookmark list is empty.
        </h1>
        <p className="mb-10 text-center" style={{ maxWidth: '32.5rem' }}>
          Go back to your feed and bookmark posts you’d like to keep or read
          later. Each post you bookmark will be stored here.
        </p>
        <Link href="/" passHref>
          <Button className="btn-primary" tag="a" buttonSize="large">
            Back to feed
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <FeedPage>
      <NextSeo {...seo} />
      <CustomFeedHeader className="relative">
        {!showSearch && (
          <>
            <Button title="Search" onClick={() => setShowSearch(true)}>
              <MagnifyingIcon />
            </Button>
            <div className="w-px h-full mr-4 bg-theme-bg-tertiary"></div>
            <span>Bookmarks</span>
          </>
        )}
        {showSearch && <PostsSearch />}
      </CustomFeedHeader>
      {tokenRefreshed && (
        <Feed
          feedQueryKey={['bookmarks', user?.id ?? 'anonymous']}
          query={BOOKMARKS_FEED_QUERY}
          onEmptyFeed={() => setShowEmptyScreen(true)}
          className="my-3"
        />
      )}
    </FeedPage>
  );
};

BookmarksPage.getLayout = getLayout;
BookmarksPage.layoutProps = mainFeedLayoutProps;

export default BookmarksPage;
