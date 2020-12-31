import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from '../../components/AuthContext';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { useRouter } from 'next/router';
import { Roles } from '../../lib/user';
import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import {
  ALLOW_KEYWORD_MUTATION,
  CountPendingKeywordsData,
  DENY_KEYWORD_MUTATION,
  KeywordData,
  RANDOM_PENDING_KEYWORD_QUERY,
} from '../../graphql/keywords';
import styled from 'styled-components';
import {
  typoLil1,
  typoLil2,
  typoMicro1,
  typoQuarter,
  typoTriple,
} from '../../styles/typography';
import { ButtonLoader, PageContainer } from '../../components/utilities';
import { size1, size2, size3, size4, size6, sizeN } from '../../styles/sizes';
import { colorKetchup40 } from '../../styles/colors';
import {
  BaseButton,
  ColorButton,
  HollowButton,
  InvertButton,
} from '../../components/Buttons';
import { NextSeo } from 'next-seo';
import { multilineTextOverflow, pageMaxWidth } from '../../styles/helpers';
import { FeedData, KEYWORD_FEED_QUERY } from '../../graphql/posts';
import ActivitySection from '../../components/profile/ActivitySection';
import Link from 'next/link';
import { tablet } from '../../styles/media';
import LazyImage from '../../components/LazyImage';
import { smallPostImage } from '../../lib/image';
import { useHideOnModal } from '../../lib/useHideOnModal';
import dynamicPageLoad from '../../lib/dynamicPageLoad';

const KeywordSynonymModal = dynamicPageLoad(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ '../../components/modals/KeywordSynonymModal'
    ),
);

const EmptyScreen = styled.div`
  ${typoTriple}
`;

const Keyword = styled.h1`
  margin: 0;
  ${typoQuarter}
`;

const Subtitle = styled.div`
  display: flex;
  margin: ${size1} 0;
  align-items: center;
  justify-content: space-between;
  color: var(--theme-secondary);
  ${typoMicro1};
`;

const DenyButton = styled(ColorButton)`
  color: var(--theme-primary);
`;

const Buttons = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: calc(${pageMaxWidth} - 1rem);
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding: ${size6} ${size4};
  background: var(--theme-background-primary);

  ${BaseButton} {
    padding: ${size2} ${size4};
    border-radius: ${size2};
    ${typoLil2}
  }
`;

const PostContainer = styled.article`
  display: flex;
  flex-direction: row;
  padding: ${size3} 0;
  align-items: flex-start;
  text-decoration: none;

  ${tablet} {
    align-items: center;
  }
`;

const PostImage = styled(LazyImage)`
  width: ${sizeN(16)};
  height: ${sizeN(16)};
  border-radius: ${size4};
`;

const PostContent = styled.p`
  max-height: ${sizeN(15)};
  padding: 0;
  margin: 0 0 0 ${size4};
  flex: 1;
  align-self: center;
  color: var(--theme-primary);
  word-break: break-word;
  white-space: pre-wrap;
  ${typoLil1}
  ${multilineTextOverflow}
  -webkit-line-clamp: 3;

  ${tablet} {
    flex: 1;
    margin-right: ${size6};
    max-width: ${sizeN(77)};
  }
`;

const PendingKeywords = (): ReactElement => {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const {
    data: currentKeywordData,
    refetch: refetchCurrentKeyword,
    isLoading: isLoadingCurrentKeyword,
  } = useQuery<KeywordData & CountPendingKeywordsData>(
    'randomPendingKeyword',
    () => request(`${apiUrl}/graphql`, RANDOM_PENDING_KEYWORD_QUERY),
    {
      enabled: tokenRefreshed,
      refetchOnMount: false,
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  );
  const currentKeyword = currentKeywordData?.keyword;

  const nextKeyword = async () => {
    await refetchCurrentKeyword();
    setCurrentAction(null);
  };

  const { mutateAsync: allowKeyword } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, ALLOW_KEYWORD_MUTATION, {
        keyword: currentKeyword?.value,
      }),
    {
      onSuccess: () => nextKeyword(),
    },
  );

  const { mutateAsync: denyKeyword } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, DENY_KEYWORD_MUTATION, {
        keyword: currentKeyword?.value,
      }),
    {
      onSuccess: () => nextKeyword(),
    },
  );

  const posts = useInfiniteQuery<FeedData>(
    ['keyword_post', currentKeyword?.value],
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, KEYWORD_FEED_QUERY, {
        keyword: currentKeyword?.value,
        first: 4,
        after: pageParam,
      }),
    {
      enabled: !!currentKeyword,
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  const onAllow = () => {
    setCurrentAction('allow');
    return allowKeyword();
  };

  const onSynonym = () => setCurrentAction('synonym');

  const onDeny = () => {
    setCurrentAction('deny');
    return denyKeyword();
  };

  useEffect(() => {
    if (tokenRefreshed) {
      if (!(user?.roles.indexOf(Roles.Moderator) >= 0)) {
        router.replace('/');
      }
    }
  }, [tokenRefreshed, user]);

  useHideOnModal(() => currentAction === 'synonym', [currentAction]);

  if (isLoadingCurrentKeyword || !currentKeywordData) {
    return <></>;
  }

  if (!isLoadingCurrentKeyword && !currentKeyword) {
    return (
      <PageContainer>
        <EmptyScreen data-testid="empty">No more keywords! 🥳</EmptyScreen>
      </PageContainer>
    );
  }

  return (
    <PageContainer style={{ paddingBottom: sizeN(23) }}>
      <NextSeo title="Pending Keywords" />
      <Keyword>{currentKeyword.value}</Keyword>
      <Subtitle>
        <span>Occurrences: {currentKeyword.occurrences}</span>
        <span>Only {currentKeywordData.countPendingKeywords} left!</span>
      </Subtitle>
      <ActivitySection
        title="Keyword Posts"
        query={posts}
        emptyScreen={
          <EmptyScreen data-testid="emptyPosts">No posts</EmptyScreen>
        }
        elementToNode={(post) => (
          <Link
            href={post.commentsPermalink}
            passHref
            key={post.id}
            prefetch={false}
          >
            <PostContainer
              as="a"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.title}
            >
              <PostImage
                imgSrc={smallPostImage(post.image)}
                imgAlt="Post cover image"
              />
              <PostContent>{post.title}</PostContent>
            </PostContainer>
          </Link>
        )}
      />
      <Buttons>
        <InvertButton
          waiting={currentAction === 'allow'}
          onClick={onAllow}
          disabled={!!currentAction}
        >
          <span>Allow</span>
          <ButtonLoader />
        </InvertButton>
        <HollowButton disabled={!!currentAction} onClick={onSynonym}>
          Synonym
        </HollowButton>
        <DenyButton
          background={colorKetchup40}
          waiting={currentAction === 'deny'}
          onClick={onDeny}
          disabled={!!currentAction}
        >
          <span>Deny</span>
          <ButtonLoader />
        </DenyButton>
      </Buttons>
      <KeywordSynonymModal
        isOpen={currentAction === 'synonym'}
        selectedKeyword={currentKeyword.value}
        onRequestClose={nextKeyword}
      />
    </PageContainer>
  );
};

PendingKeywords.getLayout = getMainLayout;

export default PendingKeywords;
