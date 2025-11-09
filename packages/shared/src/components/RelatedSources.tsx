import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from './utilities/Link';
import type { Source } from '../graphql/sources';
import { ElementPlaceholder } from './ElementPlaceholder';

interface RelatedSourcesProps {
  title: string;
  isLoading: boolean;
  sources?: Source[];
  className?: string;
}
export const RelatedSources = ({
  title,
  isLoading,
  sources,
  className,
}: RelatedSourcesProps): ReactElement => {
  if (isLoading) {
    return (
      <div className={classNames('mb-10 w-auto', className)}>
        <ElementPlaceholder className="rounded-12 mb-3 h-10 w-1/5" />
        <div className="flex gap-2">
          <ElementPlaceholder className="rounded-16 w-24 px-4 py-3 text-center">
            <ElementPlaceholder className="mx-auto size-10 rounded-full" />
            <ElementPlaceholder className="rounded-8 mt-1.5 h-5 w-full" />
          </ElementPlaceholder>
        </div>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={classNames('mb-10 w-auto', className)}>
      <p className="typo-body mb-3 h-10 font-bold">{title}</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {sources.map((source) => {
          return (
            <Link
              href={source.permalink}
              passHref
              key={source.id}
              prefetch={false}
            >
              <a className="rounded-16 border-border-subtlest-tertiary flex w-24 flex-col border px-4 py-3 text-center">
                <img
                  src={source.image}
                  alt={`${source.name} logo`}
                  className="mx-auto size-10 rounded-full"
                />
                <p className="typo-callout mt-1.5 truncate font-bold">
                  {source.name}
                </p>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
