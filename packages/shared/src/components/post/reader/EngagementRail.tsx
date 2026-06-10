import dynamic from 'next/dynamic';
import type { ReactElement } from 'react';
import React, { useCallback, useContext, useRef } from 'react';
import classNames from 'classnames';
import AuthContext from '../../../contexts/AuthContext';
import type { Post } from '../../../graphql/posts';
import { isVideoPost } from '../../../graphql/posts';
import { SourceType } from '../../../graphql/sources';
import type { SourceTooltip } from '../../../graphql/sources';
import { Origin } from '../../../lib/log';
import EntityCardSkeleton from '../../cards/entity/EntityCardSkeleton';
import FurtherReading from '../../widgets/FurtherReading';
import { PostSidebarAdWidget } from '../PostSidebarAdWidget';
import { PostTagList } from '../tags/PostTagList';
import PostMetadata from '../../cards/common/PostMetadata';
import ShowMoreContent from '../../cards/common/ShowMoreContent';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ArrowIcon } from '../../icons';
import { PostMenuOptions } from '../PostMenuOptions';
import { Tooltip } from '../../tooltip/Tooltip';
import { PostPosition } from '../../../hooks/usePostModalNavigation';
import { SourceStrip } from './SourceStrip';
import { ReaderRailActionBar } from './ReaderRailActionBar';
import { ReaderCloseButton } from './ReaderHeaderActionButtons';
import { PostDiscussionPanel } from '../discovery/PostDiscussionPanel';

const SquadEntityCard = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadEntityCard" */ '../../cards/entity/SquadEntityCard'
    ),
  {
    loading: () => <EntityCardSkeleton />,
  },
);

type EngagementRailProps = {
  post: Post;
  postPosition?: PostPosition;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
  onRegisterFocusComment: (fn: () => void) => void;
  className?: string;
  /**
   * Modal only: when provided, renders a close (X) button on the right side
   * of the rail header next to the three-dots menu.
   */
  onClose?: () => void;
  /**
   * Post page only: drop the sticky rail header entirely and surface the
   * three-dots menu inline next to the source's Follow button so the rail
   * doesn't render a near-empty header bar.
   */
  inlineHeaderMenu?: boolean;
};

export function EngagementRail({
  post,
  postPosition,
  onPreviousPost,
  onNextPost,
  onRegisterFocusComment,
  className,
  onClose,
  inlineHeaderMenu = false,
}: EngagementRailProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const isVideoType = isVideoPost(post);

  // The discussion composer lives inside PostDiscussionPanel; keep a local
  // handle so the summary action bar's "comment" button can focus it too, while
  // still forwarding registration up to the reader's floating action bar.
  const focusCommentRef = useRef<() => void>(() => {});
  const registerFocusComment = useCallback(
    (fn: () => void) => {
      focusCommentRef.current = fn;
      onRegisterFocusComment(fn);
    },
    [onRegisterFocusComment],
  );

  const { source } = post;
  const showNavigation = !!onPreviousPost || !!onNextPost;

  const railHeaderGroupClasses =
    'flex h-9 items-center gap-px rounded-12 border border-border-subtlest-tertiary bg-background-default/70 p-px shadow-3 backdrop-blur-md backdrop-saturate-150';
  const iconButtonClassName = '!h-8 !w-8 !min-w-8 !rounded-10 !p-0';

  return (
    <aside
      id="reader-post-modal-root"
      className={classNames(
        'relative flex min-h-0 flex-col overflow-y-auto overflow-x-hidden bg-background-default',
        className,
      )}
      aria-label="Discussion and related"
    >
      {!inlineHeaderMenu && (
        <div className="bg-background-default/85 sticky top-0 z-[60] flex h-14 items-center justify-between gap-2 px-3 backdrop-blur">
          <div className="flex items-center gap-2">
            {showNavigation && (
              <div
                className={railHeaderGroupClasses}
                aria-label="Post navigation"
              >
                {onPreviousPost && (
                  <Tooltip content="Previous post">
                    <Button
                      icon={<ArrowIcon />}
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Tertiary}
                      type="button"
                      className={classNames('-rotate-90', iconButtonClassName)}
                      onClick={onPreviousPost}
                      disabled={
                        !postPosition ||
                        [PostPosition.First, PostPosition.Only].includes(
                          postPosition,
                        )
                      }
                      aria-label="Previous post"
                    />
                  </Tooltip>
                )}
                {onNextPost && (
                  <Tooltip content="Next post">
                    <Button
                      className={classNames('rotate-90', iconButtonClassName)}
                      icon={<ArrowIcon />}
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Tertiary}
                      type="button"
                      onClick={onNextPost}
                      disabled={
                        !postPosition ||
                        [PostPosition.Last, PostPosition.Only].includes(
                          postPosition,
                        )
                      }
                      aria-label="Next post"
                    />
                  </Tooltip>
                )}
              </div>
            )}
          </div>
          <div className={railHeaderGroupClasses}>
            <PostMenuOptions
              post={post}
              origin={Origin.ReaderModal}
              buttonSize={ButtonSize.Small}
            />
            {onClose && <ReaderCloseButton onClose={onClose} />}
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-4 px-4 pb-6 pt-4">
        {source && (
          <div className="flex min-w-0 items-start gap-1">
            <div className="min-w-0 flex-1">
              {source.type === SourceType.Squad ? (
                <SquadEntityCard
                  className={{ container: 'w-full bg-transparent' }}
                  handle={source.handle}
                  origin={Origin.ReaderModal}
                />
              ) : (
                <SourceStrip source={source as SourceTooltip} />
              )}
            </div>
            {inlineHeaderMenu && (
              <div className="shrink-0">
                <PostMenuOptions
                  post={post}
                  origin={Origin.ReaderModal}
                  buttonSize={ButtonSize.Small}
                />
              </div>
            )}
          </div>
        )}

        <section
          aria-label="Article summary"
          className="flex min-w-0 flex-col gap-2"
        >
          {post.summary && (
            <div className="mb-1 flex min-w-0 flex-col gap-1 text-text-secondary">
              <ShowMoreContent
                className={{
                  wrapper: 'overflow-hidden',
                  text: 'leading-9 typo-callout',
                }}
                content={post.summary}
                charactersLimit={330}
                threshold={50}
              />
            </div>
          )}
          <PostTagList post={post} />
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            isVideoType={isVideoType}
            className="!mt-0 !typo-callout"
          />
          <ReaderRailActionBar
            post={post}
            onCommentClick={() => focusCommentRef.current()}
            className="mt-1"
          />
        </section>

        <PostDiscussionPanel
          post={post}
          origin={Origin.ReaderModal}
          className="border-t border-border-subtlest-tertiary pt-4"
          onRegisterFocusComment={registerFocusComment}
          modalParentSelector={() =>
            document.getElementById('reader-post-modal-root') ?? document.body
          }
        />

        <PostSidebarAdWidget
          postId={post.id}
          className={{ container: 'w-full bg-transparent' }}
        />

        {tokenRefreshed && (
          <section
            aria-label="You might also like"
            className="min-w-0 border-t border-border-subtlest-tertiary pt-3"
          >
            <FurtherReading currentPost={post} />
          </section>
        )}
      </div>
    </aside>
  );
}
