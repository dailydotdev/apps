import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { useBlockPost } from '../../../hooks/post/useBlockPost';
import { Post } from '../../../graphql/posts';
import { isNullOrUndefined } from '../../../lib/func';
import { PostBlockedPanel } from './PostBlockedPanel';
import CloseButton from '../../CloseButton';
import { Button, ButtonSize } from '../../buttons/Button';
import { SourceAvatar } from '../../profile/source';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { BlockTagSelection } from './common';

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
  const [shouldBlockSource, setShouldBlockSource] = useState(() =>
    feedSettings?.excludeSources?.some(({ id }) => id === post.source.id),
  );
  const [tags, setTags] = useState<BlockTagSelection>(() =>
    feedSettings?.blockedTags?.reduce(
      (block, tag) => ({ ...block, [tag]: true }),
      {},
    ),
  );
  const {
    data: { showTagsPanel, blocked },
    blockedTags,
    onClose,
    onBlock,
    onReport,
    onUndo,
    onDismissPermanently,
  } = useBlockPost(post, { toastOnSuccess });

  if (post.tags.length === 0 || isNullOrUndefined(showTagsPanel)) return null;

  if (!showTagsPanel) {
    if (toastOnSuccess) return null;

    return (
      <PostBlockedPanel
        className="mt-6"
        blocked={blocked}
        onActionClick={
          blockedTags === 0 && !blocked?.sourceIncluded
            ? onDismissPermanently
            : onUndo
        }
      />
    );
  }

  return (
    <div
      className={classNames(
        'flex relative flex-col border border-theme-divider-tertiary rounded-16 p-4 pb-0',
        className,
      )}
    >
      <CloseButton
        className="top-3 right-3"
        position="absolute"
        onClick={() => onClose()}
      />
      <h4 className="font-bold typo-body">Don&apos;t show me posts from...</h4>
      <p className="mt-1 typo-callout text-theme-label-tertiary">
        Pick all the topics you are not interested to see on your feed
      </p>
      <span className="flex flex-row flex-wrap gap-2 mt-4">
        <Button
          className={shouldBlockSource ? 'btn-primary' : 'btn-tertiaryFloat'}
          buttonSize={ButtonSize.Small}
          icon={<SourceAvatar source={post.source} />}
          onClick={() => setShouldBlockSource(!shouldBlockSource)}
        >
          {post.source.name}
        </Button>
        {post.tags.map((tag) => (
          <Button
            key={tag}
            className={tags[tag] ? 'btn-primary' : 'btn-tertiaryFloat'}
            buttonSize={ButtonSize.Small}
            onClick={() => setTags({ ...tags, [tag]: !tags[tag] })}
          >
            #{tag}
          </Button>
        ))}
      </span>
      <span className="flex flex-row gap-2 p-3 -mx-4 mt-4 border-t border-theme-divider-tertiary">
        <Button className="ml-auto btn-tertiary" onClick={onReport}>
          Report
        </Button>
        <Button
          className="btn-primary-cabbage"
          onClick={() => onBlock(tags, shouldBlockSource)}
        >
          Block
        </Button>
      </span>
    </div>
  );
}
