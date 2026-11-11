import type { MouseEvent, ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { FeedItem, UpdateFeedPost } from '../../hooks/useFeed';
import { isBoostedPostAd } from '../../hooks/useFeed';
import { FeedItemType } from '../../components/cards/common/common';
import { usePostModalNavigation } from '../../hooks/usePostModalNavigation';
import { useFeedLayout } from '../../hooks/useFeedLayout';
import { useReaderModalEligibility } from '../../components/post/reader/hooks/useReaderModalEligibility';
import { PostModalMap } from '../../components/modals/PostModalMap';

const readerEligiblePostTypes = new Set<PostType>([
  PostType.Article,
  PostType.Digest,
  PostType.VideoYouTube,
]);

const noop = (): void => undefined;
const noFetch = (): Promise<void> => Promise.resolve();

const isModifiedClick = (event?: MouseEvent): boolean =>
  !!event &&
  (event.button === 1 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey);

const itemPost = (item: FeedItem): Post | undefined => {
  if (item.type === FeedItemType.Post) {
    return item.post;
  }

  return isBoostedPostAd(item) ? item.ad.data.post : undefined;
};

/**
 * Opens a widget's post in the post modal, the way a card in the feed does:
 * the URL becomes the post's while the feed stays underneath, and closing it
 * brings the reader back to the same scroll position. The widget's posts (or
 * boosted post ads) stand in for the feed, under `feedName`: the modal's own
 * name, so the feed under the rail never claims it. Where the feed itself
 * would not open a modal (the list layout, for posts the reader modal does
 * not take), the post page opens instead.
 */
export const useFeedWidgetPostModal = ({
  items,
  feedName,
  updatePost = noop,
}: {
  items: FeedItem[];
  feedName: string;
  /** Where a post's read state lands; the navigation marks shares read. */
  updatePost?: UpdateFeedPost;
}): {
  /** Opens the modal; false when the caller should navigate instead. */
  openPost: (post: Post, event?: MouseEvent) => boolean;
  modal: ReactElement | null;
} => {
  const { shouldUseListFeedLayout } = useFeedLayout();
  const { isReaderEnabled } = useReaderModalEligibility();
  const {
    onOpenModal,
    onCloseModal,
    onPrevious,
    onNext,
    postPosition,
    selectedPost,
  } = usePostModalNavigation({
    items,
    fetchPage: noFetch,
    updatePost,
    canFetchMore: false,
    feedName,
  });

  const canOpenModal = useCallback(
    (target: Post) =>
      !!PostModalMap[target.type] &&
      (!shouldUseListFeedLayout ||
        (isReaderEnabled && readerEligiblePostTypes.has(target.type))),
    [isReaderEnabled, shouldUseListFeedLayout],
  );

  const openPost = useCallback(
    (target: Post, event?: MouseEvent) => {
      if (isModifiedClick(event) || !canOpenModal(target)) {
        return false;
      }
      const index = items.findIndex((item) => itemPost(item)?.id === target.id);
      if (index === -1) {
        return false;
      }
      event?.preventDefault();
      document.body.classList.add('hidden-scrollbar');
      onOpenModal(index);
      return true;
    },
    [canOpenModal, items, onOpenModal],
  );

  useEffect(() => {
    if (!selectedPost) {
      document.body.classList.remove('hidden-scrollbar');
    }
  }, [selectedPost]);

  useEffect(() => () => document.body.classList.remove('hidden-scrollbar'), []);

  const PostModal = selectedPost ? PostModalMap[selectedPost.type] : undefined;
  const modal =
    selectedPost && PostModal && canOpenModal(selectedPost) ? (
      <PostModal
        isOpen
        id={selectedPost.id}
        onRequestClose={() => onCloseModal(false)}
        onPreviousPost={onPrevious}
        onNextPost={onNext}
        postPosition={postPosition}
        post={selectedPost}
      />
    ) : null;

  return { openPost, modal };
};
