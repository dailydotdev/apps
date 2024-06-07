import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import { widgetClasses } from '../widgets/common';
import { InfinitePaginationActions } from '../pagination';
import { ElementPlaceholder } from '../ElementPlaceholder';
import {
  Post,
  PostRelationType,
  RELATED_POSTS_PER_PAGE_DEFAULT,
} from '../../graphql/posts';
import { SourceAvatar } from '../profile/source';
import PostMetadata from '../cards/PostMetadata';
import { CardLink } from '../cards/Card';
import { useRelatedPosts } from '../../hooks/post';
import { ProfileImageSize } from '../ProfilePicture';

export type RelatedPostsWidgetProps = {
  className?: string;
  post: Post;
  perPage?: number;
  relationType: PostRelationType;
};

export const RelatedPostsWidget = ({
  className,
  post,
  perPage = RELATED_POSTS_PER_PAGE_DEFAULT,
  relationType,
}: RelatedPostsWidgetProps): ReactElement => {
  const {
    relatedPosts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRelatedPosts({
    postId: post.id,
    relationType,
    perPage,
  });
  const [page, setPage] = useState(0);
  const relatedPostPage = relatedPosts?.pages[page];
  const hasRelatedPosts = isLoading || !!relatedPostPage?.edges.length;
  const hasNextPageData = !!relatedPosts?.pages[page + 1];

  useEffect(() => {
    if (hasNextPage && !hasNextPageData) {
      fetchNextPage();
    }
  }, [hasNextPage, hasNextPageData, fetchNextPage]);

  if (!hasRelatedPosts) {
    return null;
  }

  return (
    <div className={classNames(className, 'flex flex-col', widgetClasses)}>
      <div className="flex cursor-pointer items-center justify-between rounded-16 rounded-t-16 px-4 py-1.5 laptop:cursor-auto laptop:py-4 laptop:!pb-0">
        <p className="font-bold text-text-quaternary typo-callout laptop:text-text-quaternary">
          {post.numCollectionSources} sources
        </p>
      </div>
      <div className="flex flex-col pb-0 pt-2 laptop:min-h-[14rem]">
        {isLoading && (
          <article
            aria-busy
            className="flex w-60 flex-col items-stretch px-4 py-2 laptop:w-full"
          >
            <div className="mb-2 flex items-center">
              <ElementPlaceholder className="mr-2 h-6 w-6 rounded-full" />
              <ElementPlaceholder className="h-4 w-24" />
            </div>
            <div className="mb-2 flex flex-1 flex-col items-center">
              <ElementPlaceholder className="my-1 h-4 w-full" />
              <ElementPlaceholder className="my-1 h-4 w-full" />
            </div>
          </article>
        )}
        {!isLoading &&
          relatedPostPage?.edges.map(({ node: relatedPost }) => {
            return (
              <article
                key={relatedPost.id}
                className="relative flex flex-col gap-2 px-4 py-2 hover:bg-surface-hover"
              >
                <CardLink
                  className="cursor-pointer"
                  href={relatedPost.commentsPermalink}
                  title={relatedPost.title}
                />
                <div className="flex overflow-hidden">
                  <SourceAvatar
                    source={relatedPost.source}
                    size={ProfileImageSize.Small}
                  />
                  <PostMetadata
                    description={relatedPost.source.name}
                    createdAt={relatedPost.createdAt}
                  />
                </div>
                <p className="line-clamp-2 text-text-link typo-callout">
                  {relatedPost.title}
                </p>
                {!!relatedPost.summary && (
                  <p className="line-clamp-2 text-text-tertiary typo-footnote">
                    {relatedPost.summary}
                  </p>
                )}
              </article>
            );
          })}
      </div>

      <InfinitePaginationActions
        hasNext={hasNextPageData}
        hasPrevious={page > 0}
        onPrevious={() => {
          setPage((currentPage) => (currentPage ? currentPage - 1 : 0));
        }}
        onNext={async () => {
          if (isFetchingNextPage) {
            return;
          }

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
