import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type { LfgPost } from '../types';
import { getLfgReachOutUrl, getLfgUrl, lfgDaysLeft } from '../lib/format';

export const LfgYourPostCard = ({
  post,
  label,
  showBoardLink = false,
  className,
}: {
  post: LfgPost;
  label: ReactNode;
  showBoardLink?: boolean;
  className?: string;
}): ReactElement => {
  const waiting = post.pendingCount ?? 0;
  const daysLeft = lfgDaysLeft(post.expiresAt);

  return (
    <div
      className={classNames(
        'flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3',
        className,
      )}
    >
      {label}
      <Link href={getLfgUrl(post.id)} passHref>
        <a href={getLfgUrl(post.id)} className="flex flex-col">
          <Typography type={TypographyType.Callout} bold truncate>
            {post.title}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
          >
            {waiting ? `${waiting} waiting` : 'No responses yet'} · {daysLeft}{' '}
            {daysLeft === 1 ? 'day' : 'days'} left
          </Typography>
        </a>
      </Link>
      {(waiting > 0 || showBoardLink) && (
        <div className="flex gap-2">
          {waiting > 0 && (
            <Link href={getLfgReachOutUrl()} passHref>
              <Button
                tag="a"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
              >
                Review {waiting}
              </Button>
            </Link>
          )}
          {showBoardLink && (
            <Link href={getLfgUrl()} passHref>
              <Button
                tag="a"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
              >
                Board
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
