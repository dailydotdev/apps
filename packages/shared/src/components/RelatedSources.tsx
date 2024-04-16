import React, { ReactElement } from 'react';
import Link from 'next/link';
import { Source } from '../graphql/sources';
import { ElementPlaceholder } from './ElementPlaceholder';

interface RelatedSourcesProps {
  title: string;
  isLoading: boolean;
  sources: Source[];
}
export const RelatedSources = ({
  title,
  isLoading,
  sources,
}: RelatedSourcesProps): ReactElement => {
  if (isLoading) {
    return (
      <div className="mb-10 w-full">
        <ElementPlaceholder className="mb-3 h-10 w-1/5 rounded-12" />
        <div className="flex gap-2">
          <ElementPlaceholder className="w-24 rounded-16 px-4 py-3 text-center">
            <ElementPlaceholder className="mx-auto size-10 rounded-full" />
            <ElementPlaceholder className="mt-1.5 h-5 w-full rounded-8" />
          </ElementPlaceholder>
        </div>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 w-full">
      <p className="mb-3 h-10 font-bold typo-body">{title}</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {sources.map((source) => {
          return (
            <Link
              href={source.permalink}
              passHref
              key={source.id}
              prefetch={false}
            >
              <a className="flex w-24 flex-col rounded-16 border border-border-subtlest-tertiary px-4 py-3 text-center">
                <img
                  src={source.image}
                  alt={`${source.name} logo`}
                  className="mx-auto size-10 rounded-full"
                />
                <p className="mt-1.5 truncate font-bold typo-callout">
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
