import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { DiscussIcon, UpvoteIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { Image } from '../../../components/image/Image';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import type { Post } from '../../../graphql/posts';
import { postAttachment } from '../attachments';
import { AgentAddToChatButton } from './AgentAddToChatButton';

const Stat = ({
  icon,
  value,
}: {
  icon: ReactElement;
  value: number;
}): ReactElement => (
  <span className="inline-flex items-center gap-1">
    {icon}
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Tertiary}
      className="tabular-nums"
    >
      {value}
    </Typography>
  </span>
);

export const AgentPostCard = ({
  post,
  onOpen,
  isViewing,
}: {
  post: Post;
  onOpen: (post: Post) => void;
  isViewing: boolean;
}): ReactElement => (
  // The card is a container rather than a button so that "add to chat" can sit
  // inside it. The title carries the click for the whole card by stretching
  // over it, which keeps the accessible name on the words that describe it.
  <div
    className={classNames(
      'group relative flex w-full items-start gap-3 rounded-12 border p-2.5 text-left transition-colors',
      isViewing
        ? 'border-border-subtlest-secondary bg-surface-float'
        : 'border-border-subtlest-quaternary hover:bg-surface-float',
    )}
  >
    <FlexCol className="min-w-0 flex-1 gap-1.5">
      <FlexRow className="min-w-0 items-center gap-1.5">
        {post.source?.image && (
          <img
            src={post.source.image}
            alt={post.source.name ?? ''}
            loading="lazy"
            className="size-4 shrink-0 rounded-full object-cover"
          />
        )}
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          className="min-w-0 shrink truncate"
        >
          {post.source?.name}
        </Typography>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          className="shrink-0"
        >
          <DateFormat date={post.createdAt} type={TimeFormatType.Post} />
        </Typography>
      </FlexRow>
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Callout}
        bold
        className="!leading-snug"
      >
        <button
          type="button"
          onClick={() => onOpen(post)}
          className="line-clamp-2 w-full text-left after:absolute after:inset-0 after:rounded-12"
        >
          {post.title}
        </button>
      </Typography>
      <FlexRow className="items-center gap-3">
        <Stat
          icon={
            <UpvoteIcon
              size={IconSize.XXSmall}
              className="text-text-quaternary"
              secondary
            />
          }
          value={post.numUpvotes ?? 0}
        />
        <Stat
          icon={
            <DiscussIcon
              size={IconSize.XXSmall}
              className="text-text-quaternary"
              secondary
            />
          }
          value={post.numComments ?? 0}
        />
        {/* Lifted out of the title's layer, or the overlay that makes the whole
            card clickable would swallow the press. */}
        <AgentAddToChatButton
          attachment={postAttachment(post)}
          className="relative z-1 ml-auto opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        />
      </FlexRow>
    </FlexCol>
    <Image
      src={post.image}
      alt=""
      loading="lazy"
      fallbackSrc={cloudinaryPostImageCoverPlaceholder}
      className="size-16 shrink-0 rounded-10 object-cover"
    />
  </div>
);
