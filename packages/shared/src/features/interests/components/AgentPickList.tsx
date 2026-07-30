import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ArrowIcon, DiscussIcon, UpvoteIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import type { Post } from '../../../graphql/posts';

const InlineStat = ({
  icon,
  value,
  ariaLabel,
}: {
  icon: ReactElement;
  value: number;
  ariaLabel: string;
}): ReactElement => (
  <span
    aria-label={ariaLabel}
    className="inline-flex items-center gap-1.5 px-1"
  >
    {icon}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
      className="tabular-nums"
    >
      {value}
    </Typography>
  </span>
);

const PickRow = ({
  post,
  onOpen,
}: {
  post: Post;
  onOpen: (post: Post) => void;
}): ReactElement => {
  const [isExpanded, setExpanded] = useState(false);
  const panelId = `agent-pick-${post.id}`;

  return (
    <li>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={classNames(
          'group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors tablet:px-5',
          !isExpanded && 'hover:bg-surface-float',
        )}
      >
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Body}
          bold
          color={TypographyColor.Primary}
          className="min-w-0 flex-1 !leading-snug"
        >
          {post.title}
        </Typography>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <InlineStat
            ariaLabel={`${post.numUpvotes ?? 0} upvotes`}
            icon={
              <UpvoteIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
                secondary
              />
            }
            value={post.numUpvotes ?? 0}
          />
          <InlineStat
            ariaLabel={`${post.numComments ?? 0} comments`}
            icon={
              <DiscussIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
                secondary
              />
            }
            value={post.numComments ?? 0}
          />
          {post.source?.image && (
            <span className="hidden items-center pl-1 tablet:inline-flex">
              <span className="overflow-hidden rounded-full border-2 border-background-default bg-surface-float">
                <img
                  src={post.source.image}
                  alt={post.source.name ?? ''}
                  loading="lazy"
                  className="size-4 object-cover"
                />
              </span>
            </span>
          )}
          <ArrowIcon
            size={IconSize.XSmall}
            className={classNames(
              'shrink-0 text-text-quaternary transition-transform duration-300 ease-out',
              isExpanded ? 'rotate-0' : 'rotate-180',
            )}
            aria-hidden
          />
        </div>
      </button>
      {isExpanded && (
        <div id={panelId} className="flex flex-col gap-3 px-4 pb-4 tablet:px-5">
          {post.summary && (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              className="!leading-relaxed"
            >
              {post.summary}
            </Typography>
          )}
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            className="w-fit"
            onClick={() => onOpen(post)}
          >
            Read more
          </Button>
        </div>
      )}
    </li>
  );
};

export const AgentPickList = ({
  posts,
  onOpen,
}: {
  posts: Post[];
  onOpen: (post: Post) => void;
}): ReactElement => (
  <ol className="divide-y divide-border-subtlest-quaternary overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default">
    {posts.map((post) => (
      <PickRow key={post.id} post={post} onOpen={onOpen} />
    ))}
  </ol>
);
