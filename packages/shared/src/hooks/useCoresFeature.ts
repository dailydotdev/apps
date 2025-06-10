import { useConditionalFeature } from './useConditionalFeature';
import { featureCores } from '../lib/featureManagement';
import { useAuthContext } from '../contexts/AuthContext';
import { canAwardUser, hasAccessToCores } from '../lib/cores';
import type { PropsParameters } from '../types';
import { useIsSpecialUser } from './auth/useIsSpecialUser';
import { iOSSupportsCoresPurchase } from '../lib/ios';
import { isIOSNative } from '../lib/func';
import { SourceMemberRole } from '../graphql/sources';
import type LoggedUser from '../../__tests__/fixture/loggedUser';

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

export const useGetSquadAwardAdmin = (props): typeof LoggedUser => {
  const hasAccess = useCoresFeature();

  if (
    props.squad.currentMember?.role === SourceMemberRole.Admin ||
    !hasAccess
  ) {
    return null;
  }

  // Return the first user that's eligible for cores
  return props.squad.privilegedMembers.find((receivingUser) => {
    if (receivingUser.role !== SourceMemberRole.Admin) {
      return false;
    }
    return canAwardUser({
      sendingUser: props.sendingUser,
      receivingUser: receivingUser.user,
    });
  })?.user;
};

export const useCanPurchaseCores = (): boolean => {
  const hasAccess = useHasAccessToCores();

  if (!hasAccess) {
    return false;
  }

  if (isIOSNative()) {
    return iOSSupportsCoresPurchase();
  }

  return true;
};
