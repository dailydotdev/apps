import React, { ReactElement, useState } from 'react';
import {
  ALLOW_KEYWORD_MUTATION,
  DENY_KEYWORD_MUTATION,
  Keyword,
} from '../graphql/keywords';
import { useInfiniteQuery, useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { FeedData, KEYWORD_FEED_QUERY } from '../graphql/posts';
import { useHideOnModal } from '../lib/useHideOnModal';
import { PageContainer } from './utilities';
import { size1, size3, size4, size6, sizeN } from '../styles/sizes';
import { NextSeo } from 'next-seo';
import ActivitySection from './profile/ActivitySection';
import Link from 'next/link';
import { smallPostImage } from '../lib/image';
import dynamicPageLoad from '../lib/dynamicPageLoad';
import styled from '@emotion/styled';
import { typoCallout, typoTitle2, typoTitle3 } from '../styles/typography';
import { multilineTextOverflow, pageMaxWidth } from '../styles/helpers';
import { tablet } from '../styles/media';
import LazyImage from './LazyImage';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';

const KeywordSynonymModal = dynamicPageLoad(
  () =>
    import(
      /* webpackChunkName: "keywordSynonymModal" */ './modals/KeywordSynonymModal'
    ),
);

const EmptyScreen = styled.div`
  font-weight: bold;
  ${typoTitle3}
`;

const Title = styled.h1`
  margin: 0;
  font-weight: bold;
  ${typoTitle2}
`;

const Subtitle = styled.div`
  display: flex;
  margin: ${size1} 0;
  align-items: center;
  justify-content: space-between;
  color: var(--theme-label-tertiary);
  ${typoCallout};
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
`;

const PostContainer = styled.a`
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
  color: var(--theme-label-primary);
  word-break: break-word;
  white-space: pre-wrap;
  ${typoCallout}
  ${multilineTextOverflow}
  -webkit-line-clamp: 3;

  ${tablet} {
    flex: 1;
    margin-right: ${size6};
    max-width: ${sizeN(77)};
  }
`;

export type KeywordManagerProps = {
  keyword: Keyword;
  subtitle: string;
  onOperationCompleted?: () => Promise<void>;
};

export default function KeywordManagement({
  keyword,
  subtitle,
  onOperationCompleted,
}: KeywordManagerProps): ReactElement {
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const nextKeyword = async () => {
    if (onOperationCompleted) {
      await onOperationCompleted();
    }
    setCurrentAction(null);
  };

  const { mutateAsync: allowKeyword } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, ALLOW_KEYWORD_MUTATION, {
        keyword: keyword.value,
      }),
    {
      onSuccess: () => nextKeyword(),
    },
  );

  const { mutateAsync: denyKeyword } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, DENY_KEYWORD_MUTATION, {
        keyword: keyword.value,
      }),
    {
      onSuccess: () => nextKeyword(),
    },
  );

  const posts = useInfiniteQuery<FeedData>(
    ['keyword_post', keyword.value],
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, KEYWORD_FEED_QUERY, {
        keyword: keyword.value,
        first: 4,
        after: pageParam,
      }),
    {
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

  useHideOnModal(() => currentAction === 'synonym', [currentAction]);

  const disableActions = !!currentAction;

  return (
    <PageContainer style={{ paddingBottom: sizeN(23) }}>
      <NextSeo title="Pending Keywords" />
      <Title>{keyword.value}</Title>
      <Subtitle>
        <span>Occurrences: {keyword.occurrences}</span>
        <span>{subtitle}</span>
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
        <PrimaryButton
          loading={currentAction === 'allow'}
          onClick={onAllow}
          disabled={disableActions}
        >
          Allow
        </PrimaryButton>
        <SecondaryButton disabled={disableActions} onClick={onSynonym}>
          Synonym
        </SecondaryButton>
        <PrimaryButton
          themeColor="ketchup"
          loading={currentAction === 'deny'}
          onClick={onDeny}
          disabled={disableActions}
        >
          Deny
        </PrimaryButton>
      </Buttons>
      <KeywordSynonymModal
        isOpen={currentAction === 'synonym'}
        selectedKeyword={keyword.value}
        onRequestClose={nextKeyword}
      />
    </PageContainer>
  );
}
