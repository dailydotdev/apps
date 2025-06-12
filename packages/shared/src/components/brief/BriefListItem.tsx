import React, { Fragment } from 'react';
import type { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BriefGradientIcon } from '../icons/BriefGradient';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { PillProps } from '../Pill';
import { Pill } from '../Pill';
import { IconSize } from '../Icon';
import { LockIcon } from '../icons';
import { briefingUrl } from '../../lib/constants';

export type BriefListItemProps = {
  briefId: string;
  className?: string;
  title: ReactNode;
  pill?: Omit<PillProps, 'className'>;
  readTime?: string;
  postsCount?: number;
  sourcesCount?: number;
  isRead?: boolean;
  isLocked?: boolean;
};

export const BriefListItem = ({
  briefId,
  className,
  title,
  pill,
  readTime,
  postsCount,
  sourcesCount,
  isRead,
  isLocked,
}: BriefListItemProps): ReactElement => {
  const router = useRouter();

  return (
    <Link
      href={`${briefingUrl}/${briefId}`}
      onClick={(event) => {
        if (router?.pathname === briefingUrl) {
          event.preventDefault();

          // mask and open modal if on briefing page
          router?.push(
            `${briefingUrl}?id=${briefId}`,
            `${briefingUrl}/${briefId}`,
          );
        }
      }}
    >
      <article
        className={classNames(
          'flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-3',
          className,
        )}
      >
        <div className="flex items-center">
          <BriefGradientIcon secondary={!isRead} size={IconSize.Size48} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Typography
              type={TypographyType.Title3}
              bold
              color={
                isRead ? TypographyColor.Quaternary : TypographyColor.Primary
              }
            >
              {title}
            </Typography>
            {!!pill && (
              <Pill
                {...pill}
                className="invert !self-auto bg-accent-bacon-default py-0.5 text-text-primary"
              />
            )}
            {isLocked && (
              <LockIcon
                className="text-text-quaternary"
                size={IconSize.Small}
              />
            )}
          </div>
          <div className="flex">
            <Typography
              className="flex flex-row gap-2"
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              {[
                readTime && (
                  <Typography
                    tag={TypographyTag.Span}
                    key="read-time"
                    color={TypographyColor.Primary}
                  >
                    {readTime} read time
                  </Typography>
                ),
                postsCount && `${postsCount} posts`,
                sourcesCount && `${sourcesCount} sources`,
              ]
                .filter(Boolean)
                .map((item, index) => {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={index}>
                      {index > 0 ? ' • ' : undefined}
                      {item}
                    </Fragment>
                  );
                })}
            </Typography>
          </div>
        </div>
      </article>
    </Link>
  );
};
