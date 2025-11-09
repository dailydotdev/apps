import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../ElementPlaceholder';

export interface PlaceholderCommentProps {
  className?: string;
  showContextHeader?: boolean;
}
export default function PlaceholderComment({
  className,
  showContextHeader,
}: PlaceholderCommentProps): ReactElement {
  return (
    <article
      aria-busy
      className={classNames('mt-4 flex flex-col items-stretch', className)}
    >
      {showContextHeader && (
        <ElementPlaceholder className="rounded-10 mb-4 h-4 w-2/5" />
      )}
      <div className="mb-2 flex items-center">
        <ElementPlaceholder className="rounded-10 h-10 w-10" />
        <div className="ml-2 flex h-8 flex-1 flex-col justify-between">
          <ElementPlaceholder className="rounded-12 h-3 w-2/5" />
          <ElementPlaceholder className="rounded-12 h-3 w-1/5" />
        </div>
      </div>
      <ElementPlaceholder className="rounded-10 mt-2 h-8 w-full" />
      <div className="mt-3 flex items-center gap-2">
        <ElementPlaceholder className=" rounded-10 size-8" />
        <ElementPlaceholder className=" rounded-10 size-8" />
        <ElementPlaceholder className=" rounded-10 size-8" />
        <ElementPlaceholder className=" rounded-10 size-8" />
      </div>
    </article>
  );
}
