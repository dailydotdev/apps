/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { ReactElement, useContext, useState } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { NextSeo } from 'next-seo';
import Feed from '../components/Feed';
import { BOOKMARKS_FEED_QUERY } from '../graphql/feed';
import { headerHeight } from '../styles/sizes';
import sizeN from '../macros/sizeN.macro';
import {
  CustomFeedHeader,
  customFeedIcon,
  FeedPage,
} from '../components/utilities';
import styled from '@emotion/styled';
import { typoTitle1 } from '../styles/typography';
import BookmarkIcon from '../icons/bookmark.svg';
import { getLayout } from '../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../components/layouts/MainFeedPage';
import AuthContext from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import PrimaryButton from '../components/buttons/PrimaryButton';
import Link from 'next/link';

const Icon = styled(BookmarkIcon)`
  ${customFeedIcon}
`;

const EmptyScreenContainer = styled.main`
  position: fixed;
  display: flex;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin-top: ${headerHeight};
  padding: 0 ${sizeN(6)};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--theme-label-secondary);

  p,
  h1 {
    text-align: center;
    max-width: 32.5rem;
  }
`;

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
      <EmptyScreenContainer>
        <NextSeo {...seo} />
        <Icon
          css={css`
            margin: 0;
            font-size: ${sizeN(20)};
          `}
        />
        <h1
          css={css`
            margin: ${sizeN(4)} 0;
            color: var(--theme-label-primary);
            ${typoTitle1}
          `}
        >
          Your bookmark list is empty.
        </h1>
        <p
          css={css`
            margin-bottom: ${sizeN(10)};
          `}
        >
          Go back to your feed and bookmark posts you’d like to keep or read
          later. Each post you bookmark will be stored here.
        </p>
        <Link href="/" passHref>
          <PrimaryButton tag="a" buttonSize="large">
            Back to feed
          </PrimaryButton>
        </Link>
      </EmptyScreenContainer>
    );
  }

  return (
    <FeedPage>
      <NextSeo {...seo} />
      <CustomFeedHeader>
        <Icon />
        <span>Bookmarks</span>
      </CustomFeedHeader>
      <Feed
        query={BOOKMARKS_FEED_QUERY}
        onEmptyFeed={() => setShowEmptyScreen(true)}
        css={css`
          margin-top: ${sizeN(3)};
          margin-bottom: ${sizeN(3)};
        `}
      />
    </FeedPage>
  );
};

BookmarksPage.getLayout = getLayout;
BookmarksPage.layoutProps = mainFeedLayoutProps;

export default BookmarksPage;
