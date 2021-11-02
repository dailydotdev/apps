import React, { ReactElement } from 'react';
import { Loader, LoaderProps } from './Loader';

export function LoaderOverlay({ ...props }: LoaderProps): ReactElement {
  return (
    <div className="flex absolute inset-0 bg-overlay-secondary-white">
      <Loader className="m-auto w-6 h-6" {...props} />
    </div>
  );
}

export default LoaderOverlay;
