import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useHidePost } from '../../../hooks/post/useHidePost';
import useTagAndSource from '../../../hooks/useTagAndSource';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useCustomFeed } from '../../../hooks/feed/useCustomFeed';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import CloseButton from '../../CloseButton';
import { FlagIcon, HashtagIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { SourceAvatar } from '../../profile/source';
import { ProfileImageSize } from '../../ProfilePicture';
import { Origin } from '../../../lib/log';

interface PostHiddenPanelProps {
  post: Post;
  className?: string;
}

interface ActionRowProps {
  icon: ReactNode;
  label: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
}

const ActionRow = ({
  icon,
  label,
  onClick,
  ariaLabel,
}: ActionRowProps): ReactElement => (
  <button
    type="button"
    role="menuitem"
    aria-label={ariaLabel}
    onClick={onClick}
    className="flex h-9 w-full items-center gap-3 rounded-12 px-3 text-left text-text-tertiary typo-callout hover:bg-surface-hover"
  >
    <span className="flex size-6 shrink-0 items-center justify-center">
      {icon}
    </span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
  </button>
);

export function PostHiddenPanel({
  post,
  className,
}: PostHiddenPanelProps): ReactElement {
  const { feedId: customFeedId } = useCustomFeed();
  const { feedSettings } = useFeedSettings({ feedId: customFeedId });
  const { source } = post;
  if (!source) {
    throw new Error('PostHiddenPanel requires post.source');
  }
  const isSourceAlreadyBlocked =
    feedSettings?.excludeSources?.some(({ id }) => id === source.id) ?? false;

  const { onUnhide, onConfirmDismiss } = useHidePost({ post });
  const { onBlockTags, onBlockSource } = useTagAndSource({
    origin: Origin.PostContextMenu,
    postId: post.id,
    shouldInvalidateQueries: false,
    feedId: customFeedId,
  });
  const { openModal } = useLazyModal();

  const blockableTags = (post.tags ?? []).filter(
    (tag) => !(feedSettings?.blockedTags ?? []).includes(tag),
  );

  const handleUnfollowSource = async () => {
    await onBlockSource({ source, requireLogin: true });
    onConfirmDismiss('unfollow');
  };

  const handleBlockTag = async (tag: string) => {
    await onBlockTags({ tags: [tag], requireLogin: true });
    onConfirmDismiss('block');
  };

  const handleReport = () => {
    openModal({
      type: LazyModal.ReportPost,
      props: {
        post,
        origin: Origin.PostContextMenu,
        onReported: () => {
          onConfirmDismiss('report');
        },
      },
    });
  };

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 border border-border-subtlest-tertiary p-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <h4 className="font-bold text-text-primary typo-callout">
            Got it. You&apos;ll see less like this.
          </h4>
          <p className="text-text-tertiary typo-footnote">Take it further:</p>
        </div>
        <CloseButton
          type="button"
          onClick={() => onConfirmDismiss('done')}
          size={ButtonSize.XSmall}
        />
      </div>
      <div role="menu" className="mt-2 flex flex-1 flex-col overflow-auto py-1">
        {!isSourceAlreadyBlocked && (
          <ActionRow
            icon={
              <SourceAvatar source={source} size={ProfileImageSize.Small} />
            }
            label={<>Don&apos;t show posts from {source.name}</>}
            onClick={handleUnfollowSource}
            ariaLabel={`Don't show posts from ${source.name}`}
          />
        )}
        {blockableTags.map((tag) => (
          <ActionRow
            key={tag}
            icon={<HashtagIcon size={IconSize.Small} />}
            label={`Block #${tag}`}
            onClick={() => handleBlockTag(tag)}
            ariaLabel={`Block ${tag}`}
          />
        ))}
        <ActionRow
          icon={<FlagIcon size={IconSize.Small} />}
          label="Report"
          onClick={handleReport}
          ariaLabel="Report"
        />
      </div>
      <div className="mt-2 flex border-t border-border-subtlest-tertiary pt-2">
        <Button
          type="button"
          className="ml-auto"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onUnhide}
        >
          Undo
        </Button>
      </div>
    </div>
  );
}
