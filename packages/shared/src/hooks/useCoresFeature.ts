import { useAuthContext } from '../contexts/AuthContext';
import { canAwardUser, hasAccessToCores } from '../lib/cores';
import { useIsSpecialUser } from './auth/useIsSpecialUser';
import { iOSSupportsCoresPurchase } from '../lib/ios';
import { isIOSNative } from '../lib/func';
import type { Squad, SourceMember } from '../graphql/sources';
import { SourceMemberRole } from '../graphql/sources';
import type { LoggedUser, UserShortProfile } from '../lib/user';
import { CoresRole } from '../lib/user';

const useCoresFeature = (): boolean => {
  const { user } = useAuthContext();

  return !!user && (user.coresRole ?? CoresRole.None) > CoresRole.None;
};

export const useHasAccessToCores = (): boolean => {
  const { user } = useAuthContext();

  const hasAccess = useCoresFeature();

  return hasAccess && !!user && hasAccessToCores(user);
};

interface UseCanAwardUserProps {
  sendingUser?: LoggedUser;
  receivingUser?: LoggedUser;
}

export const useCanAwardUser = (props: UseCanAwardUserProps): boolean => {
  const isSpecialUser = useIsSpecialUser({
    userId: props.receivingUser?.id ?? '',
  });

  const hasAccess = useCoresFeature();

  if (!props.sendingUser || !props.receivingUser) {
    return false;
  }

  const { sendingUser, receivingUser } = props;

  return (
    hasAccess && !isSpecialUser && canAwardUser({ sendingUser, receivingUser })
  );
};

interface UseGetSquadAwardAdminProps {
  sendingUser: LoggedUser;
  squad: Squad;
}

export const useGetSquadAwardAdmin = (
  props: UseGetSquadAwardAdminProps,
): UserShortProfile | null | undefined => {
  const hasAccess = useCoresFeature();

  if (
    props.squad.currentMember?.role === SourceMemberRole.Admin ||
    !hasAccess
  ) {
    return null;
  }

  // Return the first user that's eligible for cores
  return props.squad?.privilegedMembers?.find((receivingUser: SourceMember) => {
    if (receivingUser.role !== SourceMemberRole.Admin) {
      return false;
    }
    return canAwardUser({
      sendingUser: props.sendingUser,
      receivingUser: receivingUser.user as unknown as LoggedUser,
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
