import React, { ReactElement, useCallback, useState } from 'react';
import classNames from 'classnames';
import { useInfiniteQuery } from '@tanstack/react-query';
import { widgetClasses } from '../widgets/common';
import { InfinitePaginationActions } from '../pagination';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { RequestKey, StaleTime, generateQueryKey } from '../../lib/query';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { graphqlUrl } from '../../lib/config';
import {
  Post,
  PostRelationType,
  RELATED_POSTS_QUERY,
  RelatedPost,
} from '../../graphql/posts';
import { Connection } from '../../graphql/common';
import { SourceAvatar } from '../profile/source';
import PostMetadata from '../cards/PostMetadata';
import { CardLink } from '../cards/Card';

export type RelatedPostsWidgetProps = {
  className?: string;
  post: Post;
  perPage?: number;
};

export const RELATED_POSTS_PER_PAGE_DEFAULT = 5;

export const RelatedPostsWidget = ({
  className,
  post,
  perPage = RELATED_POSTS_PER_PAGE_DEFAULT,
}: RelatedPostsWidgetProps): ReactElement => {
  const { requestMethod } = useRequestProtocol();
  const [page, setPage] = useState(0);

  const {
    data: relatedPosts,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    generateQueryKey(RequestKey.RelatedPosts, null, {
      id: post.id,
      type: post.type,
    }),
    async ({ pageParam }) => {
      const result = await requestMethod<{
        relatedPosts: Connection<RelatedPost>;
      }>(graphqlUrl, RELATED_POSTS_QUERY, {
        id: post.id,
        relationType: PostRelationType.Collection,
        first: perPage,
        after: pageParam,
      });

      return result?.relatedPosts;
    },
    {
      enabled: !!post?.id,
      getNextPageParam: (lastPage) =>
        lastPage?.pageInfo?.hasNextPage && lastPage?.pageInfo?.endCursor,
      select: useCallback((data) => {
        if (!data) {
          return undefined;
        }

        return {
          ...data,
          // filter out last page with no edges returned by api paginator
          pages: data.pages.filter((pageItem) => !!pageItem?.edges.length),
        };
      }, []),
      staleTime: StaleTime.Default,
    },
  );
  const relatedPostPage = relatedPosts?.pages[page];

  return (
    <div className={classNames(className, 'flex flex-col', widgetClasses)}>
      <div
        className={classNames(
          'rounded-16 cursor-pointer laptop:cursor-auto flex justify-between items-center py-1.5 laptop:py-4 px-4 laptop:!pb-0 laptop:bg-transparent rounded-t-16 bg-theme-bg-secondary',
        )}
      >
        <p className="font-bold typo-callout text-theme-label-quaternary laptop:text-theme-label-quaternary">
          {post.numCollectionSources} sources
        </p>
      </div>
      {!isLoading && !!relatedPostPage?.edges.length && (
        <div
          className={classNames('flex pt-2 pb-0 laptop:min-h-[14rem] flex-col')}
        >
          {isLoading && (
            <article
              aria-busy
              className="flex flex-col items-stretch w-60 laptop:w-full"
            >
              <div className="flex items-center mb-2">
                <ElementPlaceholder className="mr-2 w-6 h-6 rounded-full" />
                <ElementPlaceholder className="w-24 h-4" />
              </div>
              <div className="flex flex-col flex-1 items-center mb-2">
                <ElementPlaceholder className="my-1 w-full h-4" />
                <ElementPlaceholder className="my-1 w-full h-4" />
              </div>
            </article>
          )}
          {!isLoading &&
            relatedPostPage?.edges.map(({ node: relatedPost }) => {
              return (
                <article
                  key={relatedPost.id}
                  className="flex relative flex-col gap-2 py-2 px-4 hover:bg-theme-hover"
                >
                  <CardLink
                    className="cursor-pointer"
                    href={relatedPost.permalink}
                    title={relatedPost.title}
                    rel="noopener"
                    target="_blank"
                  />
                  <div className="flex overflow-hidden">
                    <SourceAvatar source={relatedPost.source} size="small" />
                    <PostMetadata
                      description={relatedPost.source.name}
                      createdAt={relatedPost.createdAt}
                    />
                  </div>
                  <p className="line-clamp-2 typo-callout text-theme-label-link">
                    {relatedPost.title}
                  </p>
                  {!!relatedPost.summary && (
                    <p className="line-clamp-2 typo-footnote text-theme-label-tertiary">
                      {relatedPost.summary}
                    </p>
                  )}
                </article>
              );
            })}
        </div>
      )}
      <InfinitePaginationActions
        hasNext={relatedPostPage?.pageInfo?.hasNextPage}
        hasPrevious={page > 0}
        onPrevious={() => {
          setPage((currentPage) => (currentPage ? currentPage - 1 : 0));
        }}
        onNext={async () => {
          if (isFetchingNextPage) {
            return;
          }

          const hasNextPageData = !!relatedPosts.pages[page + 1];

          if (hasNextPage && !hasNextPageData) {
            await fetchNextPage();
          }

          setPage((currentPage) => {
            return currentPage + 1;
          });
        }}
      />
    </div>
  );
};
