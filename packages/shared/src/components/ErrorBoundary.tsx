import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';

import NextError from 'next/error';
import { LogEvent } from '../lib/log';
import { getLogContextStatic } from '../contexts/LogContext';
import type { ErrorBoundaryFeature } from '../types';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  feature?: ErrorBoundaryFeature;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  // eslint-disable-next-line react/static-property-placement
  static contextType = getLogContextStatic();

  // eslint-disable-next-line react/static-property-placement
  context!: React.ContextType<ReturnType<typeof getLogContextStatic>>;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { logEvent } = this.context;
    const { feature } = this.props;

    if (!logEvent) {
      return;
    }

    logEvent({
      event_name: LogEvent.GlobalError,
      extra: JSON.stringify({
        msg: error.message,
        url: window.location.href,
        error,
        stack: errorInfo.componentStack,
        digest: errorInfo.digest,
        feature,
      }),
    });
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return <NextError statusCode={0} />;
    }

    return children;
  }
}
