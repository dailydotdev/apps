import React, { ReactElement, ReactNode } from 'react';
import { Alert, AlertBackground } from './common';

interface ClassName {
  container?: string;
  overlay?: string;
}

interface AlertBannerProps {
  children: ReactNode;
  className?: ClassName;
}

function AlertBanner({
  children,
  className = {},
}: AlertBannerProps): ReactElement {
  return (
    <Alert className={className?.container}>
      <AlertBackground />
      {children}
    </Alert>
  );
}

export default AlertBanner;
