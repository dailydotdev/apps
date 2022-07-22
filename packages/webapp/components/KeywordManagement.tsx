import React, { ReactElement, useContext, useState } from 'react';
import {
  ALLOW_KEYWORD_MUTATION,
  DENY_KEYWORD_MUTATION,
  Keyword,
} from '@dailydotdev/shared/src/graphql/keywords';
import { useInfiniteQuery, useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  FeedData,
  KEYWORD_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/posts';
import { NextSeo } from 'next-seo';
import ActivitySection from '@dailydotdev/shared/src/components/profile/ActivitySection';
import Link from 'next/link';
import { smallPostImage } from '@dailydotdev/shared/src/lib/image';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import classNames from 'classnames';
import styles from './KeywordManagement.module.css';

const KeywordSynonymModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "keywordSynonymModal" */ '@dailydotdev/shared/src/components/modals/KeywordSynonymModal'
    ),
);

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
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
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

  const disableActions = !!currentAction;

  return (
    <ResponsivePageContainer>
      <NextSeo title="Pending Keywords" nofollow noindex />
      <h1 className="m-0 font-bold typo-title2">{keyword.value}</h1>
      <div className="flex justify-between items-center my-1 text-theme-label-tertiary typo-callout">
        <span>Occurrences: {keyword.occurrences}</span>
        <span>{subtitle}</span>
      </div>
      <ActivitySection
        title="Keyword Posts"
        query={posts}
        emptyScreen={
          <div className="font-bold typo-title3" data-testid="emptyPosts">
            No posts
          </div>
        }
        elementToNode={(post) => (
          <Link
            href={post.commentsPermalink}
            passHref
            key={post.id}
            prefetch={false}
          >
            <a
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.title}
              className="flex items-start tablet:items-center py-3 no-underline"
            >
              <LazyImage
                imgSrc={smallPostImage(post.image)}
                imgAlt="Post cover image"
                className="w-16 h-16 rounded-2xl"
              />
              <p
                className="flex-1 self-center p-0 tablet:mr-6 ml-4 whitespace-pre-wrap break-words-overflow text-theme-label-primary typo-callout multi-truncate"
                style={{
                  maxHeight: '3.75rem',
                  maxWidth: '19.25rem',
                  lineClamp: 3,
                }}
              >
                {post.title}
              </p>
            </a>
          </Link>
        )}
      />
      <div
        className={classNames(
          'fixed flex left-0 right-0 bottom-0 w-full items-center justify-between mx-auto py-6 px-4 bg-theme-bg-primary',
          styles.buttons,
        )}
      >
        <Button
          loading={currentAction === 'allow'}
          onClick={onAllow}
          disabled={disableActions}
          className="btn-primary"
        >
          Allow
        </Button>
        <Button
          disabled={disableActions}
          onClick={onSynonym}
          className="btn-secondary"
        >
          Synonym
        </Button>
        <Button
          loading={currentAction === 'deny'}
          onClick={onDeny}
          disabled={disableActions}
          className="btn-primary-ketchup"
        >
          Deny
        </Button>
      </div>
      {(windowLoaded || currentAction === 'synonym') && (
        <KeywordSynonymModal
          isOpen={currentAction === 'synonym'}
          selectedKeyword={keyword.value}
          onRequestClose={nextKeyword}
        />
      )}
    </ResponsivePageContainer>
  );
}
