import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { ListCard } from '../common/list/ListCard';
import type { PlaceholderProps } from './common/common';

export const SignalPlaceholderList = forwardRef(function SignalPlaceholderList(
  { className, ...props }: PlaceholderProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <ListCard
      aria-busy
      {...props}
      ref={ref}
      className={classNames(
        '!rounded-none !border-x-0 !px-4 !py-3 first:!border-t-0',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ElementPlaceholder className="h-4 w-24 rounded-8" />
          <ElementPlaceholder className="h-4 w-10 rounded-8" />
        </div>
        <ElementPlaceholder className="h-5 w-[82%] rounded-8" />
        <ElementPlaceholder className="h-5 w-[68%] rounded-8" />
        <ElementPlaceholder className="mt-1 h-4 w-[95%] rounded-8" />
        <ElementPlaceholder className="h-4 w-[84%] rounded-8" />
        <div className="mt-2 flex items-center justify-between">
          <ElementPlaceholder className="h-4 w-10 rounded-8" />
          <ElementPlaceholder className="h-4 w-10 rounded-8" />
          <ElementPlaceholder className="h-4 w-4 rounded-full" />
          <ElementPlaceholder className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </ListCard>
  );
});
