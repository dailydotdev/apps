import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { LeaderboardListContainerProps } from './common';
import { LeaderboardCard } from './common';
import Link from '../../utilities/Link';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';

interface TitleHeadingProps {
  title: string;
  titleHref?: string;
  className?: string;
}

const TitleHeading = ({
  title,
  titleHref,
  className,
}: TitleHeadingProps): ReactElement => (
  <h3 className={classNames('font-bold typo-title3', className)}>
    {titleHref ? (
      <Link href={titleHref} passHref prefetch={false}>
        <a className="flex w-fit items-center gap-1 hover:underline">
          {title}
          <ArrowIcon className="rotate-90" size={IconSize.XSmall} />
        </a>
      </Link>
    ) : (
      <>{title}</>
    )}
  </h3>
);

export function LeaderboardListContainer({
  children,
  className,
  title,
  titleHref,
  footer,
  header,
  titleAction,
}: LeaderboardListContainerProps): ReactElement {
  const defaultHeader = titleAction ? (
    <div className="mb-2 flex items-center justify-between gap-2">
      <TitleHeading title={title} titleHref={titleHref} />
      {titleAction}
    </div>
  ) : (
    <TitleHeading title={title} titleHref={titleHref} className="mb-2" />
  );

  return (
    <LeaderboardCard className={className}>
      {header ?? defaultHeader}
      <ol className="flex flex-col gap-1.5 typo-body">{children}</ol>
      {footer && <div className="mt-auto">{footer}</div>}
    </LeaderboardCard>
  );
}
