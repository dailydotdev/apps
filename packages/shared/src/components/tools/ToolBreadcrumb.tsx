import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { Tool } from '../../lib/toolsMockData';
import { AiIcon, HomeIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

export interface ToolBreadcrumbProps {
  toolPath: Tool[];
  className?: string;
}

export const ToolBreadcrumb = ({
  toolPath,
  className,
}: ToolBreadcrumbProps): ReactElement => {
  return (
    <nav
      aria-label="breadcrumbs"
      className={classNames(
        'hidden h-10 items-center gap-0.5 px-1.5 text-surface-secondary laptop:flex',
        className,
      )}
    >
      <ol className="flex flex-1 items-center gap-0.5">
        <li className="flex items-center gap-0.5">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<HomeIcon secondary />}
            tag="a"
            href={process.env.NEXT_PUBLIC_WEBAPP_URL}
            size={ButtonSize.XSmall}
          />
          <span aria-hidden>/</span>
        </li>
        <li className="flex items-center gap-0.5">
          <Link href="/tools" passHref>
            <a className="flex items-center gap-1 rounded-8 px-2 py-1 text-text-tertiary typo-callout hover:bg-surface-hover hover:text-text-primary">
              <AiIcon className="size-4" />
              <span>Tools</span>
            </a>
          </Link>
          {toolPath.length > 0 && <span aria-hidden>/</span>}
        </li>
        {toolPath.map((tool, index) => {
          const isLast = index === toolPath.length - 1;
          return (
            <li key={tool.id} className="flex items-center gap-0.5">
              {isLast ? (
                <span
                  className="px-2 py-1 font-bold text-text-primary typo-callout"
                  aria-current="page"
                >
                  {tool.name}
                </span>
              ) : (
                <>
                  <Link href={`/tools/${tool.slug}`} passHref>
                    <a className="rounded-8 px-2 py-1 text-text-tertiary typo-callout hover:bg-surface-hover hover:text-text-primary">
                      {tool.name}
                    </a>
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
