import { ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';

interface PortalProps {
  children: ReactNode;
}

function Portal({ children }: PortalProps): ReturnType<typeof createPortal> {
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

  if (!container) {
    return null;
  }

  return createPortal(children, container);
}

export default Portal;
