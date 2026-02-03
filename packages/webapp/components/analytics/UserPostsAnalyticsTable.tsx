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
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border-subtlest-tertiary">
              <th className="pb-2 text-left">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Post
                </Typography>
              </th>
              <th className="pb-2 text-left">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Date
                </Typography>
              </th>
              <th className="pb-2 text-right">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Reputation
                </Typography>
              </th>
              <th className="pb-2 text-right">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Impressions
                </Typography>
              </th>
              <th className="pb-2 text-right">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Upvotes
                </Typography>
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-border-subtlest-tertiary last:border-b-0"
              >
                <td className="py-3">
                  <Link href={`${webappUrl}posts/${post.id}/analytics`}>
                    <div className="flex items-center gap-3 hover:underline">
                      <LazyImage
                        imgSrc={
                          post.image || cloudinaryPostImageCoverPlaceholder
                        }
                        imgAlt={post.title || 'Post image'}
                        ratio="52%"
                        className="h-10 w-16 rounded-8 object-cover"
                        fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                      />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex min-w-0 items-center gap-1">
                          <Typography
                            type={TypographyType.Callout}
                            color={TypographyColor.Primary}
                            truncate
                          >
                            {post.title || 'Untitled'}
                          </Typography>
                          {post.isBoosted && (
                            <BoostIcon
                              size={IconSize.XSmall}
                              className="text-accent-blueCheese-default"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="py-3">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {formatDate({
                      value: post.createdAt,
                      type: TimeFormatType.Post,
                    })}
                  </Typography>
                </td>
                <td className="py-3 text-right">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {largeNumberFormat(post.analytics?.reputation ?? 0)}
                  </Typography>
                </td>
                <td className="py-3 text-right">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {largeNumberFormat(post.analytics?.impressions ?? 0)}
                  </Typography>
                </td>
                <td className="py-3 text-right">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {largeNumberFormat(post.analytics?.upvotes ?? 0)}
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
