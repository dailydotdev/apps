import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

export interface DealCrumb {
  name: string;
  path?: string;
}

interface DealBreadcrumbsProps {
  crumbs: DealCrumb[];
  className?: string;
}

export const DealBreadcrumbs = ({
  crumbs,
  className,
}: DealBreadcrumbsProps): ReactElement => (
  <Typography
    tag={TypographyTag.P}
    type={TypographyType.Footnote}
    color={TypographyColor.Quaternary}
    className={classNames('flex flex-wrap items-center gap-1', className)}
  >
    {crumbs.map(({ name, path }, index) => (
      <React.Fragment key={name}>
        {index > 0 && <span aria-hidden>/</span>}
        {path ? (
          <Link href={path} passHref>
            <a className="hover:text-text-primary">{name}</a>
          </Link>
        ) : (
          <span className="text-text-secondary">{name}</span>
        )}
      </React.Fragment>
    ))}
  </Typography>
);
