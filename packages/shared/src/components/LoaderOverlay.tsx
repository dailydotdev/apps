import type { ReactElement } from 'react';
import React from 'react';
import type { LoaderProps } from './Loader';
import { Loader } from './Loader';

export function LoaderOverlay({ ...props }: LoaderProps): ReactElement {
  return (
    <div className="absolute inset-0 flex bg-overlay-secondary-white">
      <Loader className="m-auto h-6 w-6" {...props} />
    </div>
  );
}

export default LoaderOverlay;
