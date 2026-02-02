import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { Tool } from '../../lib/toolsMockData';
import { Image } from '../image/Image';
import { UpvoteIcon } from '../icons';
import { largeNumberFormat } from '../../lib';

export interface ToolCardProps {
  tool: Tool;
  className?: string;
}

export const ToolCard = ({ tool, className }: ToolCardProps): ReactElement => {
  const hasChildren = tool.children.length > 0;

  return (
    <Link href={`/tools/${tool.slug}`} passHref>
      <a
        className={classNames(
          'flex flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 transition-colors hover:border-border-subtlest-secondary',
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <Image
            className="size-12 rounded-12 object-cover"
            src={tool.image}
            alt={`${tool.name} logo`}
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-text-primary typo-title3">
              {tool.name}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-text-tertiary typo-footnote">
              <span className="flex items-center gap-1">
                <UpvoteIcon className="size-4" />
                {largeNumberFormat(tool.upvotes)}
              </span>
              {hasChildren && (
                <>
                  <span aria-hidden>·</span>
                  <span>{tool.children.length} tools</span>
                </>
              )}
            </div>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-text-secondary typo-callout">
          {tool.description}
        </p>
      </a>
    </Link>
  );
};
