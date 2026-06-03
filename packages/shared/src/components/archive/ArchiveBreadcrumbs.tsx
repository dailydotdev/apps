import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { HomeIcon } from '../icons';
import Link from '../utilities/Link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ArchiveBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function ArchiveBreadcrumbs({
  items,
  className,
}: ArchiveBreadcrumbsProps): ReactElement {
  return (
    <nav
      aria-label="breadcrumbs"
      className={classNames('flex h-10 items-center gap-0.5 px-1.5', className)}
    >
      <ol className="flex flex-1 items-center gap-0.5">
        <li className="flex flex-row items-center gap-0.5">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<HomeIcon secondary />}
            tag="a"
            href={process.env.NEXT_PUBLIC_WEBAPP_URL}
            size={ButtonSize.XSmall}
          />
          <span className="text-text-quaternary" aria-hidden>
            /
          </span>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={item.label}
              className="flex flex-row items-center gap-0.5"
              {...(isLast ? { 'aria-current': 'page' } : {})}
            >
              {item.href && !isLast ? (
                <Link href={item.href} prefetch={false}>
                  <a className="px-2 text-text-tertiary transition-colors typo-callout hover:text-text-primary">
                    {item.label}
                  </a>
                </Link>
              ) : (
                <span className="px-2 font-bold text-text-primary typo-callout">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-text-quaternary" aria-hidden>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
