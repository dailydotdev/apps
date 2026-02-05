import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { cloudinaryAppIconMain } from '../lib/image';
import { Loader } from './Loader';

interface MobileAppLoaderProps {
  className?: string;
}

export function MobileAppLoader({
  className,
}: MobileAppLoaderProps): ReactElement {
  return (
    <div
      className={classNames(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background-default',
        className,
      )}
    >
      <img
        src={cloudinaryAppIconMain}
        alt="daily.dev"
        className="float-animation size-20 rounded-[22%]"
      />
      <Loader className="size-5" />
    </div>
  );
}
