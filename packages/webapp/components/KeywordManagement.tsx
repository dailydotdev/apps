import React, { ReactElement, useContext, useState } from 'react';
import {
  ALLOW_KEYWORD_MUTATION,
  DENY_KEYWORD_MUTATION,
  Keyword,
} from '../graphql/keywords';
import { useInfiniteQuery, useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { FeedData, KEYWORD_FEED_QUERY } from '../graphql/posts';
import { ResponsivePageContainer } from './utilities';
import sizeN from '../macros/sizeN.macro';
import { NextSeo } from 'next-seo';
import ActivitySection from './profile/ActivitySection';
import Link from 'next/link';
import { smallPostImage } from '../lib/image';
import LazyImage from './LazyImage';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import Button from './buttons/Button';
import styles from '../styles/keywordManagement.module.css';
import classNames from 'classnames';

const KeywordSynonymModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "keywordSynonymModal" */ './modals/KeywordSynonymModal'
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
    <ResponsivePageContainer style={{ paddingBottom: sizeN(23) }}>
      <NextSeo title="Pending Keywords" />
      <h1 className="m-0 font-bold typo-title2">{keyword.value}</h1>
      <div className="flex my-1 items-center justify-between text-theme-label-tertiary typo-callout">
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
              className="flex py-3 items-start no-underline tablet:items-center"
            >
              <LazyImage
                imgSrc={smallPostImage(post.image)}
                imgAlt="Post cover image"
                className="w-16 h-16 rounded-2xl"
              />
              <p
                className="p-0 ml-4 flex-1 self-center text-theme-label-primary break-words whitespace-pre-wrap typo-callout multi-truncate tablet:mr-6"
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
