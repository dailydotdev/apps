import { Component, ErrorInfo, ReactNode } from 'react';

import LogContext from './contexts/LogContext';
import { LogEvent } from './lib/log';

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

  static getDerivedStateFromError(): void {}

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
    const { children } = this.props;

    return children;
  }
}
