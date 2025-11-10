import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../ElementPlaceholder';

export type EntityCardSkeletonProps = {
  className?: {
    container?: string;
    image?: string;
  };
};

const EntityCardSkeleton = ({
  className,
}: EntityCardSkeletonProps): ReactElement => {
  return (
    <div
      className={classNames(
        'rounded-16 border-border-subtlest-tertiary bg-background-popover flex w-80 flex-col items-center border p-4',
        className?.container,
      )}
      aria-busy
    >
      <div className="flex w-full items-start gap-2">
        <div className={classNames(className?.image, 'overflow-hidden')}>
          <ElementPlaceholder className="h-12 w-12 rounded-full" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ElementPlaceholder className="rounded-8 h-8 w-8" />
          <ElementPlaceholder className="rounded-8 h-8 w-8" />
        </div>
        <div />
      </div>
      <div className="mt-4 flex w-full flex-col gap-2">
        <ElementPlaceholder className="rounded-8 h-5 w-32" />
        <ElementPlaceholder className="rounded-6 h-4 w-24" />
      </div>
    </div>
  );
};

export default EntityCardSkeleton;
