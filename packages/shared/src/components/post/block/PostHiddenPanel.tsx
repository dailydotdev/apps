import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useHidePost } from '../../../hooks/post/useHidePost';
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

  const blockableTags = useMemo(
    () =>
      (post.tags ?? []).filter(
        (tag) => !(feedSettings?.blockedTags ?? []).includes(tag),
      ),
    [post.tags, feedSettings?.blockedTags],
  );

  const [shouldBlockSource, setShouldBlockSource] = useState(false);
  const [tagSelection, setTagSelection] = useState<Record<string, boolean>>(
    () =>
      blockableTags.reduce<Record<string, boolean>>(
        (acc, tag) => ({ ...acc, [tag]: false }),
        {},
      ),
  );
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { onUnhide, onSubmitFeedback, onDismiss, onReportSubmitted } =
    useHidePost({ post });
  const { openModal } = useLazyModal();

  const selectedTags = Object.entries(tagSelection)
    .filter(([, selected]) => selected)
    .map(([tag]) => tag);
  const hasSelection = shouldBlockSource || selectedTags.length > 0;

  const handleSubmit = async () => {
    const { removed } = await onSubmitFeedback({
      tags: selectedTags,
      blockSource: shouldBlockSource,
    });

    if (!removed) {
      setIsConfirmed(true);
    }
  };

  const handleReport = () => {
    openModal({
      type: LazyModal.ReportPost,
      props: {
        post,
        origin: Origin.PostContextMenu,
        onReported: () => {
          onReportSubmitted();
        },
      },
    });
  };

  if (isConfirmed) {
    return (
      <div
        className={classNames(
          'flex h-full w-full flex-col items-center justify-center gap-3 px-6 py-8 text-center',
          className,
        )}
        data-testid="postHiddenPanelConfirmed"
      >
        <h4 className="font-bold text-text-primary typo-callout">
          Thanks for your feedback
        </h4>
        <p className="text-text-tertiary typo-footnote">
          We&apos;ll show fewer posts like this.
        </p>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onUnhide}
        >
          Undo
        </Button>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'relative flex h-full w-full flex-col p-4 pb-0',
        className,
      )}
    >
      <CloseButton
        type="button"
        data-testid="postHiddenPanelClose"
        className="absolute right-3 top-3"
        onClick={onDismiss}
        size={ButtonSize.Small}
      />
      <h4 className="font-bold text-text-primary typo-body">
        Got it. You&apos;ll see less like this.
      </h4>
      <p className="mt-1 text-text-tertiary typo-callout">
        Pick anything else you want out of your feed (optional)
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
            onClick={() => setShouldBlockSource((prev) => !prev)}
            data-testid="hideBlockSourceButton"
            aria-pressed={shouldBlockSource}
          >
            Unfollow {source.name}
          </Button>
        )}
        {blockableTags.map((tag) => (
          <GenericTagButton
            key={tag}
            role="listitem"
            variant={
              tagSelection[tag] ? ButtonVariant.Primary : ButtonVariant.Float
            }
            action={() =>
              setTagSelection((prev) => ({ ...prev, [tag]: !prev[tag] }))
            }
            tagItem={tag}
            data-testid="hideBlockTagButton"
          />
        ))}
      </span>
      <span className="-mx-4 mt-4 flex flex-row flex-wrap items-center gap-2 border-t border-border-subtlest-tertiary p-3">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={handleReport}
        >
          Report
        </Button>
        <Button
          type="button"
          className="ml-auto"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onUnhide}
        >
          Undo
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Small}
          onClick={handleSubmit}
          disabled={!hasSelection}
          data-testid="postHiddenPanelDone"
        >
          Done
        </Button>
      </span>
    </div>
  );
}
