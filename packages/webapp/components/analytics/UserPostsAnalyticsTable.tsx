import React from 'react';
import type { ReactElement } from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib';
import {
  TimeFormatType,
  formatDate,
} from '@dailydotdev/shared/src/lib/dateFormat';
import type { UserPostWithAnalytics } from '@dailydotdev/shared/src/graphql/users';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';

export interface UserPostsAnalyticsTableProps {
  posts: UserPostWithAnalytics[];
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const UserPostsAnalyticsTable = ({
  posts,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UserPostsAnalyticsTableProps): ReactElement => {
  const gridClassName =
    'grid grid-cols-[minmax(0,1fr)_max-content_max-content_max-content_max-content] gap-x-4';
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Loading posts...
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className={gridClassName}>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="pb-2"
            >
              Post
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="whitespace-nowrap pb-2"
            >
              Date
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="whitespace-nowrap pb-2 text-right"
            >
              Reputation
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="whitespace-nowrap pb-2 text-right"
            >
              Impressions
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="whitespace-nowrap pb-2 text-right"
            >
              Upvotes
            </Typography>
            <div className="col-span-5 h-px bg-border-subtlest-tertiary" />
            {posts.map((post, index) => {
              const isLast = index === posts.length - 1;

              return (
                <React.Fragment key={post.id}>
                  <div className="min-w-0 py-3">
                    <Link href={`${webappUrl}posts/${post.id}/analytics`}>
                      <div className="flex min-w-0 items-center gap-3 hover:underline">
                        <LazyImage
                          imgSrc={
                            post.sharedPost?.image ||
                            post.image ||
                            cloudinaryPostImageCoverPlaceholder
                          }
                          imgAlt={
                            post.sharedPost?.title || post.title || 'Post image'
                          }
                          ratio="52%"
                          className="h-10 w-16 flex-shrink-0 rounded-8 object-cover"
                          fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex min-w-0 items-center gap-1">
                            <Typography
                              type={TypographyType.Callout}
                              color={TypographyColor.Primary}
                              className="min-w-0 flex-1"
                              truncate
                            >
                              {post.sharedPost?.title ||
                                post.title ||
                                'Untitled'}
                            </Typography>
                            {post.isBoosted && (
                              <BoostIcon
                                size={IconSize.XSmall}
                                className="flex-shrink-0 text-accent-blueCheese-default"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-center py-3">
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      className="whitespace-nowrap"
                    >
                      {formatDate({
                        value: post.createdAt,
                        type: TimeFormatType.Post,
                      })}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-end py-3">
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Primary}
                      className="whitespace-nowrap"
                    >
                      {largeNumberFormat(post.analytics?.reputation ?? 0)}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-end py-3">
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Primary}
                      className="whitespace-nowrap"
                    >
                      {largeNumberFormat(post.analytics?.impressions ?? 0)}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-end py-3">
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Primary}
                      className="whitespace-nowrap"
                    >
                      {largeNumberFormat(post.analytics?.upvotes ?? 0)}
                    </Typography>
                  </div>
                  {!isLast && (
                    <div className="col-span-5 h-px bg-border-subtlest-tertiary" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
      {hasNextPage && (
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
          className="mx-auto"
        >
          Load more
        </Button>
      )}
    </div>
  );
};
