import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import type { Archive, ArchiveScopeType } from '../../graphql/archive';
import { getArchiveTitle, getArchiveUrlFromArchive } from '../../lib/archive';

interface ArchiveNavigationProps {
  prev?: Archive | null;
  next?: Archive | null;
  scopeType: ArchiveScopeType.Tag | ArchiveScopeType.Source;
  scopeId: string;
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

  const scope = { scopeType, scopeId };

  return (
    <nav
      aria-label="Archive navigation"
      className={classNames(
        'flex items-center justify-between gap-4',
        className,
      )}
    >
      {prev ? (
        <Link href={getArchiveUrlFromArchive(scope, prev)} prefetch={false}>
          <a className="group flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-3 transition-all duration-200 hover:border-border-subtlest-secondary hover:bg-surface-hover">
            <ArrowIcon
              className="-rotate-90 text-text-tertiary transition-colors group-hover:text-text-primary"
              size={IconSize.Small}
            />
            <span className="text-text-secondary transition-colors typo-callout group-hover:text-text-primary">
              {getArchiveTitle(prev)}
            </span>
          </a>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={getArchiveUrlFromArchive(scope, next)} prefetch={false}>
          <a className="group flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-3 transition-all duration-200 hover:border-border-subtlest-secondary hover:bg-surface-hover">
            <span className="text-text-secondary transition-colors typo-callout group-hover:text-text-primary">
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
