import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { ArticleGrid } from '../../../components/cards/article/ArticleGrid';
import { FreeformGrid } from '../../../components/cards/Freeform/FreeformGrid';
import { PostType } from '../../../graphql/posts';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { BlockIcon, MagicIcon, SparkleIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { AgentFeedItem } from '../hooks/useAgentFeed';

const noop = () => undefined;

const AgentFindingFooter = ({
  item,
  onDismiss,
}: {
  item: AgentFeedItem;
  onDismiss: (id: string) => void;
}): ReactElement => {
  const [isNoted, setNoted] = useState(false);

  return (
    <FlexCol className="relative z-1 mx-4 mb-4 gap-2 rounded-12 bg-surface-float p-3">
      <FlexRow className="items-center gap-2">
        <SparkleIcon size={IconSize.XSmall} className="text-brand-default" />
        <Typography type={TypographyType.Caption1} bold>
          {`${Math.round(item.score * 100)}% match`}
        </Typography>
      </FlexRow>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="line-clamp-3"
      >
        {item.rationale}
      </Typography>
      <FlexRow className="flex-wrap items-center gap-2">
        <Button
          icon={<MagicIcon />}
          size={ButtonSize.XSmall}
          variant={isNoted ? ButtonVariant.Subtle : ButtonVariant.Float}
          disabled={isNoted}
          onClick={() => setNoted(true)}
        >
          {isNoted ? 'Noted' : 'More like this'}
        </Button>
        <Button
          icon={<BlockIcon />}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          onClick={() => onDismiss(item.id)}
        >
          Not relevant
        </Button>
      </FlexRow>
      {isNoted && (
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          Applies on the next run
        </Typography>
      )}
    </FlexCol>
  );
};

export const AgentFindingCard = ({
  item,
  onDismiss,
}: {
  item: AgentFeedItem;
  onDismiss: (id: string) => void;
}): ReactElement => {
  const CardComponent =
    item.post.type === PostType.Freeform ? FreeformGrid : ArticleGrid;

  return (
    <CardComponent
      post={item.post}
      domProps={{ className: '!max-h-fit' }}
      onPostClick={noop}
      onPostAuxClick={noop}
      onUpvoteClick={noop}
      onDownvoteClick={noop}
      onCommentClick={noop}
      onBookmarkClick={noop}
      onCopyLinkClick={noop}
      onShare={noop}
    >
      <AgentFindingFooter item={item} onDismiss={onDismiss} />
    </CardComponent>
  );
};
