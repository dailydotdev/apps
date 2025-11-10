import type { ReactElement } from 'react';
import React from 'react';
import type { LoaderProps } from './Loader';
import { Loader } from './Loader';

export function LoaderOverlay({ ...props }: LoaderProps): ReactElement {
  return (
    <div className="bg-overlay-secondary-white absolute inset-0 flex">
      <Loader className="m-auto h-6 w-6" {...props} />
    </div>
  );
}

export default LoaderOverlay;
