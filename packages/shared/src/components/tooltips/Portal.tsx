import React, { ReactElement, ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';

interface PortalProps {
  children: ReactNode;
  container: Element;
}

export const Portal = ({
  children,
  container,
}: PortalProps): ReturnType<typeof createPortal> => {
  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

export const RootPortal = ({
  children,
}: Pick<PortalProps, 'children'>): ReactElement => {
  const { isCompanion } = useRequestProtocol();

  const container = useMemo(() => {
    if (typeof globalThis?.document === 'undefined') {
      return null;
    }

    if (isCompanion) {
      return getCompanionWrapper();
    }

    return globalThis?.document?.body;
  }, [isCompanion]);

  return <Portal container={container}>{children}</Portal>;
};
