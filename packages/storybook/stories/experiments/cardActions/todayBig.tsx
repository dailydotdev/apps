import type { ReactElement } from 'react';
import React from 'react';
import InteractionCounter from '@dailydotdev/shared/src/components/InteractionCounter';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { AnalyticsIcon } from '@dailydotdev/shared/src/components/icons/Analytics';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { DownvoteIcon } from '@dailydotdev/shared/src/components/icons/Downvote';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import type { ConceptContext } from './swap';

/**
 * Production's grid bar (ActionButtons v1) line for line — same order, same
 * QuaternaryButton markup, same counter classes and number format, same
 * container padding — with one change: 32px buttons and 20px icons, the size
 * before #6394 shrank them, instead of today's 24px / 16px.
 */
const size = ButtonSize.Small;
const icon = IconSize.XSmall;
const counter = 'tabular-nums typo-footnote';
const label = '!pl-0.5 pr-0.5';

export const TodayBigBar = ({ post, a }: ConceptContext): ReactElement => (
  // `py-0.5` instead of production's `py-1.5`: 32px buttons in the same 36px
  // row, so the card keeps its height.
  <div className="flex flex-row items-center justify-between py-0.5 pl-1 pr-2.5">
    <div className="flex flex-1 items-center justify-between">
      <QuaternaryButton
        id={`big-${post.id}-upvote`}
        labelClassName={label}
        className="btn-tertiary-avocado"
        color={ButtonColor.Avocado}
        variant={ButtonVariant.Tertiary}
        pressed={a.upvoted}
        onClick={a.toggleUpvote}
        size={size}
        aria-label="Upvote"
        icon={<UpvoteIcon secondary={a.upvoted} size={icon} />}
      >
        {a.upvotes > 0 && (
          <InteractionCounter className={counter} value={a.upvotes} />
        )}
      </QuaternaryButton>
      <QuaternaryButton
        id={`big-${post.id}-comment`}
        labelClassName={label}
        className="btn-tertiary-blueCheese"
        size={size}
        aria-label="Comments"
        icon={<DiscussIcon size={icon} />}
        onClick={a.noop}
      >
        {a.comments > 0 && (
          <InteractionCounter className={counter} value={a.comments} />
        )}
      </QuaternaryButton>
      <QuaternaryButton
        id={`big-${post.id}-downvote`}
        color={ButtonColor.Ketchup}
        variant={ButtonVariant.Tertiary}
        pressed={a.downvoted}
        onClick={a.toggleDownvote}
        size={size}
        aria-label="Downvote"
        icon={<DownvoteIcon secondary={a.downvoted} size={icon} />}
      />
      <QuaternaryButton
        id={`big-${post.id}-bookmark`}
        className="btn-tertiary-bun"
        color={ButtonColor.Bun}
        variant={ButtonVariant.Tertiary}
        pressed={a.bookmarked}
        onClick={a.toggleBookmark}
        size={size}
        aria-label="Bookmark"
        icon={<BookmarkIcon secondary={a.bookmarked} size={icon} />}
      />
      <QuaternaryButton
        id={`big-${post.id}-copy`}
        color={ButtonColor.Cabbage}
        variant={ButtonVariant.Tertiary}
        onClick={a.noop}
        size={size}
        aria-label="Copy link"
        icon={<LinkIcon size={icon} />}
      />
      {a.impressions > 0 && (
        <QuaternaryButton
          id={`big-${post.id}-impressions`}
          labelClassName={label}
          className="btn-tertiary-cheese"
          color={ButtonColor.Cheese}
          variant={ButtonVariant.Tertiary}
          onClick={a.noop}
          size={size}
          aria-label="Impressions"
          icon={<AnalyticsIcon size={icon} />}
        >
          <InteractionCounter className={counter} value={a.impressions} />
        </QuaternaryButton>
      )}
    </div>
  </div>
);
