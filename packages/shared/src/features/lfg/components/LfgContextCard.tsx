import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { getLfgUrl } from '../lib/format';

const cardClassName =
  'flex w-full flex-col gap-0.5 rounded-12 border-l-2 border-border-subtlest-secondary bg-surface-float px-3 py-2 text-left';

// Messages' DmContextCard frame, pointing at a post instead of a comment.
export const LfgContextCard = ({
  post,
  label,
  isLinked = true,
  className,
}: {
  post: { id: string; title: string };
  label: string;
  isLinked?: boolean;
  className?: string;
}): ReactElement => {
  const content = (
    <>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        truncate
      >
        {label}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        className="line-clamp-2 break-words"
      >
        {post.title}
      </Typography>
    </>
  );

  if (!isLinked) {
    return (
      <div className={classNames(cardClassName, className)}>{content}</div>
    );
  }

  const href = getLfgUrl(post.id);

  return (
    <Link href={href} passHref>
      <a
        href={href}
        className={classNames(
          cardClassName,
          'transition-colors hover:bg-surface-hover',
          className,
        )}
      >
        {content}
      </a>
    </Link>
  );
};
