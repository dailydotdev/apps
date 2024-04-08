import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { Post } from '../../../graphql/posts';
import { isNullOrUndefined } from '../../../lib/func';
import { PostBlockedPanel } from './PostBlockedPanel';
import CloseButton from '../../CloseButton';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { SourceAvatar } from '../../profile/source';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { BlockTagSelection, getBlockedMessage } from './common';
import { GenericTagButton } from '../../filters/TagButton';

interface PostTagsPanelProps {
  post: Post;
  className?: string;
  toastOnSuccess?: boolean;
}

export function PostTagsPanel({
  post,
  className,
  toastOnSuccess = true,
}: PostTagsPanelProps): ReactElement {
  const { feedSettings } = useFeedSettings();
  const hasBlockedSource = () =>
    feedSettings?.excludeSources?.some(({ id }) => id === post.source.id);
  const [initialPreference] = useState(hasBlockedSource);
  const [shouldBlockSource, setShouldBlockSource] = useState(hasBlockedSource);
  const [tags, setTags] = useState<BlockTagSelection>(
    () =>
      feedSettings?.blockedTags?.reduce(
        (block, tag) => ({ ...block, [tag]: post?.tags.includes(tag) }),
        {},
      ) ?? {},
  );
  const {
    data: { showTagsPanel, blocked },
    blockedTags,
    onClose,
    onBlock,
    onReport,
    onUndo,
    onDismissPermanently,
  } = useBlockPostPanel(post, {
    toastOnSuccess,
    blockedSource: initialPreference,
  });

  if (post.tags.length === 0 || isNullOrUndefined(showTagsPanel)) {
    return null;
  }

  if (!showTagsPanel) {
    if (toastOnSuccess) {
      return null;
    }

    const sourcePreferenceChanged =
      initialPreference !== blocked?.sourceIncluded;
    const noAction = blockedTags === 0 && !sourcePreferenceChanged;

    return (
      <PostBlockedPanel
        className="mt-6"
        onActionClick={noAction ? onDismissPermanently : onUndo}
        message={getBlockedMessage(blockedTags, sourcePreferenceChanged)}
        ctaCopy={noAction ? `Don't ask again` : 'Undo'}
      />
    );
  }

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 border border-border-subtlest-tertiary p-4 pb-0',
        className,
      )}
    >
      <CloseButton
        className="absolute right-3 top-3"
        onClick={() => onClose()}
        size={ButtonSize.Small}
      />
      <h4 className="font-bold typo-body">Don&apos;t show me posts from...</h4>
      <p className="mt-1 text-text-tertiary typo-callout">
        Pick all the topics you are not interested to see on your feed
      </p>
      <span
        className="mt-4 flex flex-1 flex-row flex-wrap content-start gap-2 overflow-auto"
        role="list"
      >
        <Button
          variant={
            shouldBlockSource ? ButtonVariant.Primary : ButtonVariant.Float
          }
          size={ButtonSize.Small}
          icon={<SourceAvatar source={post.source} />}
          onClick={() => setShouldBlockSource(!shouldBlockSource)}
        >
          {post.source.name}
        </Button>
        {post.tags.map((tag) => (
          <GenericTagButton
            key={tag}
            role="listitem"
            variant={tags[tag] ? ButtonVariant.Primary : ButtonVariant.Float}
            action={() => setTags({ ...tags, [tag]: !tags[tag] })}
            tagItem={tag}
            data-testid="blockTagButton"
          />
        ))}
      </span>
      <span className="-mx-4 mt-4 flex flex-row gap-2 border-t border-border-subtlest-tertiary p-3">
        <Button
          className="ml-auto"
          variant={ButtonVariant.Tertiary}
          onClick={onReport}
        >
          Report
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          onClick={() => onBlock(tags, shouldBlockSource)}
        >
          Block
        </Button>
      </span>
    </div>
  );
}
