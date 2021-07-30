import React, { ReactElement, useContext, useState } from 'react';
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

const BookmarksPage = (): ReactElement => {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);
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
        className="withNavBar fixed flex flex-col inset-0 px-6 items-center justify-center text-theme-label-secondary"
        style={{ marginTop: headerHeight }}
      >
        <NextSeo {...seo} />
        <BookmarkIcon
          className="icon m-0 text-theme-label-tertiary"
          style={{ fontSize: sizeN(20) }}
        />
        <h1
          className="my-4 text-theme-label-primary typo-title1 text-center"
          style={{ maxWidth: '32.5rem' }}
        >
          Your bookmark list is empty.
        </h1>
        <p className="text-center mb-10" style={{ maxWidth: '32.5rem' }}>
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
      <CustomFeedHeader>
        <BookmarkIcon className={customFeedIcon} />
        <span>Bookmarks</span>
      </CustomFeedHeader>
      <Feed
        query={BOOKMARKS_FEED_QUERY}
        onEmptyFeed={() => setShowEmptyScreen(true)}
        className="my-3"
      />
    </FeedPage>
  );
};

BookmarksPage.getLayout = getLayout;
BookmarksPage.layoutProps = mainFeedLayoutProps;

export default BookmarksPage;
