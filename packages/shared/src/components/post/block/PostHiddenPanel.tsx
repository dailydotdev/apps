import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useHidePost } from '../../../hooks/post/useHidePost';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import useTagAndSource from '../../../hooks/useTagAndSource';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useCustomFeed } from '../../../hooks/feed/useCustomFeed';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import CloseButton from '../../CloseButton';
import { BlockIcon, FlagIcon } from '../../icons';
import { IconSize } from '../../Icon';
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
    aria-label={ariaLabel}
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-12 px-3 py-2.5 text-left text-text-primary typo-callout hover:bg-surface-float"
  >
    {icon}
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
  const { onClose } = useBlockPostPanel(post);
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
    onClose(true);
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

  const iconClassName = 'text-text-tertiary';

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 border border-border-subtlest-tertiary p-4',
        className,
      )}
    >
      <CloseButton
        type="button"
        className="absolute right-3 top-3"
        onClick={() => onConfirmDismiss('done')}
        size={ButtonSize.Small}
      />
      <h4 className="pr-8 font-bold typo-body">
        Got it. You&apos;ll see less like this.
      </h4>
      <p className="mt-1 text-text-tertiary typo-callout">Take it further:</p>
      <div className="mt-3 flex flex-1 flex-col gap-1 overflow-auto">
        {!isSourceAlreadyBlocked && (
          <ActionRow
            icon={<BlockIcon size={IconSize.Small} className={iconClassName} />}
            label={<>Unfollow {source.name}</>}
            onClick={handleUnfollowSource}
            ariaLabel={`Unfollow ${source.name}`}
          />
        )}
        {blockableTags.map((tag) => (
          <ActionRow
            key={tag}
            icon={<BlockIcon size={IconSize.Small} className={iconClassName} />}
            label={`Block #${tag}`}
            onClick={() => handleBlockTag(tag)}
            ariaLabel={`Block ${tag}`}
          />
        ))}
        <ActionRow
          icon={<FlagIcon size={IconSize.Small} className={iconClassName} />}
          label="Report this post"
          onClick={handleReport}
          ariaLabel="Report this post"
        />
      </div>
      <div className="mt-3 flex border-t border-border-subtlest-tertiary pt-3">
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
