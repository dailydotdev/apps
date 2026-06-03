import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import type { Archive } from '../../graphql/archive';
import type { ArchiveScopeInfo } from '../../lib/archive';
import { getArchiveTitle, getArchiveUrlFromArchive } from '../../lib/archive';

interface ArchiveNavigationProps {
  scopeType: ArchiveScopeInfo['scopeType'];
  scopeId?: string;
  prev?: Archive | null;
  next?: Archive | null;
  className?: string;
}

export function ArchiveNavigation({
  prev,
  next,
  scopeType,
  scopeId,
  className,
}: ArchiveNavigationProps): ReactElement | null {
  if (!prev && !next) {
    return null;
  }

  const scope = { scopeType, scopeId } as ArchiveScopeInfo;

  return (
    <nav
      aria-label="Archive navigation"
      className={classNames(
        'flex flex-wrap items-center justify-between gap-3 tablet:gap-4',
        className,
      )}
    >
      {prev ? (
        <Link href={getArchiveUrlFromArchive(scope, prev)} prefetch={false}>
          <a className="group flex items-center gap-1.5 rounded-12 border border-border-subtlest-tertiary px-3 py-2 transition-all duration-200 hover:border-border-subtlest-secondary hover:bg-surface-hover tablet:gap-2 tablet:px-4 tablet:py-3">
            <ArrowIcon
              className="-rotate-90 text-text-tertiary transition-colors group-hover:text-text-primary"
              size={IconSize.Small}
            />
            <span className="text-text-secondary transition-colors typo-footnote group-hover:text-text-primary tablet:typo-callout">
              {getArchiveTitle(prev)}
            </span>
          </a>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={getArchiveUrlFromArchive(scope, next)} prefetch={false}>
          <a className="group flex items-center gap-1.5 rounded-12 border border-border-subtlest-tertiary px-3 py-2 transition-all duration-200 hover:border-border-subtlest-secondary hover:bg-surface-hover tablet:gap-2 tablet:px-4 tablet:py-3">
            <span className="text-text-secondary transition-colors typo-footnote group-hover:text-text-primary tablet:typo-callout">
              {getArchiveTitle(next)}
            </span>
            <ArrowIcon
              className="rotate-90 text-text-tertiary transition-colors group-hover:text-text-primary"
              size={IconSize.Small}
            />
          </a>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
