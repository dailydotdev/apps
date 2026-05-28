import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';

interface RailHoverRowProps {
  href: string;
  icon: ReactNode;
  label: string;
  trailing?: ReactNode;
}

// Shared row used by v2 rail hover cards (Notifications, Game Center,
// …) so every panel uses the same row layout, hover affordance, and
// active-state highlight when the user is already on that destination.
export const RailHoverRow = ({
  href,
  icon,
  label,
  trailing,
}: RailHoverRowProps): ReactElement => {
  const router = useRouter();
  const currentPath = (router.asPath ?? router.pathname ?? '').split('?')[0];
  const targetPath = href.replace(/^https?:\/\/[^/]+/, '');
  const isActive = currentPath === targetPath;

  return (
    <Link href={href} passHref>
      <a
        className={classNames(
          'focus-outline flex h-9 items-center gap-3 rounded-10 px-2 transition-colors typo-callout',
          'hover:bg-surface-hover hover:text-text-primary',
          isActive
            ? 'bg-surface-hover text-text-primary'
            : 'text-text-tertiary',
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center">
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
        {trailing}
      </a>
    </Link>
  );
};
