import React, { ReactElement, useState } from 'react';
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

  if (!hasRelatedPosts) {
    return null;
  }

  return (
    <div className={classNames(className, 'flex flex-col', widgetClasses)}>
      <div className="flex justify-between items-center py-1.5 laptop:py-4 px-4 rounded-16 rounded-t-16 cursor-pointer laptop:cursor-auto laptop:!pb-0">
        <p className="font-bold typo-callout text-theme-label-quaternary laptop:text-theme-label-quaternary">
          {post.numCollectionSources} sources
        </p>
      </div>
      <div className="flex flex-col pt-2 pb-0 laptop:min-h-[14rem]">
        {isLoading && (
          <article
            aria-busy
            className="flex flex-col items-stretch py-2 px-4 w-60 laptop:w-full"
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
