import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { Typography, TypographyType } from '../../typography/Typography';
import type { Post } from '../../../graphql/posts';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  ButtonColor,
} from '../../buttons/Button';
import { SourceAvatar } from '../../profile/source';
import { GenericTagButton } from '../../filters/TagButton';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useCustomFeed } from '../../../hooks/feed/useCustomFeed';
import type { BlockTagSelection } from '../block/common';
import useTagAndSource from '../../../hooks/useTagAndSource';
import { Origin } from '../../../lib/log';

type InteractiveFeedTagOverlayProps = {
  post: Post;
  onClose: () => void;
};

const InteractiveFeedTagOverlay = ({
  post,
  onClose,
}: InteractiveFeedTagOverlayProps): ReactElement => {
  const { feedId: customFeedId } = useCustomFeed();
  const { feedSettings } = useFeedSettings({
    feedId: customFeedId,
  });
  const { onBlockTags, onBlockSource } = useTagAndSource({
    origin: Origin.TagsFilter,
    postId: post?.id,
    shouldInvalidateQueries: true,
    feedId: customFeedId,
  });

  const hasBlockedSource = () =>
    feedSettings?.excludeSources?.some(({ id }) => id === post.source.id);
  const [shouldBlockSource, setShouldBlockSource] = useState(hasBlockedSource);
  const [tags, setTags] = useState<BlockTagSelection>(
    () =>
      feedSettings?.blockedTags?.reduce(
        (block, tag) => ({ ...block, [tag]: post?.tags.includes(tag) }),
        {},
      ) ?? {},
  );

  const handleSubmit = async () => {
    const blockedTags = Object.entries(tags)
      .filter(([, shouldBlock]) => shouldBlock)
      .map(([tag]) => tag);

    if (blockedTags.length > 0) {
      await onBlockTags({ tags: blockedTags });
    }

    if (shouldBlockSource) {
      await onBlockSource({ source: post.source });
    }

    onClose();
  };

  const isBlockDisabled =
    Object.values(tags).every((tag) => !tag) && !shouldBlockSource;

  return (
    <div className="relative flex flex-col rounded-16 border border-status-error p-4 pb-0">
      <Typography type={TypographyType.Callout} bold>
        Don&apos;t show me posts from...
      </Typography>
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
      <span className="-mx-4 mt-4 flex flex-row gap-2 p-3">
        <Button
          className="flex-1"
          variant={ButtonVariant.Secondary}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Ketchup}
          onClick={handleSubmit}
          disabled={isBlockDisabled}
        >
          Submit
        </Button>
      </span>
    </div>
  );
};

export default InteractiveFeedTagOverlay;
