import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureInviteLedger } from '../../lib/featureManagement';
import { isInviteLedgerDebugEnabled } from './debug';

/**
 * Single source of truth for "is the Invite Ledger surface visible to this
 * user?". GrowthBook drives production rollout; the debug override lets us
 * review on Vercel previews where NODE_ENV !== 'development'.
 */
export const useInviteLedgerEnabled = (): boolean => {
  const { user } = useContext(AuthContext);
  const shouldEvaluate = !!user?.id;
  const { value } = useConditionalFeature({
    feature: featureInviteLedger,
    shouldEvaluate,
  });

  const [isDebugForced, setIsDebugForced] = useState(false);
  useEffect(() => {
    setIsDebugForced(isInviteLedgerDebugEnabled());
    const onChange = () => setIsDebugForced(isInviteLedgerDebugEnabled());
    window.addEventListener('invite-ledger:debug-change', onChange);
    return () => {
      window.removeEventListener('invite-ledger:debug-change', onChange);
    };
  }, []);

  return shouldEvaluate && (!!value || isDebugForced);
};
