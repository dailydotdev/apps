import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';

import NextError from 'next/error';
import LogContext from '../contexts/LogContext';
import { LogEvent } from '../lib/log';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  // eslint-disable-next-line react/static-property-placement
  static contextType = LogContext;

  // eslint-disable-next-line react/static-property-placement
  context!: React.ContextType<typeof LogContext>;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { logEvent } = this.context;

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
      }),
    });
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <NextError statusCode={0} />;
    }

    return children;
  }
}
