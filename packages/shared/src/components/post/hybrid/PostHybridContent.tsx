import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import usePostContent from '../../../hooks/usePostContent';
import { useTrackPostView } from '../../../hooks/post/useTrackPostView';
import type { PostWidgetsProps } from '../PostWidgets';
import { PostWidgets } from '../PostWidgets';
import { SquadPostWidgets } from '../SquadPostWidgets';
import { CollectionPostWidgets } from '../collection/CollectionPostWidgets';
import { withPostById } from '../withPostById';
import type { PostHybridColumnProps } from './PostHybridColumn';
import { PostHybridColumn } from './PostHybridColumn';

const squadWidgetTypes = [
  PostType.Share,
  PostType.Freeform,
  PostType.Poll,
  PostType.SocialTwitter,
];

const getWidgets = (post: Post) => {
  if (post.type === PostType.Collection) {
    return CollectionPostWidgets;
  }

  return squadWidgetTypes.includes(post.type) ? SquadPostWidgets : PostWidgets;
};

export type PostHybridContentProps = Omit<
  PostHybridColumnProps,
  'onReadArticle' | 'onCopyPostLink' | 'onClose'
> & {
  onClose?: PostWidgetsProps['onClose'];
  getRailAd?: PostWidgetsProps['getRailAd'];
  shouldTrackView?: boolean;
  className?: string;
};

/**
 * The post_page_hybrid layout: the reading column in a bordered card beside
 * a 320px rail of the post type's production widgets, the frame the profile
 * and Squad pages use. Below laptop the rail stacks under the thread. In the
 * modal the card is the modal itself, so the column and rail split it with a
 * divider instead.
 */
function PostHybridContentRaw({
  post,
  origin,
  isModal = false,
  onClose,
  getRailAd,
  shouldTrackView,
  className,
  ...columnProps
}: PostHybridContentProps): ReactElement {
  const { onReadArticle, onCopyPostLink } = usePostContent({ origin, post });
  const Widgets = getWidgets(post);

  useTrackPostView({ post, shouldTrack: shouldTrackView });

  return (
    <div
      className={classNames(
        'flex w-full flex-col laptop:flex-row',
        !isModal &&
          'mx-auto laptop:max-w-5xl laptop:gap-4 laptop:p-4 laptopL:max-w-6xl',
        className,
      )}
    >
      <div
        className={classNames(
          'flex min-w-0 flex-1 flex-col bg-background-default',
          !isModal &&
            'border-border-subtlest-tertiary laptop:rounded-16 laptop:border',
        )}
      >
        <PostHybridColumn
          {...columnProps}
          post={post}
          origin={origin}
          isModal={isModal}
          onClose={
            onClose ? () => (onClose as (event?: unknown) => void)() : undefined
          }
          onReadArticle={onReadArticle}
          onCopyPostLink={onCopyPostLink}
        />
      </div>
      <Widgets
        post={post}
        origin={origin}
        onClose={onClose}
        onReadArticle={onReadArticle}
        onCopyPostLink={onCopyPostLink}
        getRailAd={getRailAd}
        isHybrid
        className={classNames(
          '!gap-4 border-t border-border-subtlest-tertiary py-6 laptop:!w-80 laptop:!max-w-none laptop:shrink-0',
          isModal
            ? 'laptop:border-l laptop:border-t-0'
            : 'laptop:border-0 laptop:!p-0',
        )}
      />
    </div>
  );
}

export const PostHybridContent = withPostById(PostHybridContentRaw);
