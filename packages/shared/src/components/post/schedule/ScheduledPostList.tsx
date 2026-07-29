import type { ReactElement } from 'react';
import React from 'react';
import { useScheduledPosts } from './useScheduledPosts';
import { ScheduledPostItem } from './ScheduledPostItem';
import InfiniteScrolling from '../../containers/InfiniteScrolling';
import { Loader } from '../../Loader';
import { MyProfileEmptyScreen } from '../../profile/MyProfileEmptyScreen';
import { cloudinaryCharmNoPosts } from '../../../lib/image';
import { link } from '../../../lib/links';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';

export function ScheduledPostList(): ReactElement {
  const {
    posts,
    isLoading,
    isFetched,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useScheduledPosts();

  if (isLoading && !isFetched) {
    return (
      <div className="flex justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (isFetched && posts.length === 0) {
    return (
      <MyProfileEmptyScreen
        className="items-center px-4 py-6 text-center tablet:px-6"
        image={cloudinaryCharmNoPosts}
        imageAlt="daily.dev charm waiting for a scheduled post"
        text="You have no scheduled posts. Schedule a post and it will show up here until it goes live."
        cta="New post"
        buttonProps={{ tag: 'a', href: link.post.create }}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1 px-4 py-4">
        <Typography type={TypographyType.Title3} bold>
          Scheduled posts
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Posts waiting to go live. Select one to edit or reschedule it.
        </Typography>
      </div>
      <InfiniteScrolling
        canFetchMore={hasNextPage && !isFetchingNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        placeholder={
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        }
      >
        {posts.map((post) => (
          <ScheduledPostItem key={post.id} post={post} />
        ))}
      </InfiniteScrolling>
    </div>
  );
}
