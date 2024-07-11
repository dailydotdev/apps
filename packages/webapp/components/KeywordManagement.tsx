import React, { ReactElement, useContext, useState } from 'react';
import {
  ALLOW_KEYWORD_MUTATION,
  DENY_KEYWORD_MUTATION,
  Keyword,
} from '@dailydotdev/shared/src/graphql/keywords';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import {
  FeedData,
  KEYWORD_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { NextSeo } from 'next-seo';
import ActivitySection from '@dailydotdev/shared/src/components/profile/ActivitySection';
import Link from 'next/link';
import { smallPostImage } from '@dailydotdev/shared/src/lib/image';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import classNames from 'classnames';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
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
      gqlClient.request(ALLOW_KEYWORD_MUTATION, {
        keyword: keyword.value,
      }),
    {
      onSuccess: () => nextKeyword(),
    },
  );

  const { mutateAsync: denyKeyword } = useMutation(
    () =>
      gqlClient.request(DENY_KEYWORD_MUTATION, {
        keyword: keyword.value,
      }),
    {
      onSuccess: () => nextKeyword(),
    },
  );

  const posts = useInfiniteQuery<FeedData>(
    ['keyword_post', keyword.value],
    ({ pageParam }) =>
      gqlClient.request(KEYWORD_FEED_QUERY, {
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
      <div className="my-1 flex items-center justify-between text-text-tertiary typo-callout">
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
              className="flex items-start py-3 no-underline tablet:items-center"
            >
              <LazyImage
                imgSrc={smallPostImage(post.image)}
                imgAlt="Post cover image"
                className="h-16 w-16 rounded-16"
              />
              <p
                className="break-words-overflow multi-truncate ml-4 flex-1 self-center whitespace-pre-wrap p-0 text-text-primary typo-callout tablet:mr-6"
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
          'fixed bottom-0 left-0 right-0 mx-auto flex w-full items-center justify-between bg-background-default px-4 py-6',
          styles.buttons,
        )}
      >
        <Button
          loading={currentAction === 'allow'}
          onClick={onAllow}
          disabled={disableActions}
          variant={ButtonVariant.Primary}
        >
          Allow
        </Button>
        <Button
          disabled={disableActions}
          onClick={onSynonym}
          variant={ButtonVariant.Secondary}
        >
          Synonym
        </Button>
        <Button
          loading={currentAction === 'deny'}
          onClick={onDeny}
          disabled={disableActions}
          variant={ButtonVariant.Primary}
          color={ButtonColor.Ketchup}
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
