import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePostById } from '../../hooks/usePostById';
import type { PostItem } from '../../graphql/posts';
import { ActivePostContextProvider } from '../../contexts/ActivePostContext';
import { Origin } from '../../lib/log';
import { getPostByIdKey } from '../../lib/query';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError, getApiError } from '../../graphql/common';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';
import { cloudinaryCharmSomethingWentWrong } from '../../lib/image';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { BodyTextPlaceholder, TextPlaceholder } from '../widgets/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { updateReadingHistoryPost } from '../../hooks/useReadingHistory';
import { POST_CONTENT_MAP } from '../post/postContentMap';

// Showing a post is not reading it: the read is only counted once the reader
// scrolls into the post or clicks inside it.
const READ_SCROLL_OFFSET = 120;

const PaneSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-4 p-6" aria-busy>
    <TextPlaceholder className="w-24" />
    <ElementPlaceholder className="h-8 w-3/4 rounded-12" />
    <BodyTextPlaceholder className="w-full" />
    <BodyTextPlaceholder className="w-5/6" />
    <BodyTextPlaceholder className="w-2/3" />
    <ElementPlaceholder className="mt-2 aspect-video w-full max-w-[32rem] rounded-16" />
  </div>
);

interface ReadingHistoryPostPaneProps {
  item?: PostItem;
  postId?: string;
  isLoading?: boolean;
  emptyLabel?: string;
  onHide?: () => unknown;
}

export function ReadingHistoryPostPane({
  item,
  postId,
  isLoading: isListLoading = false,
  emptyLabel = 'Pick a post on the left to read it here.',
  onHide,
}: ReadingHistoryPostPaneProps): ReactElement {
  const id = postId ?? item?.post.id;
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { post, isError, isLoading } = usePostById({
    id: id ?? '',
    options: { retry: false },
  });
  const loadedPostId = post?.id;
  const [readPostId, setReadPostId] = useState<string>();
  const isRead = !!id && readPostId === id;
  const markAsRead = () => {
    if (id && !isRead && loadedPostId === id) {
      setReadPostId(id);
    }
  };

  useEffect(() => {
    if (!id || isRead || loadedPostId !== id) {
      return undefined;
    }

    const onScroll = () => {
      if (window.scrollY > READ_SCROLL_OFFSET) {
        setReadPostId(id);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [id, isRead, loadedPostId]);

  // Votes and bookmarks made on the post reach its row.
  const vote = post?.userState?.vote;
  const bookmarked = post?.bookmarked;
  const numUpvotes = post?.numUpvotes;
  useEffect(() => {
    if (!post?.id) {
      return;
    }

    updateReadingHistoryPost(queryClient, user, post.id, (current) => ({
      bookmarked: bookmarked ?? current.bookmarked,
      numUpvotes: numUpvotes ?? current.numUpvotes,
      userState:
        current.userState && vote !== undefined
          ? { ...current.userState, vote }
          : current.userState,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id, vote, bookmarked, numUpvotes]);

  const error = isError
    ? (queryClient.getQueryState(getPostByIdKey(id ?? ''))
        ?.error as unknown as ApiErrorResult)
    : undefined;
  const isForbidden = !!error && !!getApiError(error, ApiError.Forbidden);
  const isGone =
    isForbidden || (!!error && !!getApiError(error, ApiError.NotFound));
  const Content = post?.type ? POST_CONTENT_MAP[post.type] : undefined;
  const isUnavailable = isGone || (!!post && !Content);
  const isFailed = !!error && !isGone && !post;
  const title = post?.title || post?.sharedPost?.title || item?.post.title;

  const renderBody = () => {
    if (!id) {
      return isListLoading ? (
        <PaneSkeleton />
      ) : (
        <p className="m-auto px-6 text-center text-text-tertiary typo-callout">
          {emptyLabel}
        </p>
      );
    }

    if (isFailed) {
      return (
        <CharmEmptyState
          placement={CharmEmptyStatePlacement.Inline}
          className="my-auto"
          image={cloudinaryCharmSomethingWentWrong}
          imageAlt="daily.dev charm with something gone wrong"
          title="We couldn't load this post"
          description="Check your connection and try again."
          action={{
            label: 'Try again',
            onClick: () =>
              queryClient.refetchQueries({ queryKey: getPostByIdKey(id) }),
          }}
        />
      );
    }

    if (isUnavailable) {
      return (
        <CharmEmptyState
          placement={CharmEmptyStatePlacement.Inline}
          className="my-auto"
          image={cloudinaryCharmSomethingWentWrong}
          imageAlt="daily.dev charm looking for a post that isn't there"
          title={
            isForbidden
              ? 'You no longer have access to this post'
              : 'This post is no longer available'
          }
          description="It stays in your history until you remove it."
          action={
            onHide
              ? { label: 'Remove from history', onClick: () => onHide() }
              : undefined
          }
        />
      );
    }

    if (isLoading || !post || !Content) {
      return <PaneSkeleton />;
    }

    return (
      <ActivePostContextProvider post={post}>
        <Content
          key={post.id}
          post={post}
          isPostPage
          origin={Origin.History}
          shouldTrackView={isRead}
          className={{
            // The post page's tablet layout: the card is narrower than a
            // laptop page, so the widgets follow the post instead of
            // standing beside it.
            container:
              '!m-0 !max-w-none flex-1 laptop:!flex-col laptop:!border-x-0 [&>aside]:!border-l-0 laptop:[&>aside]:!w-full laptop:[&>aside]:!max-w-full',
            content: 'laptop:!border-r-0 laptop:!px-6',
            fixedNavigation: { container: 'hidden' },
            navigation: {
              container: 'flex tablet:hidden',
              actions: 'flex-1 justify-between',
            },
          }}
        />
      </ActivePostContextProvider>
    );
  };

  return (
    <section
      aria-label={title ? `Selected post: ${title}` : 'Selected post'}
      onPointerDown={markAsRead}
      onWheel={markAsRead}
      className="relative flex min-h-[calc(100vh-var(--sticky-header-offset,0px)-2.5rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary"
    >
      {renderBody()}
    </section>
  );
}
