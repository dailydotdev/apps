import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import { Separator } from '../../../components/cards/common/common';
import { IconSize } from '../../../components/Icon';
import { EarthIcon } from '../../../components/icons/Earth';
import { TimerIcon } from '../../../components/icons/Timer';
import type { LfgPost } from '../types';
import { lfgCommitmentLabel, lfgKindLabel } from '../constants';
import { formatUtcOffset, getLfgUrl, lfgRelativeDays } from '../lib/format';
import { canReachOutToLfgPost, getLfgRowStatus } from '../lib/status';
import { LfgTagList } from './LfgTags';

const MetaItem = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <span className="flex min-w-0 items-center gap-1 text-text-tertiary typo-footnote">
    <span className="shrink-0">{icon}</span>
    <span className="truncate">{children}</span>
  </span>
);

export const getLfgPlace = (
  post: Pick<LfgPost, 'utcOffset' | 'showCountry' | 'country'>,
): string =>
  [
    typeof post.utcOffset === 'number' && formatUtcOffset(post.utcOffset),
    post.showCountry && post.country,
  ]
    .filter(Boolean)
    .join(' · ');

export const LfgPostMeta = ({
  post,
  className,
}: {
  post: Pick<LfgPost, 'utcOffset' | 'showCountry' | 'country' | 'commitment'>;
  className?: string;
}): ReactElement => {
  const place = getLfgPlace(post);

  return (
    <div className={classNames('flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      {place && (
        <MetaItem icon={<EarthIcon size={IconSize.Size16} />}>{place}</MetaItem>
      )}
      <MetaItem icon={<TimerIcon size={IconSize.Size16} />}>
        {lfgCommitmentLabel[post.commitment]}
      </MetaItem>
    </div>
  );
};

interface LfgRowProps {
  post: LfgPost;
  viewerId?: string;
  isLaunched: boolean;
  // A preview row doesn't link anywhere.
  isPreview?: boolean;
  onOpen?: () => void;
  onReachOut?: () => void;
}

// One post per row, with everything a reader needs to decide without
// opening it. The whole row opens the post; Reach out sits above the link.
export const LfgRow = ({
  post,
  viewerId,
  isLaunched,
  isPreview = false,
  onOpen,
  onReachOut,
}: LfgRowProps): ReactElement => {
  const status = getLfgRowStatus(post, viewerId, isLaunched);
  const href = getLfgUrl(post.id);

  return (
    <article className="relative flex items-start gap-3 py-4">
      {!isPreview && (
        <Link href={href} passHref>
          <a
            href={href}
            aria-label={`Open ${post.title}`}
            className="absolute inset-0"
            onClick={onOpen}
          />
        </Link>
      )}
      <ProfilePicture
        user={post.author}
        size={ProfileImageSize.XLarge}
        nativeLazyLoading
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
          truncate
        >
          {status && (
            <>
              <strong className="text-text-secondary">{status}</strong>
              <Separator />
            </>
          )}
          <strong className="text-text-secondary">{post.author.name}</strong>
          <Separator />
          {lfgKindLabel[post.kind]}
          <Separator />
          {lfgRelativeDays(post.createdAt)}
        </Typography>
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Body}
          bold
          className="line-clamp-2 break-words"
        >
          {post.title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="line-clamp-2 break-words"
        >
          {post.body}
        </Typography>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <LfgTagList tags={post.tags} />
          <LfgPostMeta post={post} />
        </div>
      </div>
      {onReachOut && canReachOutToLfgPost(post, viewerId, isLaunched) && (
        <Button
          type="button"
          className="relative z-1 shrink-0"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onReachOut}
        >
          Reach out
        </Button>
      )}
    </article>
  );
};
