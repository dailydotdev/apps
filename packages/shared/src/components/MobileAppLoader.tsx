import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import LogoIcon from '../svg/LogoIcon';
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
        'z-50 fixed inset-0 flex flex-col items-center justify-center gap-6 bg-background-default',
        className,
      )}
    >
      <div className="float-animation rounded-14 bg-surface-float p-4">
        <LogoIcon className={{ container: 'h-12 w-auto' }} />
      </div>
      <Loader className="h-5 w-5" />
    </div>
  );
}
