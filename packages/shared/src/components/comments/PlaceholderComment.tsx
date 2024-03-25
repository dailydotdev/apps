import React, { ReactElement } from 'react';
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
        <ElementPlaceholder className="mb-4 h-4 w-2/5 rounded-10" />
      )}
      <div className="mb-2 flex items-center">
        <ElementPlaceholder className="h-10 w-10 rounded-10" />
        <div className="ml-2 flex h-8 flex-1 flex-col justify-between">
          <ElementPlaceholder className="h-3 w-2/5 rounded-12" />
          <ElementPlaceholder className="h-3 w-1/5 rounded-12" />
        </div>
      </div>
      <ElementPlaceholder className="mt-2 h-8 w-full rounded-10" />
      <div className="mt-3 flex items-center gap-2">
        <ElementPlaceholder className=" size-8 rounded-10" />
        <ElementPlaceholder className=" size-8 rounded-10" />
        <ElementPlaceholder className=" size-8 rounded-10" />
        <ElementPlaceholder className=" size-8 rounded-10" />
      </div>
    </article>
  );
}
