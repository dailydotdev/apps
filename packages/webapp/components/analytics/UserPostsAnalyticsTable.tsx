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
          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] gap-4 border-b border-border-subtlest-tertiary pb-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Post
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Date
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="text-right"
            >
              Reputation
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="text-right"
            >
              Impressions
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="text-right"
            >
              Upvotes
            </Typography>
          </div>

          {/* Body */}
          <div className="flex flex-col">
            {posts.map((post) => (
              <div
                key={post.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] gap-4 border-b border-border-subtlest-tertiary py-3 last:border-b-0"
              >
                <div className="min-w-0">
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
                            truncate
                          >
                            {post.sharedPost?.title || post.title || 'Untitled'}
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
                <div className="flex items-center">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {formatDate({
                      value: post.createdAt,
                      type: TimeFormatType.Post,
                    })}
                  </Typography>
                </div>
                <div className="flex items-center justify-end">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {largeNumberFormat(post.analytics?.reputation ?? 0)}
                  </Typography>
                </div>
                <div className="flex items-center justify-end">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {largeNumberFormat(post.analytics?.impressions ?? 0)}
                  </Typography>
                </div>
                <div className="flex items-center justify-end">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {largeNumberFormat(post.analytics?.upvotes ?? 0)}
                  </Typography>
                </div>
              </div>
            ))}
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
