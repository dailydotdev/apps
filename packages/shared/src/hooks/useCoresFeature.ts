import { useConditionalFeature } from './useConditionalFeature';
import { featureCores } from '../lib/featureManagement';
import { useAuthContext } from '../contexts/AuthContext';
import { canAwardUser, hasAccessToCores } from '../lib/cores';
import type { PropsParameters } from '../types';
import { useIsSpecialUser } from './auth/useIsSpecialUser';
import { isIOSNative } from '../lib/func';

const useCoresFeature = (): boolean => {
  const { user } = useAuthContext();

  const { value: hasAccess } = useConditionalFeature({
    feature: featureCores,
    shouldEvaluate: !!user && user.coresRole > 0,
  });

  return hasAccess;
};

export const useHasAccessToCores = (): boolean => {
  const { user } = useAuthContext();

  const hasAccess = useCoresFeature();

  return hasAccess && hasAccessToCores(user);
};

export const useCanAwardUser = (
  props: PropsParameters<typeof canAwardUser>,
): boolean => {
  const isSpecialUser = useIsSpecialUser({ userId: props.receivingUser?.id });

  const hasAccess = useCoresFeature();

  return hasAccess && !isSpecialUser && canAwardUser(props);
};

export const useCanPurchaseCores = (): boolean => {
  return useHasAccessToCores() && !isIOSNative();
};
