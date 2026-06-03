import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from './ElementPlaceholder';
import Link from './utilities/Link';

export interface RelatedEntity {
  id?: string;
  image: string;
  imageAlt: string;
  name: string;
  permalink: string;
}

interface RelatedEntitiesProps {
  title: string;
  isLoading: boolean;
  items?: RelatedEntity[];
  className?: string;
}

export const RelatedEntities = ({
  title,
  isLoading,
  items,
  className,
}: RelatedEntitiesProps): ReactElement | null => {
  if (isLoading) {
    return (
      <div className={classNames('mb-10 w-auto', className)}>
        <ElementPlaceholder className="mb-3 h-10 w-1/5 rounded-12" />
        <div className="flex gap-2">
          <ElementPlaceholder className="rounded-16 px-4 py-3 text-center">
            <ElementPlaceholder className="mx-auto size-10 rounded-full" />
            <ElementPlaceholder className="mt-1.5 h-5 w-24 rounded-8" />
          </ElementPlaceholder>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={classNames('mb-10 w-auto', className)}>
      <p className="mb-3 h-10 font-bold typo-body">{title}</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {items.map((item) => {
          return (
            <Link href={item.permalink} passHref key={item.id} prefetch={false}>
              <a className="flex shrink-0 flex-col rounded-16 border border-border-subtlest-tertiary px-4 py-3 text-center">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="mx-auto size-10 rounded-full object-cover"
                />
                <p className="mt-1.5 whitespace-nowrap font-bold typo-callout">
                  {item.name}
                </p>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
