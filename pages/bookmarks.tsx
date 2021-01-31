/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { ReactElement, useContext, useState } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { NextSeo } from 'next-seo';
import Feed from '../components/Feed';
import { BOOKMARKS_FEED_QUERY } from '../graphql/feed';
import { size10, size2, size3, size4, size6, sizeN } from '../styles/sizes';
import { FeedPage } from '../components/utilities';
import styled from '@emotion/styled';
import { typoCallout, typoTitle1 } from '../styles/typography';
import BookmarkIcon from '../icons/bookmark.svg';
import { getLayout } from '../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../components/layouts/MainFeedPage';
import AuthContext from '../components/AuthContext';
import { useRouter } from 'next/router';
import PrimaryButton from '../components/buttons/PrimaryButton';
import Link from 'next/link';
import { headerHeight } from '../components/layouts/MainLayout';

const Header = styled.div`
  display: flex;
  align-self: stretch;
  align-items: center;
  margin: ${size3} 0;
  color: var(--theme-label-secondary);
  ${typoCallout}
`;

const Icon = styled(BookmarkIcon)`
  font-size: ${size6};
  color: var(--theme-label-tertiary);
  margin-right: ${size2};
`;

const EmptyScreenContainer = styled.main`
  position: fixed;
  display: flex;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin-top: ${headerHeight};
  padding: 0 ${size6};
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
            margin: ${size4} 0;
            color: var(--theme-label-primary);
            ${typoTitle1}
          `}
        >
          Your bookmark list is empty.
        </h1>
        <p
          css={css`
            margin-bottom: ${size10};
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
      <Header>
        <Icon />
        <span>Bookmarks</span>
      </Header>
      <Feed
        query={BOOKMARKS_FEED_QUERY}
        onEmptyFeed={() => setShowEmptyScreen(true)}
        css={css`
          margin-top: ${size3};
          margin-bottom: ${size3};
        `}
      />
    </FeedPage>
  );
};

BookmarksPage.getLayout = getLayout;
BookmarksPage.layoutProps = mainFeedLayoutProps;

export default BookmarksPage;
