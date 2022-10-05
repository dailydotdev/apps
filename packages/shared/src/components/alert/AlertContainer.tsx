import React, { ReactElement, ReactNode } from 'react';
import { Alert, AlertBackground } from './common';

interface ClassName {
  container?: string;
  overlay?: string;
}

interface AlertContainerProps {
  children: ReactNode;
  className?: ClassName;
}

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
