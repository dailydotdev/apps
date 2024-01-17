import { ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';

interface PortalProps {
  children: ReactNode;
  container?: Element;
}

function Portal({
  children,
  container,
}: PortalProps): ReturnType<typeof createPortal> {
  const { isCompanion } = useRequestProtocol();

  const defaultContainer = useMemo(() => {
    if (typeof globalThis?.document === 'undefined') {
      return null;
    }

    if (isCompanion) {
      return getCompanionWrapper();
    }

    return globalThis?.document?.body;
  }, [isCompanion]);

  const portalContainer = container || defaultContainer;

  if (!portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}

export default Portal;
