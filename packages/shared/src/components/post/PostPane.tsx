import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePostById } from '../../hooks/usePostById';
import type { PostOrigin } from '../../hooks/log/useLogContextData';
import type { Post } from '../../graphql/posts';
import { ActivePostContextProvider } from '../../contexts/ActivePostContext';
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
import { POST_CONTENT_MAP } from './postContentMap';

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

export interface PostPaneUnavailable {
  title?: string;
  description: string;
  action?: { label: string; onClick: () => unknown };
}

export interface PostPaneProps {
  postId?: string;
  /** The list beside the pane is still loading, so there is no post yet. */
  isLoading?: boolean;
  emptyLabel?: string;
  /** Names the pane while the post is on its way. */
  fallbackTitle?: string;
  origin: PostOrigin;
  /** What to say, and offer, when the post is gone or out of reach. */
  unavailable: PostPaneUnavailable;
  /** The loaded post, on every change, so the list row can follow it. */
  onPostChange?: (post: Post) => void;
}

/**
 * A post page beside a list: the selected post, rendered by the post page's
 * own component for its type in its tablet layout, so the widgets follow the
 * post instead of squeezing beside it.
 */
export function PostPane({
  postId: id,
  isLoading: isListLoading = false,
  emptyLabel = 'Pick a post on the left to read it here.',
  fallbackTitle,
  origin,
  unavailable,
  onPostChange,
}: PostPaneProps): ReactElement {
  const queryClient = useQueryClient();
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

  // The post cache hands out a new object on every change made in the pane.
  useEffect(() => {
    if (post?.id) {
      onPostChange?.(post);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

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
  const title = post?.title || post?.sharedPost?.title || fallbackTitle;

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
              : unavailable.title ?? 'This post is no longer available'
          }
          description={unavailable.description}
          action={unavailable.action}
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
          origin={origin}
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
