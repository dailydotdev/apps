import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useHidePost } from '../../../hooks/post/useHidePost';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import useTagAndSource from '../../../hooks/useTagAndSource';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useCustomFeed } from '../../../hooks/feed/useCustomFeed';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import CloseButton from '../../CloseButton';
import { SourceAvatar } from '../../profile/source';
import { GenericTagButton } from '../../filters/TagButton';
import { Origin } from '../../../lib/log';
import type { BlockTagSelection } from './common';

interface PostHiddenPanelProps {
  post: Post;
  className?: string;
}

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

  const [shouldBlockSource, setShouldBlockSource] = useState<boolean>(
    isSourceAlreadyBlocked,
  );
  const [tags, setTags] = useState<BlockTagSelection>(() =>
    (post.tags ?? []).reduce<BlockTagSelection>(
      (acc, tag) => ({ ...acc, [tag]: false }),
      {},
    ),
  );

  const { onUnhide, onConfirmDismiss } = useHidePost({ post });
  const { onClose } = useBlockPostPanel(post);
  const { onBlockTags, onBlockSource } = useTagAndSource({
    origin: Origin.PostContextMenu,
    postId: post.id,
    shouldInvalidateQueries: false,
    feedId: customFeedId,
  });
  const { openModal } = useLazyModal();

  const selectedTags = Object.entries(tags)
    .filter(([, selected]) => selected)
    .map(([tag]) => tag);
  const willBlockSource = shouldBlockSource && !isSourceAlreadyBlocked;

  const handleDone = async () => {
    if (selectedTags.length > 0) {
      await onBlockTags({ tags: selectedTags, requireLogin: true });
    }

    if (willBlockSource) {
      await onBlockSource({ source, requireLogin: true });
    }

    if (willBlockSource) {
      onConfirmDismiss('unfollow');
      return;
    }

    if (selectedTags.length > 0) {
      onConfirmDismiss('block');
      return;
    }

    onConfirmDismiss('done');
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

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 border border-border-subtlest-tertiary p-4 pb-0',
        className,
      )}
    >
      <CloseButton
        type="button"
        className="absolute right-3 top-3"
        onClick={() => onConfirmDismiss('done')}
        size={ButtonSize.Small}
      />
      <h4 className="font-bold typo-body">Post hidden in your feed</h4>
      <p className="mt-1 text-text-tertiary typo-callout">
        Help us improve. Tell us what didn&apos;t work for you (optional).
      </p>
      <span
        className="mt-4 flex flex-1 flex-row flex-wrap content-start gap-2 overflow-auto"
        role="list"
      >
        {!isSourceAlreadyBlocked && (
          <Button
            type="button"
            variant={
              shouldBlockSource ? ButtonVariant.Primary : ButtonVariant.Float
            }
            size={ButtonSize.Small}
            icon={<SourceAvatar source={source} />}
            onClick={() => setShouldBlockSource(!shouldBlockSource)}
          >
            Unfollow {source.name}
          </Button>
        )}
        {(post.tags ?? []).map((tag) => (
          <GenericTagButton
            key={tag}
            role="listitem"
            variant={tags[tag] ? ButtonVariant.Primary : ButtonVariant.Float}
            action={() => setTags({ ...tags, [tag]: !tags[tag] })}
            tagItem={tag}
            data-testid="hideBlockTagButton"
          />
        ))}
      </span>
      <span className="-mx-4 mt-4 flex flex-row gap-2 border-t border-border-subtlest-tertiary p-3">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          onClick={handleReport}
        >
          Report
        </Button>
        <Button
          type="button"
          className="ml-auto"
          variant={ButtonVariant.Tertiary}
          onClick={onUnhide}
        >
          Undo
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          onClick={handleDone}
        >
          Done
        </Button>
      </span>
    </div>
  );
}
