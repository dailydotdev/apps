import React, { ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';

interface ClassName {
  container?: string;
  overlay?: string;
}

interface AlertContainerProps {
  children: ReactNode;
  className?: ClassName;
}

export const AlertBackground = classed(
  'div',
  'absolute inset-0 -z-1 w-full h-full opacity-24',
);

export const Alert = classed('div', 'relative p-4 border rounded-8');

function AlertContainer({
  children,
  className = {},
}: AlertContainerProps): ReactElement {
  return (
    <Alert className={className?.container}>
      <AlertBackground />
      {children}
    </Alert>
  );
}

export default AlertContainer;
